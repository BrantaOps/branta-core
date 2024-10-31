import { Injectable } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { Vault } from '../models/vault.model';
import { Router } from '@angular/router';

@Injectable({
    providedIn: 'root'
})
export class VaultService {
    private _vaults: Vault[] = [];
    public vaults = new ReplaySubject<Vault[]>();

    constructor(private router: Router) {
        this.load();

        window.electron.onVaultCreated((vault: Vault) => {
            this._vaults.push(vault);
            this.update();
            this.router.navigate(['vaults']);
        });
    }

    removeVault(id: number) {
        this._vaults = this._vaults.filter((vault) => vault.id != id);
        this.save();
    }

    private async load(): Promise<void> {
        const vaults = await window.electron.retrieveData('vault') as Vault[];

        this._vaults = vaults;
        this.update();
    }

    private async save() {
        await window.electron.storeData('vault', this._vaults);

        this.update();
    }

    private update() {
        this.vaults.next(this._vaults);
    }
}
