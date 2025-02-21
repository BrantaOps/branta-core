import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject, ReplaySubject } from 'rxjs';
import { ClipboardItem } from '../models/clipboard-item';
import { Settings } from '../models/settings';
import { Vault } from '../models/vault.model';
import { Wallet } from '../models/wallet.model';
import { ServerService } from './server.service';
import { SettingsService } from './settings.service';
import { VaultService } from './vault.service';
import { WalletService } from './wallet.service';

import { BaseClipboardService } from './base-clipboard.service';

@Injectable({
    providedIn: 'root'
})
export class ClipboardService extends BaseClipboardService {
    public clipboardItem = new ReplaySubject<ClipboardItem | null>();
    private _clipboardText: string = '';
    public clipboardText = new BehaviorSubject<string>('');

    private _wallets: Wallet[] = [];
    private _vaults: Vault[] = [];

    public static XPUB_REGEX = '^([xyYzZtuUvV]pub[1-9A-HJ-NP-Za-km-z]{79,108})$';

    constructor(
        private ngZone: NgZone,
        private vaultService: VaultService,
        private walletService: WalletService,
        private settingsService: SettingsService,
        private serverService: ServerService
    ) {
        super();
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
    }

    public async rerunGetClipboardItem(notify: boolean = false): Promise<void> {
        this.clipboardItem.next(
            await ClipboardService.getClipboardItem(this._clipboardText, notify, this._vaults, this._wallets, this.settingsService.settings(), this.serverService)
        );
    }
}
