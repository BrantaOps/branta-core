import { Icon, IconOption, iconOptions } from "./icon";

export interface Wallet {
    id: number;
    name: string;
    icon: Icon,
    policyType: PolicyType;
    m: number;
    n: number;
    keys: ExtendedPublicKey[];
    indexLimit?: number | null;
}

export interface ExtendedPublicKey {
    value: string;
    derivationPath: string | null;
}

export enum PolicyType {
    SingleSig = 'Single Sig',
    MultiSig = 'Multi Sig'
}


export function getIcon(wallet: Wallet): IconOption {
    return iconOptions.find((option) => option.value == wallet.icon) || iconOptions[0];
}
