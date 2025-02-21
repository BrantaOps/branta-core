import { TitleCasePipe } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-alert',
    imports: [MatIconModule, TitleCasePipe],
    templateUrl: './alert.component.html',
    styleUrl: './alert.component.scss'
})
export class AlertComponent {
    @Input() text: string | null;
    @Input() type: "warning" | "error";
}
