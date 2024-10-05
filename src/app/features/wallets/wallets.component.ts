import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router, RouterModule } from '@angular/router';
import { ConfirmationDialogComponent } from '../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { PolicyType, Wallet, getIcon } from '../../shared/models/wallet.model';
import { XPubPipe } from '../../shared/pipes/xpub.pipe';
import { ClipboardService } from '../../shared/services/clipboard.service';
import { WalletService } from '../../shared/services/wallet.service';

@Component({
    selector: 'app-wallets',
    standalone: true,
    imports: [MatButtonModule, MatIconModule, RouterModule, XPubPipe, MatTooltipModule],
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
        public dialog: MatDialog
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
}
