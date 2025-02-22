import { computed, Injectable, signal } from '@angular/core';
import { BitcoinUnitType, Settings } from '../models/settings';

@Injectable({
    providedIn: 'root'
})
export class SettingsService {
    defaultSettings: Settings = {
        checkoutMode: false,
        bitcoinUnitType: BitcoinUnitType.Sats,
        developerMode: false,
        clipboardHistory: {
            show: true
        },
        generalNotifications: {
            bitcoinAddress: true,
            bitcoinPublicKey: true,
            nostrPublicKey: true,
            nostrPrivateKey: true,
            lightningAddress: true
        }
    };

    #settings = signal<Settings>(this.defaultSettings);
    settings = computed(this.#settings);

    private readonly SETTINGS_KEY = 'settings';

    constructor() {
        this.load();
    }

    load(): void {
        const settings = localStorage.getItem(this.SETTINGS_KEY);
        const parsedSettings: Partial<Settings> = settings ? JSON.parse(settings) : {};

        this.#settings.update(() => this.mergeSettings(this.defaultSettings, parsedSettings));
    }

    save(settings: Settings) {
        localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(settings));

        this.#settings.update(() => settings);
    }

    private mergeSettings(defaults: Settings, overrides: Partial<Settings>): Settings {
        return {
            ...defaults,
            ...overrides,
            clipboardHistory: {
                ...defaults.clipboardHistory,
                ...overrides.clipboardHistory
            },
            generalNotifications: {
                ...defaults.generalNotifications,
                ...overrides.generalNotifications
            }
        };
    }
}
