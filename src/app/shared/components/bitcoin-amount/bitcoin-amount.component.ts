import { Component, Input } from '@angular/core';
import { SettingsService } from '../../services/settings.service';
import { BitcoinUnitType, Settings } from '../../models/settings';
import { BitcoinAmountPipe } from '../../pipes/bitcoin-amount.pipe';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
    selector: 'app-bitcoin-amount',
    imports: [BitcoinAmountPipe, MatButtonModule, MatTooltipModule],
    templateUrl: './bitcoin-amount.component.html',
    styleUrl: './bitcoin-amount.component.scss'
})
export class BitcoinAmountComponent {
    @Input() value: number;

    settings: Settings;

    constructor(private settingsService: SettingsService) {
        this.settingsService.settings.subscribe((settings) => {
            this.settings = settings;
        });
    }

    toggleBitcoinUnitType() {
        var types = Object.values(BitcoinUnitType);

        var index = types.indexOf(this.settings.bitcoinUnitType) + 1;

        this.settingsService.save({
            ...this.settings,
            bitcoinUnitType: types[index % types.length]
        });
    }
}
