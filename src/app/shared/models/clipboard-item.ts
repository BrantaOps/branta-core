import { Bolt11Details } from "./lightning";
import { Wallet } from "./wallet.model";

export interface ClipboardItem {
    name: string | null;
    value: string | null;
    private: boolean;
}

export interface AddressClipboardItem extends ClipboardItem {
    address: string;
    wallet: Wallet | null;
    derivationPath: string | null;
    balance?: number | null;
}

export interface PaymentClipboardItem extends ClipboardItem {
    payment: string;
    merchant: string;
    description: string | null;
}

export interface Bolt11ClipboardItem extends ClipboardItem, Bolt11Details {
}
