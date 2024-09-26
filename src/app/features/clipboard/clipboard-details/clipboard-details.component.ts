import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { AddressClipboardItem, ClipboardItem, PaymentClipboardItem } from '../../../shared/models/clipboard-item';

@Component({
    selector: 'app-clipboard-details',
    standalone: true,
    imports: [CommonModule, MatButtonModule],
    templateUrl: './clipboard-details.component.html',
    styleUrl: './clipboard-details.component.scss'
})
export class ClipboardDetailsComponent {
    @Input() clipboardItem: ClipboardItem | null;

    isAddressClipboardItem(item: ClipboardItem): item is AddressClipboardItem {
        return 'address' in item && 'walletName' in item && 'derivationPath' in item;
    }

    isPaymentClipboardItem(item: ClipboardItem): item is PaymentClipboardItem {
        return 'payment' in item && 'merchant' in item && 'description' in item;
    }

    onShareFeedback(): void {
        window.electron.openUrl('https://branta.pro/uses');
    }
}
