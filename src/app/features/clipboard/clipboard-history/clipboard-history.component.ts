import { Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ClipboardItem } from '../../../shared/models/clipboard-item';

@Component({
    selector: 'app-clipboard-history',
    standalone: true,
    imports: [MatButtonModule, MatIconModule],
    templateUrl: './clipboard-history.component.html',
    styleUrl: './clipboard-history.component.scss'
})
export class ClipboardHistoryComponent {
    @Input() history: ClipboardItem[];
    @Input() clipboardContent: string | null | undefined;

    onCopyClipboard(text: string | null) {
        (window as any).electron.clipboard.writeText(text);
    }
}
