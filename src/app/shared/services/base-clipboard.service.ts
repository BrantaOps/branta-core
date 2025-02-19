import { lastValueFrom } from 'rxjs';
import { AddressClipboardItem, Bolt11ClipboardItem, ClipboardItem, PaymentClipboardItem } from '../models/clipboard-item';
import { ExtendedKeyRegExp, NostrPubKeyRegExp, NostrPrivateKeyRegExp, LightningAddressRegExp, isBitcoinAddress } from './regex';
import { Vault } from '../models/vault.model';
import { ServerService } from './server.service';
import { Wallet } from '../models/wallet.model';
import { Settings } from '../models/settings';

export class BaseClipboardService {
    public static async getClipboardItem(
        text: string,
        notify: boolean,
        vaults: Vault[],
        wallets: Wallet[],
        settings: Settings,
        serverService: ServerService
    ): Promise<ClipboardItem | null> {
        if (text == '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa') {
            if (settings?.generalNotifications.bitcoinAddress && notify) {
                await window.electron.showNotification('Bitcoin genesis block address copied.', 'We are all Satoshi');
            }

            return {
                name: 'Bitcoin Address: Genesis Block',
                value: text,
                address: text,
                wallet: null,
                derivationPath: null,
                private: false
            } as AddressClipboardItem;
        }

        if (isBitcoinAddress(text)) {
            const vault = await window.electron.verifyAddress(vaults, text);

            if (vault) {
                if (settings?.generalNotifications.bitcoinAddress && notify) {
                    await window.electron.showNotification('BTC address: ' + vault.wallet?.name, 'Derivation: ' + vault.derivationPath);
                }

                return vault;
            }

            const wallet = await window.electron.verifyAddress(wallets, text);

            // Found the users wallet
            if (wallet) {
                if (settings?.generalNotifications.bitcoinAddress && notify) {
                    await window.electron.showNotification('BTC address: ' + wallet.wallet?.name, 'Derivation: ' + wallet.derivationPath);
                }

                return wallet;
            }
            // Didn't find the users wallet
            else {
                if (settings?.checkoutMode) {
                    const paymentItem = await this.queryPayments(text, serverService);

                    if (paymentItem) {
                        if (notify) {
                            await window.electron.showNotification(paymentItem.merchant, paymentItem.description ?? '');
                        }

                        return paymentItem;
                    }
                }

                if (settings?.generalNotifications.bitcoinAddress && notify) {
                    await window.electron.showNotification('New Bitcoin Address in Clipboard', 'Bitcoin Address Detected.');
                }

                return {
                    name: 'Bitcoin Address',
                    value: text,
                    address: text,
                    wallet: null,
                    derivationPath: null,
                    private: false
                } as AddressClipboardItem;
            }
        }

        if (ExtendedKeyRegExp.test(text)) {
            if (settings?.generalNotifications.bitcoinPublicKey && notify) {
                await window.electron.showNotification('Bitcoin Extended Public Key in Clipboard.', 'Sharing can lead to loss of privacy.');
            }
            return {
                name: 'Extended Public Key',
                value: text,
                private: false
            };
        }

        if (NostrPubKeyRegExp.test(text)) {
            if (settings?.generalNotifications.nostrPublicKey && notify) {
                await window.electron.showNotification('Nostr Public Key in Clipboard.', text);
            }
            return {
                name: 'Nostr Public Key',
                value: text,
                private: false
            };
        }

        if (NostrPrivateKeyRegExp.test(text)) {
            if (settings?.generalNotifications.nostrPrivateKey && notify) {
                await window.electron.showNotification('Nostr Private Key in Clipboard.', 'Never share this.');
            }
            return {
                name: 'Nostr Private Key',
                value: text,
                private: true
            };
        }

        if (LightningAddressRegExp.test(text)) {
            const result = await window.electron.decodeLightning(text);

            if (!result) {
                return null;
            }

            if (settings?.checkoutMode) {
                const paymentItem = await this.queryPayments(text, serverService);

                if (paymentItem) {
                    if (settings?.generalNotifications.lightningAddress && notify) {
                        await window.electron.showNotification(paymentItem.merchant, paymentItem.description ?? '');
                    }
                    return paymentItem;
                }
            }

            if (settings?.generalNotifications.lightningAddress && notify) {
                await window.electron.showNotification('Lightning Address in Clipboard', 'Lightning Address Detected.');
            }

            return {
                name: 'Lightning Address',
                value: text,
                private: false,
                ...result
            } as Bolt11ClipboardItem;
        }

        return null;
    }

    private static async queryPayments(value: string, serverService: ServerService): Promise<PaymentClipboardItem | null> {
        try {
            const paymentClipboardItem = await lastValueFrom(serverService.getPayment(value));

            paymentClipboardItem.name = paymentClipboardItem.merchant;
            paymentClipboardItem.value = paymentClipboardItem.payment;

            return paymentClipboardItem;
        } catch (error) {
            return null;
        }
    }
}
