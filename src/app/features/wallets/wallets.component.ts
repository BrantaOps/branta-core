import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ConfirmationDialogComponent } from '../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { PolicyType, Wallet, getIcon } from '../../shared/models/wallet.model';
import { XPubPipe } from '../../shared/pipes/xpub.pipe';
import { ClipboardService } from '../../shared/services/clipboard.service';
import { WalletService } from '../../shared/services/wallet.service';

@Component({
    selector: 'app-wallets',
    standalone: true,
    imports: [MatButtonModule, MatIconModule, RouterModule, XPubPipe, MatTooltipModule, MatFormFieldModule, MatInputModule],
    templateUrl: './wallets.component.html',
    styleUrl: './wallets.component.scss'
})
export class WalletsComponent {
    wallets: Wallet[] = [];
    PolicyType = PolicyType;

    getIcon = getIcon;

    constructor(
        private walletService: WalletService,
        private clipboardService: ClipboardService,
        private router: Router,
        public dialog: MatDialog,
        private toastrService: ToastrService
    ) {
        this.walletService.wallets.subscribe((wallets) => {
            this.wallets = wallets;
        });
    }

    editWallet(walletId: number) {
        this.router.navigate(['wallets', 'add'], {
            queryParams: {
                walletId
            }
        });
    }

    openDialog(wallet: Wallet): void {
        const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
            data: {
                title: 'Delete Wallet',
                message: `Are you sure you want to remove '${wallet.name}'?`,
                submitText: 'Delete'
            }
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result === true) {
                this.walletService.removeWallet(wallet.id);
                this.clipboardService.rerunGetClipboardItem();
            }
        });
    }

    onChangeIndex(event: Event, wallet: Wallet, indexType: 'indexLimit' | 'indexStart'): void {
        const index = parseInt((event.target as HTMLInputElement).value);

        let error: string | null = null;

        if (isNaN(index)) {
            error = 'Not a valid number.';
        } else if (indexType == 'indexLimit' && index - 1 < (wallet.indexStart ?? 0)) {
            error = 'Start index must be less than end index.';
        } else if (indexType == 'indexStart' && index + 1 > (wallet.indexLimit ?? 50)) {
            error = 'End index must be greater than start index.';
        }

        if (error !== null) {
            this.toastrService.error(`Error updating '${wallet.name}': ${error}`);
            (event.target as HTMLInputElement).value = (wallet[indexType] ?? 50).toString();
            return;
        }

        wallet[indexType] = index;
        this.walletService.updateWallet(wallet);

        this.toastrService.success(`Updated wallet '${wallet.name}' to check address indices ${wallet.indexStart} to ${wallet.indexLimit}.`)
    }
}
