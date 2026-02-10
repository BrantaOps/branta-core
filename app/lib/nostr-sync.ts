import { Relay, finalizeEvent, getPublicKey, nip04, nip19, type Event, type EventTemplate } from 'nostr-tools';

const BRANTA_SYNC_KIND = 30078;
const BRANTA_SYNC_D_TAG = 'branta-sync-v1';

// Keep the default list short and high-availability. Users can still add their own later.
const DEFAULT_RELAYS = [
    'wss://nos.lol',
    'wss://relay.damus.io',
    'wss://relay.primal.net'
];

export type BrantaSyncPayloadV1 = {
    version: 1;
    updated_at: string; // ISO8601
    wallets: Object[];
    history: Object[];
};

export type PushResult = {
    eventId: string;
    publishedTo: string[];
    failed: { relay: string; error: string }[];
};

export type PullResult =
    | { found: false }
    | {
          found: true;
          relay: string;
          eventId: string;
          payload: BrantaSyncPayloadV1;
      };

function decodeNsecToSecretKey(nsec: string): Uint8Array {
    const decoded = nip19.decode(nsec.trim());
    if (decoded.type !== 'nsec') {
        throw new Error('Expected nsec');
    }
    return decoded.data as Uint8Array;
}

async function connectRelay(url: string): Promise<Relay> {
    // nostr-tools Relay class handles reconnect internally, but for this PoC we just connect once.
    const relay = await Relay.connect(url);
    return relay;
}

async function list(relay: Relay, filters: any[]): Promise<Event[]> {
    return await new Promise((resolve) => {
        const events: Event[] = [];
        const sub = relay.subscribe(filters, {
            onevent: (evt) => {
                events.push(evt);
            },
            oneose: () => {
                sub.close();
                resolve(events);
            },
            onclose: (_reason) => {
                resolve(events);
            },
            eoseTimeout: 3500
        });
        sub.fire();
    });
}

export async function pushBrantaDataViaNostr(nsec: string, wallets: Object[], history: Object[], relays = DEFAULT_RELAYS) {
    const sk = decodeNsecToSecretKey(nsec);
    const pubkey = getPublicKey(sk);

    const payload: BrantaSyncPayloadV1 = {
        version: 1,
        updated_at: new Date().toISOString(),
        wallets,
        history
    };

    // Encrypt to self so only the nsec owner can decrypt.
    const ciphertext = await nip04.encrypt(sk, pubkey, JSON.stringify(payload));

    const draft: EventTemplate = {
        kind: BRANTA_SYNC_KIND,
        created_at: Math.floor(Date.now() / 1000),
        tags: [
            ['d', BRANTA_SYNC_D_TAG],
            ['alt', 'Branta encrypted sync payload (wallets + history)']
        ],
        content: ciphertext
    };

    const event = finalizeEvent(draft, sk);

    const publishedTo: string[] = [];
    const failed: { relay: string; error: string }[] = [];

    // Best-effort publish to multiple relays.
    for (const relayUrl of relays) {
        try {
            const relay = await connectRelay(relayUrl);
            await relay.publish(event);
            relay.close();
            publishedTo.push(relayUrl);
        } catch (e: any) {
            failed.push({ relay: relayUrl, error: String(e?.message ?? e) });
        }
    }

    if (publishedTo.length === 0) {
        throw new Error(`Failed to publish to any relay. Last error: ${failed[failed.length - 1]?.error ?? 'unknown'}`);
    }

    const result: PushResult = {
        eventId: event.id,
        publishedTo,
        failed
    };

    return result;
}

export async function pullBrantaDataViaNostr(nsec: string, relays = DEFAULT_RELAYS): Promise<PullResult> {
    const sk = decodeNsecToSecretKey(nsec);
    const pubkey = getPublicKey(sk);

    // Query relays until we find the latest payload.
    for (const relayUrl of relays) {
        try {
            const relay = await connectRelay(relayUrl);

            const events = await list(relay, [
                {
                    kinds: [BRANTA_SYNC_KIND],
                    authors: [pubkey],
                    '#d': [BRANTA_SYNC_D_TAG],
                    limit: 1
                }
            ]);

            relay.close();

            const latest = events?.[0];
            if (!latest) {
                continue;
            }

            const plaintext = await nip04.decrypt(sk, pubkey, latest.content);
            const parsed = JSON.parse(plaintext) as BrantaSyncPayloadV1;

            // Minimal sanity checks for PoC safety.
            if (parsed?.version !== 1 || !Array.isArray(parsed.wallets) || !Array.isArray(parsed.history)) {
                throw new Error('Invalid payload format');
            }

            return {
                found: true,
                relay: relayUrl,
                eventId: latest.id,
                payload: parsed
            };
        } catch (_e) {
            // Ignore and try next relay for PoC.
            continue;
        }
    }

    return {
        found: false
    };
}
