import { Wallet } from "./wallet.model";

export interface Vault extends Wallet {
    company?: VaultCompany | null;
}

export enum VaultCompany {}
