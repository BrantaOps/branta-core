import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ClipboardItem } from '../../shared/models/clipboard-item';
import { Settings } from '../../shared/models/settings';
import { ClipboardService } from '../../shared/services/clipboard.service';
import { HistoryService } from '../../shared/services/history.service';
import { SettingsService } from '../../shared/services/settings.service';
import { ClipboardDetailsComponent } from './clipboard-details/clipboard-details.component';
import { ClipboardHistoryComponent } from './clipboard-history/clipboard-history.component';
import { BaseClipboardComponent } from './base-clipboard';

@Component({
    selector: 'app-clipboard',
    imports: [CommonModule, ClipboardDetailsComponent, ClipboardHistoryComponent],
    templateUrl: './clipboard.component.html',
    styleUrl: './clipboard.component.scss'
})
export class ClipboardComponent {
    clipboardItem: ClipboardItem | null = null;
    history: ClipboardItem[] = [];
    showHistory: boolean = false;

    constructor(public clipboardService: ClipboardService, public historyService: HistoryService, public settingsService: SettingsService) {
        this.clipboardService.clipboardItem.subscribe((item: ClipboardItem | null) => {
            this.clipboardItem = item;
        });

        this.historyService.history.subscribe((history) => {
            this.history = history;
        })

        this.settingsService.settings.subscribe((settings: Settings) => {
            this.showHistory = settings.clipboardHistory.show;
        });
    }
}
