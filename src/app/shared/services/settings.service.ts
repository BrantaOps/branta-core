import { computed, Injectable, signal } from '@angular/core';
import { BitcoinUnitType, ClipboardHistoryRolloffType, Settings } from '../models/settings';

@Injectable({
    providedIn: 'root'
})
export class SettingsService {
    defaultSettings: Settings = {
        bitcoinUnitType: BitcoinUnitType.Sats,
        developerMode: false,
        disclaimerAccepted: false,
        clipboardHistory: {
            show: true,
            rolloffType: ClipboardHistoryRolloffType.Never
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

    isLoading = signal<boolean>(true);

    private readonly SETTINGS_KEY = 'settings';

    constructor() {
        this.load();
    }

    load(): void {
        const settings = localStorage.getItem(this.SETTINGS_KEY);
        const parsedSettings: Partial<Settings> = settings ? JSON.parse(settings) : {};

        this.#settings.update(() => this.mergeSettings(this.defaultSettings, parsedSettings));
        this.isLoading.update(() => false);
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
