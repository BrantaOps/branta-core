export interface Settings {
    checkoutMode: boolean;
    developerMode: boolean;
    generalNotifications: GeneralNotifications;
    clipboardHistory: ClipboardHistory;
    bitcoinUnitType: BitcoinUnitType;
}

export enum BitcoinUnitType {
    Sats = 'Sats',
    Bitcoin = 'Bitcoin',
    MiliSats = 'Mili-Sats'
}

export interface ClipboardHistory {
    show: boolean;
}

export interface GeneralNotifications {
    bitcoinAddress: boolean;
    bitcoinPublicKey: boolean;
    nostrPublicKey: boolean;
    nostrPrivateKey: boolean;
    lightningAddress: boolean;
}
