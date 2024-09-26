export interface Settings {
    checkoutMode: boolean;
    developerMode: boolean;
    generalNotifications: GeneralNotifications;
}

export interface GeneralNotifications {
    bitcoinAddress: boolean;
    bitcoinPublicKey: boolean;
    nostrPublicKey: boolean;
    nostrPrivateKey: boolean;
    lightningAddress: boolean;
}
