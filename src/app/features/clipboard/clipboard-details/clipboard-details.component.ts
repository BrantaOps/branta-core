import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { AddressClipboardItem, Bolt11ClipboardItem, ClipboardItem, PaymentClipboardItem } from '../../../shared/models/clipboard-item';
import { getIcon } from '../../../shared/models/wallet.model';

@Component({
    selector: 'app-clipboard-details',
    standalone: true,
    imports: [CommonModule, MatButtonModule],
    templateUrl: './clipboard-details.component.html',
    styleUrl: './clipboard-details.component.scss'
})
export class ClipboardDetailsComponent {
    @Input() clipboardItem: ClipboardItem | null;

    getIcon = getIcon;

    isAddressClipboardItem(item: ClipboardItem): item is AddressClipboardItem {
        return 'address' in item && 'wallet' in item && 'derivationPath' in item;
    }

    isPaymentClipboardItem(item: ClipboardItem): item is PaymentClipboardItem {
        return 'payment' in item && 'merchant' in item && 'description' in item;
    }

    isBolt11ClipboardItem(item: ClipboardItem): item is Bolt11ClipboardItem {
        return 'amount' in item && 'expiry' in item && 'description' in item;
    }

    onShareFeedback(): void {
        window.electron.openUrl('https://branta.pro/uses');
    }
}
