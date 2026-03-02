import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { RouterOutlet } from '@angular/router';
import { version } from '../../package.json';
import { ConfirmationDialogComponent } from './shared/components/confirmation-dialog/confirmation-dialog.component';
import { NavigationComponent } from './core/navigation/navigation.component';
import { SettingsService } from './shared/services/settings.service';
import { environment } from '../environments/environment';

@Component({
    selector: 'app-root',
    imports: [CommonModule, RouterOutlet, NavigationComponent, MatButtonModule],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
    version: string = version + (environment.name == 'production' ? '' : '-dev');

    titleBarClass: string = "";

    private dialog = inject(MatDialog);
    private settingsService = inject(SettingsService);

    constructor() {
        this.titleBarClass = window.electron.platform();
    }

    ngOnInit(): void {
        if (!this.settingsService.settings().disclaimerAccepted) {
            const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
                disableClose: true,
                data: {
                    title: 'Welcome to Branta Core',
                    message: 'Branta Core is free, open source software under the MIT license. By using this software, you acknowledge this.',
                    submitText: 'I Acknowledge',
                    hideCancel: true
                }
            });

            dialogRef.afterClosed().subscribe((result) => {
                if (result === true) {
                    this.settingsService.save({ ...this.settingsService.settings(), disclaimerAccepted: true });
                }
            });
        }
    }

    onHelp(): void {
        window.electron.openUrl('https://developer.branta.pro/branta-core');
    }
}
