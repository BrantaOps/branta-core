export interface Wallet {
    id: number;
    name: string;
    policyType: PolicyType;
    m: number;
    n: number;
    keys: ExtendedPublicKey[];
}

export interface ExtendedPublicKey {
    value: string;
    derivationPath: string | null;
}

export enum PolicyType {
    SingleSig = 'Single Sig',
    MultiSig = 'Multi Sig'
}
