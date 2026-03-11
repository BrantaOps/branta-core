import nostr from 'nostr-tools';  export function syncPreferences(nsec, wallets, history) {
  const relay = 'wss://relay.damus.io';
  const event = {
    kind: 4,
    content: JSON.stringify({ wallets, history }),
    created_at: Math.floor(Date.now() / 1000),
  };
  event.pubkey = nostr.getPublicKey(nsec);
  const signedEvent = nostr.signEvent(event, nsec);
  nostr.sendEvent(relay, signedEvent);
};
