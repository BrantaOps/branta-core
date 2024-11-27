import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { merge } from 'rxjs';
import { ClipboardService } from '../../shared/services/clipboard.service';
import { HistoryService } from '../../shared/services/history.service';
import { SettingsService } from '../../shared/services/settings.service';

@Component({
    selector: 'app-settings',
    standalone: true,
    imports: [ReactiveFormsModule, MatSlideToggleModule, MatIconModule, MatTooltipModule, MatButtonModule],
    templateUrl: './settings.component.html',
    styleUrl: './settings.component.scss'
})
export class SettingsComponent {
    formGroup: FormGroup;

    checkoutModeTooltip = 'Verify BTC/LN checkouts & invoices. Requires internet.';
    queryBalancesTooltip = 'Query mempool for address balance. Requires internet.';
    developerModeTooltip = 'Only check this if you\'re a developer. Enables staging environment.';

    constructor(
        private settingsService: SettingsService,
        private historyService: HistoryService,
        private clipboardService: ClipboardService
    ) {
        const settings = settingsService.get();

        this.formGroup = new FormGroup({
            checkoutMode: new FormControl(settings.checkoutMode),
            queryBalances: new FormControl(settings.queryBalances),
            generalNotifications: new FormGroup({
                bitcoinAddress: new FormControl(settings.generalNotifications.bitcoinAddress),
                bitcoinPublicKey: new FormControl(settings.generalNotifications.bitcoinPublicKey),
                nostrPublicKey: new FormControl(settings.generalNotifications.nostrPublicKey),
                nostrPrivateKey: new FormControl(settings.generalNotifications.nostrPrivateKey),
                lightningAddress: new FormControl(settings.generalNotifications.lightningAddress),
            }),
            clipboardHistory: new FormGroup({
                show: new FormControl(settings.clipboardHistory.show)
            }),
            developerMode: new FormControl(settings.developerMode)
        });

        this.formGroup.valueChanges.subscribe((settings) => {
            this.settingsService.save(settings);
        });

        merge(
            this.formGroup.get('checkoutMode')!.valueChanges,
            this.formGroup.get('queryBalances')!.valueChanges,
            this.formGroup.get('developerMode')!.valueChanges
        ).subscribe(() => {
            this.clipboardService.rerunGetClipboardItem();
        });
    }

    onClearHistory(): void {
        this.historyService.clearHistory();
    }
}
