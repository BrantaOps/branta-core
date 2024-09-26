import { Injectable } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { Wallet } from '../models/wallet.model';

@Injectable({
    providedIn: 'root'
})
export class WalletService {
    private _wallets: Wallet[] = [];
    public wallets = new ReplaySubject<Wallet[]>();

    constructor() {
        this.load();
    }

    addWallet(wallet: Wallet): void {
        wallet.id = this._wallets.length == 0 ? 1 : Math.max(...this._wallets.map((wallet) => wallet.id)) + 1;
        this._wallets.unshift(wallet);
        this.save();
    }

    updateWallet(updateWallet: Wallet): void {
        this._wallets = this._wallets.map((wallet) => (wallet.id == updateWallet.id ? updateWallet : wallet));
        this.save();
    }

    removeWallet(id: number) {
        this._wallets = this._wallets.filter((wallet) => wallet.id != id);
        this.save();
    }

    getById(id: number): Wallet | undefined {
        return this._wallets.find((wallet) => wallet.id == id);
    }

    private async load(): Promise<void> {
        var wallets = await window.electron.retrieveData('wallet') as Wallet[];

        this._wallets = wallets;
        this.update();
    }

    private async save() {
        await window.electron.storeData('wallet', this._wallets);

        this.update();
    }

    private update() {
        this.wallets.next(this._wallets);
    }
}
