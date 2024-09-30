export enum AddressType {
    PayToPublicKeyHash = 'Legacy',
    PayToWitnessPublicKeyHash = 'Segwit',
    PayToScriptHash = 'P2SH'
}

export interface Address {
    value: string;
    prefix: string;
    remainder: string;
    type: string;
    selected: boolean;
}
