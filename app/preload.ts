import { clipboard, contextBridge, ipcRenderer } from 'electron';
import { Vault } from '../src/app/shared/models/vault.model';
import { Wallet } from '../src/app/shared/models/wallet.model';

contextBridge.exposeInMainWorld('electron', {
    platform: () => process.platform,
    onClipboardUpdate: (callback: any) => ipcRenderer.on('clipboard-updated', (_event: any, text: string) => callback(text)),
    clipboard: {
        writeText: (text: string) => clipboard.writeText(text)
    },
    storeData: (name: string, data: Object[]) => ipcRenderer.invoke('store-data', name, data),
    retrieveData: (name: string) => ipcRenderer.invoke('retrieve-data', name),
    verifyAddress: (wallets: Wallet[], address: string) => ipcRenderer.invoke('verify-address', wallets, address),
    verifyXpub: (xpub: string) => ipcRenderer.invoke('verify-xpub', xpub),
    showNotification: (title: string, body: string) => ipcRenderer.invoke('show-notification', title, body),
    openUrl: (url: string) => ipcRenderer.invoke('open-url', url),
    onVaultCreated: (callback: any) => ipcRenderer.on('vault-created', (_event: any, vault: Vault) => callback(vault)),
    getAllAddresses: (wallet: Wallet, i: number) => ipcRenderer.invoke('get-all-addresses', wallet, i),
    decodeLightning: (payment: string) => ipcRenderer.invoke('decode-lightning', payment)
});
