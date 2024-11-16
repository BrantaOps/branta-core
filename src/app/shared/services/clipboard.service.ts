import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject, ReplaySubject, lastValueFrom } from 'rxjs';
import { AddressClipboardItem, Bolt11ClipboardItem, ClipboardItem, PaymentClipboardItem } from '../models/clipboard-item';
import { Settings } from '../models/settings';
import { Vault } from '../models/vault.model';
import { Wallet } from '../models/wallet.model';
import { ServerService } from './server.service';
import { SettingsService } from './settings.service';
import { VaultService } from './vault.service';
import { WalletService } from './wallet.service';

@Injectable({
    providedIn: 'root'
})
export class ClipboardService {
    public clipboardItem = new ReplaySubject<ClipboardItem | null>();
    private _clipboardText: string = '';
    public clipboardText = new BehaviorSubject<string>('');

    private _wallets: Wallet[] = [];
    private _vaults: Vault[] = [];
    private _settings: Settings;

    public static XPUB_REGEX = '^([xyYzZtuUvV]pub[1-9A-HJ-NP-Za-km-z]{79,108})$';

    addressRegExp = new RegExp('^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$');
    segwitAddressRegExp = new RegExp('^bc1[0-9a-zA-Z]{25,65}$');
    testnetAddressRegExp = new RegExp('^tb1[0-9a-zA-Z]{25,65}$');
    testnetLegacyAddressRegExp = new RegExp('^[2mn][0-9a-zA-Z]{25,65}$');
    extendedKeyRegExp = new RegExp(ClipboardService.XPUB_REGEX);
    nostrPubKeyRegExp = new RegExp('^npub[0-9a-z]{58,65}$');
    nostrPrivateKeyRegExp = new RegExp('^nsec[0-9a-z]{58,65}$');
    lightningAddressRegExp = new RegExp('^lnbc[a-zA-z0-9]+$');

    constructor(
        private ngZone: NgZone,
        private vaultService: VaultService,
        private walletService: WalletService,
        private settingsService: SettingsService,
        private serverService: ServerService
    ) {
        window.electron.onClipboardUpdate((text: string) => {
            this.ngZone.run(async () => {
                this._clipboardText = text;
                this.clipboardText.next(text);
                this.rerunGetClipboardItem(true);
            });
        });

        this.vaultService.vaults.subscribe((vaults) => {
            this._vaults = vaults;
        });

        this.walletService.wallets.subscribe((wallets) => {
            this._wallets = wallets;
        });

        this.settingsService.settings.subscribe((settings) => {
            this._settings = settings;
        });
    }

    public async rerunGetClipboardItem(notify: boolean = false): Promise<void> {
        this.clipboardItem.next(await this.getClipboardItem(this._clipboardText, notify));
    }

    private async getClipboardItem(text: string, notify: boolean): Promise<ClipboardItem | null> {
        if (text == "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa") {
            await window.electron.showNotification('Bitcoin genesis block address copied.', 'We are all Satoshi');
            return {
                name: 'Bitcoin Address: Genesis Block',
                value: text,
                address: text,
                wallet: null,
                derivationPath: null,
                private: false
            } as AddressClipboardItem;
        }

        if (this.isBitcoinAddress(text)) {
            const vault = await window.electron.verifyAddress(this._vaults, text);

            if (vault) {
                if (this._settings?.generalNotifications.bitcoinAddress && notify) {
                    await window.electron.showNotification('BTC address: ' + vault.wallet?.name, 'Derivation: ' + vault.derivationPath);
                }

                return vault;
            }

            const wallet = await window.electron.verifyAddress(this._wallets, text);

            // Found the users wallet
            if (wallet) {
                if (this._settings?.generalNotifications.bitcoinAddress && notify) {
                    await window.electron.showNotification('BTC address: ' + wallet.wallet?.name, 'Derivation: ' + wallet.derivationPath);
                }

                return wallet;
            }
            // Didn't find the users wallet
            else {
                if (this._settings?.checkoutMode) {
                    const paymentItem = await this.queryPayments(text);

                    if (paymentItem && notify) {
                        await window.electron.showNotification(paymentItem.merchant, paymentItem.description ?? '');
                        return paymentItem;
                    }
                }

                if (this._settings?.generalNotifications.bitcoinAddress && notify) {
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

        if (this.extendedKeyRegExp.test(text)) {
            if (this._settings?.generalNotifications.bitcoinPublicKey && notify) {
                await window.electron.showNotification('Bitcoin Extended Public Key in Clipboard.', 'Sharing can lead to loss of privacy.');
            }
            return {
                name: 'Extended Public Key',
                value: text,
                private: false
            };
        }

        if (this.nostrPubKeyRegExp.test(text)) {
            if (this._settings?.generalNotifications.nostrPublicKey && notify) {
                await window.electron.showNotification('Nostr Public Key in Clipboard.', text);
            }
            return {
                name: 'Nostr Public Key',
                value: text,
                private: false
            };
        }

        if (this.nostrPrivateKeyRegExp.test(text)) {
            if (this._settings?.generalNotifications.nostrPrivateKey && notify) {
                await window.electron.showNotification('Nostr Private Key in Clipboard.', 'Never share this.');
            }
            return {
                name: 'Nostr Private Key',
                value: text,
                private: true
            };
        }

        if (this.lightningAddressRegExp.test(text)) {
            const result = await window.electron.decodeLightning(text);

            if (this._settings?.checkoutMode) {
                const paymentItem = await this.queryPayments(text);

                if (paymentItem) {
                    if (this._settings?.generalNotifications.lightningAddress && notify) {
                        await window.electron.showNotification(paymentItem.merchant, paymentItem.description ?? '');
                    }
                    return paymentItem;
                }
            }

            if (this._settings?.generalNotifications.lightningAddress && notify) {
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

    public isBitcoinAddress(text: string) {
        return this.addressRegExp.test(text) || this.segwitAddressRegExp.test(text) || this.testnetAddressRegExp.test(text) || this.testnetLegacyAddressRegExp.test(text);
    }

    private async queryPayments(value: string): Promise<PaymentClipboardItem | null> {
        try {
            const paymentClipboardItem = await lastValueFrom(this.serverService.getPayment(value));

            paymentClipboardItem.name = paymentClipboardItem.merchant;
            paymentClipboardItem.value = paymentClipboardItem.payment;

            return paymentClipboardItem;
        } catch {
            return null;
        }
    }
}
