import { AddressClipboardItem, Bolt11ClipboardItem, ClipboardItem, PaymentClipboardItem } from '../../shared/models/clipboard-item';
import { getIcon } from '../../shared/models/wallet.model';

export class BaseClipboardComponent {
    getIcon = getIcon;

    isAddressClipboardItem(item: ClipboardItem): item is AddressClipboardItem {
        return 'address' in item && 'wallet' in item && 'derivationPath' in item;
    }

    isPaymentClipboardItem(item: ClipboardItem): item is PaymentClipboardItem {
        return 'payment' in item && 'merchant' in item && 'description' in item;
    }

    isBolt11ClipboardItem(item: ClipboardItem): item is Bolt11ClipboardItem {
        return 'amount' in item && 'expiry' in item && 'description' in item;
    }
}
