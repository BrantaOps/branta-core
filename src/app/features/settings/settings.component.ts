import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SettingsService } from '../../shared/services/settings.service';

@Component({
    selector: 'app-settings',
    standalone: true,
    imports: [ReactiveFormsModule, MatSlideToggleModule, MatIconModule, MatTooltipModule],
    templateUrl: './settings.component.html',
    styleUrl: './settings.component.scss'
})
export class SettingsComponent {
    formGroup: FormGroup;

    checkoutModeTooltip = 'Verify BTC/LN checkouts & invoices. Requires internet.';
    developerModeTooltip = 'Only check this if you\'re a developer. Enables staging environment.';

    constructor(private settingsService: SettingsService) {
        let settings = settingsService.get();

        this.formGroup = new FormGroup({
            checkoutMode: new FormControl(settings.checkoutMode),
            generalNotifications: new FormGroup({
                bitcoinAddress: new FormControl(settings.generalNotifications.bitcoinAddress),
                bitcoinPublicKey: new FormControl(settings.generalNotifications.bitcoinPublicKey),
                nostrPublicKey: new FormControl(settings.generalNotifications.nostrPublicKey),
                nostrPrivateKey: new FormControl(settings.generalNotifications.nostrPrivateKey),
                lightningAddress: new FormControl(settings.generalNotifications.lightningAddress),
            }),
            developerMode: new FormControl(settings.developerMode)
        });

        this.formGroup.valueChanges.subscribe((settings) => {
            this.settingsService.save(settings);
        });
    }
}
