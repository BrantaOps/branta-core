import { Settings } from '../models/settings';
import { ServerService } from './server.service';
import { Vault } from '../models/vault.model';
import { PolicyType, Wallet } from '../models/wallet.model';
import { AddressClipboardItem, PaymentClipboardItem } from '../models/clipboard-item';
import { verifyAddress } from '../../../../app/lib/verify-address';
import { decodeLightningPayment } from '../../../../app/lib/lightning';
import { of } from 'rxjs';
import { BaseClipboardService } from './base-clipboard.service';

const xpubs = ['xpub6Cbd89HtFkGQMk37HjxjpxB7zCysPUz2VzmSwGZPhH11vVaGZtbGw5pSyFe6Ff8qL8EASUL1WYaExqL2ULGwRd2RJkw3Yx8jU2CTNrZx65X'];
const npub = 'npub1d4ed5x49d7p24xn63flj4985dc4gpfngdhtqcxpth0ywhm6czxcscfpcq8';
const nsec = 'nsec1hp4ahsfaadfwkytju7evnqsmxc5rjul0cd709msu64kw40d0m29s2zx8kf';
const lnbc = [
    'lnbc5530n1pnn2jh0pp5gwzykw0ttdk84pr583lmq4f05nnvha9ae9k4q88gwkr6x503dlcqdq2f38xy6t5wvcqzzsxqrrsssp5yq8dcyjkf2wy5fasu6pm7z02l7lzkceq95a26krgnaaknkexlprq9qyyssq7qtyq7d7qwaftgajs496dkmylkrnmj5l4cunlyqpkadn08xyumt4nx79fh8auvd79a3hhr38q7t2j04zqysz48mrhhq3y9ufylazy7cqtv2804',
    'lnbc1288860n1pnkje6fpp5wh5cmfnwtvq57lpjh2rxskske5ttf3ppkywjdlxfvsx3turx2x2sdpdg3hkuct5v5sxvatwv3ejqar0ypeh2ursdae8ggzddahkucqzzsxqzjhsp5x4v8dv8e2j4eqnfqay9mkx3lvpqxxgy2l543g7tcmmpv0pdtvmps9p4gqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqpqysgqye6knzjhhahgqetduhj6jvtd3g98a7dc99nd9eyju9upc4fx90qzvuff7q9j5erqfs055lyhd2w22xy2mdqd9t3gc4g2xfjyxjzf4nqpv7y3p6'
];

var serverServiceMock = {
    getPayment: (value: string) => {
        if (['1HD1cVCJ5ZTgF6Tp7a7F92qqe3945NpKtu', lnbc[0]].includes(value)) {
            return of({
                payment: 'Payment',
                merchant: 'Branta'
            } as PaymentClipboardItem);
        }

        throw new Error();
    }
} as unknown as ServerService;

beforeAll(() => {
    global.window = Object.create({});

    global.window.electron = {
        showNotification: jest.fn().mockResolvedValue(null),
        verifyAddress,
        decodeLightning: decodeLightningPayment
    } as any;
});

beforeEach(() => {
    jest.resetAllMocks();
});

afterAll(() => {
    jest.restoreAllMocks();
});

describe('ClipboardService getClipboardItem', () => {
    test.each([
        [true, true, 1]
        // [false, true, 0],
        // [true, false, 0],
        // [false, false, 0],
    ])(
        'Genesis Block: notify: %p, notifyBitcoinAddress: %p, notificationCount: %i',
        async (notify: boolean, bitcoinAddress: boolean, notificationCount: number) => {
            const showNotificationMock = jest.spyOn(window.electron, 'showNotification').mockResolvedValue();

            var result = await BaseClipboardService.getClipboardItem(
                '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
                notify,
                [],
                [],
                {
                    generalNotifications: {
                        bitcoinAddress
                    }
                } as Settings,
                serverServiceMock
            );

            expect(showNotificationMock).toHaveBeenCalledTimes(notificationCount);
            expect(result?.name).toBe('Bitcoin Address: Genesis Block');
        }
    );

    test.each([
        ['1HD1cVCJ5ZTgF6Tp7a7F92qqe3945NpKtu', true, true, 'Vault 1', 1],
        ['bc1qk8rc8j4sgl0dnu4n4pusqkk4dny7n4pv7sh3s3', true, false, 'Vault 1', 0],
        ['bc1q8vwqtsgltr5dxnnntxn6v9kchpzywywcfd0jsd', false, true, undefined, 0]
    ])('Vault: %s', async (address: string, notify: boolean, bitcoinAddress: boolean, vaultName: string | undefined, notificationCount: number) => {
        const showNotificationMock = jest.spyOn(window.electron, 'showNotification').mockResolvedValue();

        var result = (await BaseClipboardService.getClipboardItem(
            address,
            notify,
            [
                {
                    id: 1,
                    name: 'Vault 1',
                    policyType: PolicyType.SingleSig,
                    keys: [{ value: xpubs[0] }],
                    m: 1,
                    n: 1
                }
            ] as Vault[],
            [],
            {
                generalNotifications: {
                    bitcoinAddress
                }
            } as Settings,
            serverServiceMock
        )) as AddressClipboardItem;

        expect(showNotificationMock).toHaveBeenCalledTimes(notificationCount);
        expect(result?.wallet?.name).toBe(vaultName);
    });

    test.each([
        ['1HD1cVCJ5ZTgF6Tp7a7F92qqe3945NpKtu', true, true, 'Wallet 1', 1],
        ['bc1qk8rc8j4sgl0dnu4n4pusqkk4dny7n4pv7sh3s3', true, false, 'Wallet 1', 0],
        ['bc1q8vwqtsgltr5dxnnntxn6v9kchpzywywcfd0jsd', false, true, undefined, 0]
    ])('Wallet: %s', async (address: string, notify: boolean, bitcoinAddress: boolean, vaultName: string | undefined, notificationCount: number) => {
        const showNotificationMock = jest.spyOn(window.electron, 'showNotification').mockResolvedValue();

        var result = (await BaseClipboardService.getClipboardItem(
            address,
            notify,
            [],
            [
                {
                    id: 1,
                    name: 'Wallet 1',
                    policyType: PolicyType.SingleSig,
                    keys: [{ value: xpubs[0] }],
                    m: 1,
                    n: 1
                }
            ] as Wallet[],
            {
                generalNotifications: {
                    bitcoinAddress
                }
            } as Settings,
            serverServiceMock
        )) as AddressClipboardItem;

        expect(showNotificationMock).toHaveBeenCalledTimes(notificationCount);
        expect(result?.wallet?.name).toBe(vaultName);
    });

    test.each([
        ['1HD1cVCJ5ZTgF6Tp7a7F92qqe3945NpKtu', true, true, 'Payment', 1],
        ['1HD1cVCJ5ZTgF6Tp7a7F92qqe3945NpKtu', false, true, undefined, 1],
        // ['1HD1cVCJ5ZTgF6Tp7a7F92qqe3945NpKtu', true, false, 'Payment', 0],
        ['1HD1cVCJ5ZTgF6Txxxxxxxxxxxxxxxxxxz', true, true, undefined, 1]
    ])('Payment: %s', async (address: string, checkoutMode: boolean, notify: boolean, paymentValue: string | undefined, notificationCount: number) => {
        const showNotificationMock = jest.spyOn(window.electron, 'showNotification').mockResolvedValue();

        var result = (await BaseClipboardService.getClipboardItem(
            address,
            notify,
            [],
            [],
            {
                checkoutMode,
                generalNotifications: {
                    bitcoinAddress: true
                }
            } as Settings,
            serverServiceMock
        )) as PaymentClipboardItem;

        expect(showNotificationMock).toHaveBeenCalledTimes(notificationCount);
        expect(result?.payment).toBe(paymentValue);
    });

    test.each([
        [npub, true, true, 1],
        [npub, false, true, 0],
        [npub, true, false, 0]
    ])('Nostr Public Key: %s', async (value: string, notify: boolean, nostrPublicKey: boolean, notificationCount: number) => {
        const showNotificationMock = jest.spyOn(window.electron, 'showNotification').mockResolvedValue();

        var result = (await BaseClipboardService.getClipboardItem(
            value,
            notify,
            [],
            [],
            {
                generalNotifications: {
                    nostrPublicKey
                }
            } as Settings,
            serverServiceMock
        )) as PaymentClipboardItem;

        expect(showNotificationMock).toHaveBeenCalledTimes(notificationCount);
        expect(result?.value).toBe(npub);
    });

    test.each([
        [nsec, true, true, 1],
        [nsec, false, true, 0],
        [nsec, true, false, 0]
    ])('Nostr Private Key: %s', async (value: string, notify: boolean, nostrPrivateKey: boolean, notificationCount: number) => {
        const showNotificationMock = jest.spyOn(window.electron, 'showNotification').mockResolvedValue();

        var result = (await BaseClipboardService.getClipboardItem(
            value,
            notify,
            [],
            [],
            {
                generalNotifications: {
                    nostrPrivateKey
                }
            } as Settings,
            serverServiceMock
        )) as PaymentClipboardItem;

        expect(showNotificationMock).toHaveBeenCalledTimes(notificationCount);
        expect(result?.value).toBe(nsec);
    });

    test.each([
        // ['Invalid lightning address that matches regex should show default lightning address', 'lnbc1pwr45dpp5q9wa3sjr4cnyvdh0wwufzldvlnm2qa5lc2sh3qkp3y', true, true, 1],
        ['Lightning address on payment server should show default when checkout is off.', lnbc[0], false, true, true, undefined, 1],
        ['Lightning address on payment server should show payment when checkout is on.', lnbc[0], true, true, true, 'Payment', 1],
        ['Lightning address not on payment server should not show payment when checkout is on.', lnbc[1], true, true, true, undefined, 1]
    ])(
        'Lightning: %s',
        async (
            _testDescription: string,
            value: string,
            checkoutMode: boolean,
            notify: boolean,
            lightningAddress: boolean,
            paymentValue: string | undefined,
            notificationCount: number
        ) => {
            const showNotificationMock = jest.spyOn(window.electron, 'showNotification').mockResolvedValue();

            var result = (await BaseClipboardService.getClipboardItem(
                value,
                notify,
                [],
                [],
                {
                    checkoutMode,
                    generalNotifications: {
                        lightningAddress
                    }
                } as Settings,
                serverServiceMock
            )) as PaymentClipboardItem;

            expect(showNotificationMock).toHaveBeenCalledTimes(notificationCount);
            expect(result?.payment).toBe(paymentValue);
        }
    );
});
