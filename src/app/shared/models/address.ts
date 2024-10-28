export enum AddressType {
    PayToPublicKeyHash = 'Legacy',
    PayToWitnessPublicKeyHash = 'Segwit',
    PayToScriptHash = 'P2SH',
    PayToTapRoot = 'P2TR'
}

export interface Address {
    value: string;
    prefix: string;
    remainder: string;
    type: string;
    selected: boolean;
}
