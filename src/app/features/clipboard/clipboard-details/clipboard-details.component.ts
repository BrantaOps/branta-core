import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { ExpandableTextComponent } from "../../../shared/components/expandable-text/expandable-text.component";
import { ClipboardItem } from '../../../shared/models/clipboard-item';
import { BaseClipboardComponent } from '../base-clipboard';
import { BitcoinAmountComponent } from '../../../shared/components/bitcoin-amount/bitcoin-amount.component';

@Component({
    selector: 'app-clipboard-details',
    imports: [CommonModule, MatButtonModule, ExpandableTextComponent, BitcoinAmountComponent],
    templateUrl: './clipboard-details.component.html',
    styleUrl: './clipboard-details.component.scss'
})
export class ClipboardDetailsComponent extends BaseClipboardComponent {
    @Input() clipboardItem: ClipboardItem | null;

    onShareFeedback(): void {
        window.electron.openUrl('https://branta.pro/uses');
    }
}
