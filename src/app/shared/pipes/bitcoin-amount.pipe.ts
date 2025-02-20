import { Pipe, PipeTransform } from '@angular/core';
import { BitcoinUnitType } from '../models/settings';

@Pipe({
    name: 'bitcoinAmount',
    standalone: true
})
export class BitcoinAmountPipe implements PipeTransform {
    transform(value: number, unitType: BitcoinUnitType) {
        switch (unitType) {
            case BitcoinUnitType.Sats:
                return (value).toLocaleString('en-US');
            case BitcoinUnitType.Bitcoin:
                return  (value / 100000000).toFixed(8);
            case BitcoinUnitType.MilliSats:
                return (value * 1000).toLocaleString('en-US');
        }
    }
}
