import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SettingsService } from './settings.service';
import { PaymentClipboardItem } from '../models/clipboard-item';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ServerService {

    constructor(private settingsService: SettingsService, private httpClient: HttpClient) { }

    getPayment(value: string): Observable<PaymentClipboardItem> {
        return this.httpClient.get<PaymentClipboardItem>(`${this.baseUrl}/payments/${encodeURIComponent(value)}`)
    }

    private get baseUrl(): string {
        const subdomain = this.settingsService.get().developerMode ? 'staging' : 'payments';

        return `https://${subdomain}.branta.pro/v1`;
    }
}
