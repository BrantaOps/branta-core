import { Injectable } from '@angular/core';
import { Settings } from '../models/settings';
import { ReplaySubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class SettingsService {
    private _settings: Settings;
    public settings = new ReplaySubject<Settings>();

    private readonly SETTINGS_KEY = 'settings';

    defaultSettings: Settings = {
        checkoutMode: false,
        developerMode: false,
        generalNotifications: {
            bitcoinAddress: true,
            bitcoinPublicKey: true,
            nostrPublicKey: true,
            nostrPrivateKey: true,
            lightningAddress: true
        }
    };

    constructor() {
        this.load();
    }

    load(): void {
        var settings = localStorage.getItem(this.SETTINGS_KEY);
        const parsedSettings: Partial<Settings> = settings ? JSON.parse(settings) : {};

        this._settings = this.mergeSettings(this.defaultSettings, parsedSettings);

        this.update();
    }

    save(settings: Settings) {
        this._settings = settings;
        localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(settings));

        this.update();
    }

    get(): Settings {
        return this._settings;
    }

    private update() {
        this.settings.next(this._settings);
    }

    private mergeSettings(defaults: Settings, overrides: Partial<Settings>): Settings {
        return {
            ...defaults,
            ...overrides,
            generalNotifications: {
                ...defaults.generalNotifications,
                ...overrides.generalNotifications
            }
        };
    }
}
