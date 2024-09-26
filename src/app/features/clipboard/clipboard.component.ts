import { Component } from '@angular/core';
import { ClipboardItem } from '../../shared/models/clipboard-item';
import { ClipboardService } from '../../shared/services/clipboard.service';
import { CommonModule } from '@angular/common';
import { ClipboardDetailsComponent } from './clipboard-details/clipboard-details.component';
import { ClipboardHistoryComponent } from './clipboard-history/clipboard-history.component';

@Component({
    selector: 'app-clipboard',
    standalone: true,
    imports: [CommonModule, ClipboardDetailsComponent, ClipboardHistoryComponent],
    templateUrl: './clipboard.component.html',
    styleUrl: './clipboard.component.scss'
})
export class ClipboardComponent {
    clipboardItem: ClipboardItem | null = null;
    history: string[] = [];

    constructor(clipboardService: ClipboardService) {
        clipboardService.clipboardItem.subscribe((item: ClipboardItem | null) => {
            if (item && item.value && !item.private) {
                this.history.unshift(item.value);
            }

            this.clipboardItem = item;
        });
    }
}
