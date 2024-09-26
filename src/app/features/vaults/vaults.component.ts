import { Component, NgZone } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ConfirmationDialogComponent } from '../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { Vault, VaultCompany } from '../../shared/models/vault.model';
import { PolicyType } from '../../shared/models/wallet.model';
import { VaultService } from '../../shared/services/vault.service';

@Component({
    selector: 'app-vaults',
    standalone: true,
    imports: [MatButtonModule, MatIconModule, MatTooltipModule],
    templateUrl: './vaults.component.html',
    styleUrl: './vaults.component.scss'
})
export class VaultsComponent {
    vaults: Vault[] = [];

    PolicyType = PolicyType;
    VaultCompany = VaultCompany;

    constructor(
        private vaultService: VaultService,
        public dialog: MatDialog,
        private ngZone: NgZone
    ) {
        this.vaultService.vaults.subscribe((vaults) => {
            this.ngZone.run(() => {
                this.vaults = vaults;
            });
        });
    }

    openDialog(vault: Vault): void {
        const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
            data: {
                title: 'Delete Vault',
                message: `Are you sure you want to remove '${vault.name}'?`,
                submitText: 'Delete'
            }
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result === true) {
                this.vaultService.removeVault(vault.id);
            }
        });
    }
}
