export interface ClipboardItem {
    name: string | null;
    value: string | null;
    private: boolean;
}

export interface AddressClipboardItem extends ClipboardItem {
    address: string;
    walletName: string | null;
    derivationPath: string | null;
}

export interface PaymentClipboardItem extends ClipboardItem {
    payment: string;
    merchant: string;
    description: string | null;
}
