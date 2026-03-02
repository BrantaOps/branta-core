export interface Settings {
    developerMode: boolean;
    generalNotifications: GeneralNotifications;
    clipboardHistory: ClipboardHistory;
    bitcoinUnitType: BitcoinUnitType;
    disclaimerAccepted: boolean;
}

export enum ClipboardHistoryRolloffType {
    Never = 'Never',
    OneWeek = '1 week',
    FourWeek = '4 weeks',
    ThreeMonths = '3 months'
}

export enum BitcoinUnitType {
    Sats = 'Sats',
    Bitcoin = 'Bitcoin',
    MilliSats = 'Millisatoshis'
}

export interface ClipboardHistory {
    show: boolean;
    rolloffType: ClipboardHistoryRolloffType;
}

export interface GeneralNotifications {
    bitcoinAddress: boolean;
    bitcoinPublicKey: boolean;
    nostrPublicKey: boolean;
    nostrPrivateKey: boolean;
    lightningAddress: boolean;
}
