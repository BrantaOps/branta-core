import { AddressClipboardItem } from './app/shared/models/clipboard-item';
import { Vault } from './app/shared/models/vault.model';
import { Wallet } from './app/shared/models/wallet.model';

declare global {
    interface Window {
        electron: {
            platform: () => string;
            onClipboardUpdate: (callback: (text: string) => void) => void;
            storeData: (name: string, data: Object[]) => Promise<void>;
            retrieveData: (name: string) => Promise<Object[]>;
            verifyAddress: (data: Wallet[], address: string) => Promise<AddressClipboardItem>;
            verifyXpub: (xpub: string) => Promise<boolean>;
            showNotification: (title: string, body: string) => Promise<void>;
            openUrl: (url: string) => void;
            onVaultCreated: (callback: (vault: Vault) => void) => void;
        };
    }
}

export {};
