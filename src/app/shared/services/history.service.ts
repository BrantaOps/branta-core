import { Injectable } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { ClipboardItem } from '../models/clipboard-item';
import { ClipboardService } from './clipboard.service';

@Injectable({
    providedIn: 'root'
})
export class HistoryService {
    private _history: ClipboardItem[] = [];
    public history = new ReplaySubject<ClipboardItem[]>();

    constructor(public clipboardService: ClipboardService) {
        this.load();

        this.clipboardService.clipboardItem.subscribe((item: ClipboardItem | null) => {
            if (item && item.value && !item.private && item.value !== this._history[0]?.value) {
                this._history.unshift(item);
                this.save();
            }
        });
    }

    clearHistory(): void {
        this._history = [];

        this.save();
    }

    private async load(): Promise<void> {
        var history = await window.electron.retrieveData('history') as ClipboardItem[];

        this._history = history;
        this.update();
    }

    private async save() {
        await window.electron.storeData('history', this._history);

        this.update();
    }

    private update() {
        this.history.next(this._history);
    }
}
