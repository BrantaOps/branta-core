import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterOutlet } from '@angular/router';
import { version } from '../../package.json';
import { NavigationComponent } from './core/navigation/navigation.component';
import { environment } from '../environments/environment';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [CommonModule, RouterOutlet, NavigationComponent, MatButtonModule],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss'
})
export class AppComponent {
    version: string = version + (environment.name == 'production' ? '' : '-dev');

    titleBarClass: string = "";

    constructor() {
        this.titleBarClass = window.electron.platform();
    }

    onHelp(): void {
        window.electron.openUrl('https://docs.branta.pro');
    }
}
