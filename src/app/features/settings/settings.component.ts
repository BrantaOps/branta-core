import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ConfirmationDialogComponent } from '../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { ClipboardService } from '../../shared/services/clipboard.service';
import { HistoryService } from '../../shared/services/history.service';
import { SettingsService } from '../../shared/services/settings.service';
import { MatSelectModule } from '@angular/material/select';
import { BitcoinUnitType } from '../../shared/models/settings';
import { MatInputModule } from '@angular/material/input';

@Component({
    selector: 'app-settings',
    standalone: true,
    imports: [ReactiveFormsModule, MatSlideToggleModule, MatIconModule, MatTooltipModule, MatButtonModule, MatSelectModule, MatInputModule],
    templateUrl: './settings.component.html',
    styleUrl: './settings.component.scss'
})
export class SettingsComponent {
    formGroup: FormGroup;

    checkoutModeTooltip = 'Verify BTC/LN checkouts & invoices. Requires internet.';
    developerModeTooltip = "Only check this if you're a developer. Enables staging environment.";

    BitcoinUnitTypes = Object.values(BitcoinUnitType);

    constructor(
        private settingsService: SettingsService,
        private historyService: HistoryService,
        private clipboardService: ClipboardService,
        public dialog: MatDialog
    ) {
        const settings = settingsService.get();

        this.formGroup = new FormGroup({
            checkoutMode: new FormControl(settings.checkoutMode),
            bitcoinUnitType: new FormControl(settings.bitcoinUnitType),
            generalNotifications: new FormGroup({
                bitcoinAddress: new FormControl(settings.generalNotifications.bitcoinAddress),
                bitcoinPublicKey: new FormControl(settings.generalNotifications.bitcoinPublicKey),
                nostrPublicKey: new FormControl(settings.generalNotifications.nostrPublicKey),
                nostrPrivateKey: new FormControl(settings.generalNotifications.nostrPrivateKey),
                lightningAddress: new FormControl(settings.generalNotifications.lightningAddress)
            }),
            clipboardHistory: new FormGroup({
                show: new FormControl(settings.clipboardHistory.show)
            }),
            developerMode: new FormControl(settings.developerMode)
        });

        this.formGroup.valueChanges.subscribe((settings) => {
            this.settingsService.save(settings);
        });

        this.formGroup.get('checkoutMode')?.valueChanges.subscribe(() => {
            this.clipboardService.rerunGetClipboardItem();
        });

        this.formGroup.get('developerMode')?.valueChanges.subscribe(() => {
            this.clipboardService.rerunGetClipboardItem();
        });
    }

    onClearHistory(): void {
        const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
            data: {
                title: 'Clear History',
                message: 'Are you sure you want to clear history? This cannot be undone.',
                submitText: 'Clear History'
            }
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result === true) {
                this.historyService.clearHistory();
            }
        });
    }
}
