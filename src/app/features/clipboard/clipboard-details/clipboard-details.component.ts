import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { ExpandableTextComponent } from '../../../shared/components/expandable-text/expandable-text.component';
import { ClipboardItem, PaymentClipboardItem } from '../../../shared/models/clipboard-item';
import { BaseClipboardComponent } from '../base-clipboard';
import { BitcoinAmountComponent } from '../../../shared/components/bitcoin-amount/bitcoin-amount.component';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { lastValueFrom } from 'rxjs';
import { ServerService } from '../../../shared/services/server.service';
import { ToastrService } from 'ngx-toastr';
import { ClipboardItemType } from '../../../shared/models/clipboard-item';
import { NostrPrivateKeyRegExp } from '../../../shared/services/regex';

@Component({
    selector: 'app-clipboard-details',
    imports: [CommonModule, MatButtonModule, ExpandableTextComponent, BitcoinAmountComponent, MatIconModule, MatTooltipModule],
    templateUrl: './clipboard-details.component.html',
    styleUrl: './clipboard-details.component.scss'
})
export class ClipboardDetailsComponent extends BaseClipboardComponent {
    @Input() clipboardItem: ClipboardItem | null;
    @Output() clipboardItemChange = new EventEmitter<ClipboardItem>();

    verifyTooltip = "Verify clipboard content against Branta's server.";

    constructor(private serverService: ServerService, private toastrService: ToastrService) {
        super();
    }

    onVerify(): void {
        (async () => {
            const value = this.clipboardItem?.value;

            if (!value) {
                return;
            }

            const result = await this.queryPayments(value);

            if (result) {
                this.clipboardItemChange.emit(result as PaymentClipboardItem);
                return;
            }

            this.showPaymentNotFoundToast(value);
        })();
    }

    isNsecClipboardItem(item: ClipboardItem): boolean {
        const value = item?.value ?? '';
        return item.type === ClipboardItemType.PrivateKey && NostrPrivateKeyRegExp.test(value.trim());
    }

    async onNostrSyncPush(): Promise<void> {
        const nsec = this.clipboardItem?.value?.trim();
        if (!nsec || !NostrPrivateKeyRegExp.test(nsec)) {
            this.toastrService.error('No valid nsec detected in clipboard.');
            return;
        }

        this.toastrService.info('Publishing encrypted Branta data to Nostr relays...');

        try {
            const result = await window.electron.nostrSyncPush(nsec);
            this.toastrService.success(`Synced to ${result.publishedTo.length} relay(s).`);
        } catch (e: any) {
            this.toastrService.error(`Sync failed: ${String(e?.message ?? e)}`);
        }
    }

    async onNostrSyncPull(): Promise<void> {
        const nsec = this.clipboardItem?.value?.trim();
        if (!nsec || !NostrPrivateKeyRegExp.test(nsec)) {
            this.toastrService.error('No valid nsec detected in clipboard.');
            return;
        }

        const ok = window.confirm('Pull Branta data from Nostr? This will overwrite local wallets/history.');
        if (!ok) {
            return;
        }

        this.toastrService.info('Fetching encrypted Branta data from Nostr relays...');

        try {
            const result = await window.electron.nostrSyncPull(nsec);
            if (!result.found) {
                this.toastrService.warning('No Branta sync payload found on the configured relays.');
                return;
            }

            this.toastrService.success(
                `Pulled data from ${result.relay}. wallets=${result.walletCount}, history=${result.historyCount}`
            );
        } catch (e: any) {
            this.toastrService.error(`Pull failed: ${String(e?.message ?? e)}`);
        }
    }

    private showPaymentNotFoundToast(value: string): void {
        this.toastrService.error(
            `For more info on why this payment was not found click <a href="#" class="payment-link">here</a>.`,
            'Payment not found',
            {
                enableHtml: true,
                tapToDismiss: false
            }
        );

        setTimeout(() => {
            const link = document.querySelector('.toast-error .payment-link');
            if (link) {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const url = `${this.serverService.baseUrl}/v2/verify/${encodeURIComponent(value)}`;
                    window.electron.openUrl(url);
                });
            }
        }, 100);
    }

    private async queryPayments(value: string): Promise<PaymentClipboardItem | null> {
        try {
            const paymentClipboardItems = await lastValueFrom(this.serverService.getPayment(value));

            const paymentClipboardItem = paymentClipboardItems[0];

            paymentClipboardItem.name = paymentClipboardItem.platform;
            paymentClipboardItem.value = value;

            return paymentClipboardItem;
        } catch (error) {
            return null;
        }
    }
}
