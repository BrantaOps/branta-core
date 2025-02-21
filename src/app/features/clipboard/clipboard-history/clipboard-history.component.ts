import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ExpandableTextComponent } from '../../../shared/components/expandable-text/expandable-text.component';
import { AddressClipboardItem, ClipboardItem, PaymentClipboardItem } from '../../../shared/models/clipboard-item';
import { getIcon } from '../../../shared/models/wallet.model';
import { BaseClipboardComponent } from '../base-clipboard';

@Component({
    selector: 'app-clipboard-history',
    imports: [CommonModule, MatButtonModule, MatIconModule, ExpandableTextComponent],
    templateUrl: './clipboard-history.component.html',
    styleUrl: './clipboard-history.component.scss'
})
export class ClipboardHistoryComponent extends BaseClipboardComponent {
    @Input() history: (ClipboardItem | AddressClipboardItem | PaymentClipboardItem)[];
    @Input() clipboardContent: string | null | undefined;

    onCopyClipboard(text: string | null) {
        (window as any).electron.clipboard.writeText(text);
    }
}
