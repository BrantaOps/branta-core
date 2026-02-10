import { Address } from './app/shared/models/address';
import { AddressClipboardItem } from './app/shared/models/clipboard-item';
import { Bolt11Details } from './app/shared/models/lightning';
import { Vault } from './app/shared/models/vault.model';
import { Wallet } from './app/shared/models/wallet.model';

declare global {
    interface Window {
        electron: {
            platform: () => string;
            onClipboardUpdate: (callback: (text: string) => void) => void;
            storeData: (name: string, data: Object[]) => Promise<void>;
            retrieveData: (name: string) => Promise<Object[]>;
            nostrSyncPush: (nsec: string) => Promise<{
                eventId: string;
                publishedTo: string[];
                failed: { relay: string; error: string }[];
            }>;
            nostrSyncPull: (nsec: string) => Promise<
                | { found: false }
                | {
                      found: true;
                      relay: string;
                      eventId: string;
                      updated_at: string;
                      walletCount: number;
                      historyCount: number;
                  }
            >;
            verifyAddress: (data: Wallet[], address: string) => Promise<AddressClipboardItem>;
            verifyXpub: (xpub: string) => Promise<boolean>;
            showNotification: (title: string, body: string) => Promise<void>;
            openUrl: (url: string) => void;
            onVaultCreated: (callback: (vault: Vault) => void) => void;
            getAllAddresses: (wallet: Wallet, i: number) => Promise<Address[]>;
            decodeLightning: (payment: string) => Promise<Bolt11Details>;
        };
    }
}

export { };
