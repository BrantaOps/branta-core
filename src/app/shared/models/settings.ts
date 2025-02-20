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
    MilliSats = 'Millisatoshis'
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
