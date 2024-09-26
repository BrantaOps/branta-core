import { Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-clipboard-history',
    standalone: true,
    imports: [MatButtonModule, MatIconModule],
    templateUrl: './clipboard-history.component.html',
    styleUrl: './clipboard-history.component.scss'
})
export class ClipboardHistoryComponent {
    @Input() history: string[];
    @Input() clipboardContent: string | null | undefined;

    onCopyClipboard(text: string) {
        (window as any).electron.clipboard.writeText(text);
    }
}
