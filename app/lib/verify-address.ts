import { AddressClipboardItem } from "../../src/app/shared/models/clipboard-item";
import { ExtendedPublicKey, Wallet } from "../../src/app/shared/models/wallet.model";

const bitcoin = require('bitcoinjs-lib');
const ecc = require('tiny-secp256k1');
const { BIP32Factory } = require('bip32');
const BIP84 = require('bip84');

function singleSig(wallet: Wallet, address: string, i: number, bip32: any): AddressClipboardItem | null {
    var pubkey = toHex(wallet.keys[0], i, bip32);

    if (bitcoin.payments.p2pkh({ pubkey })?.address != address &&
        bitcoin.payments.p2wpkh({ pubkey })?.address != address) {
        return null;
    }

    return {
        name: 'Bitcoin Address',
        value: address,
        address: address,
        walletName: wallet.name,
        derivationPath: `0/${i}`,
        private: false
    };
}

function toHex(key: ExtendedPublicKey, i: number, bip32: any) {
    let pubKey = key.value.startsWith('zpub') ? new BIP84.fromZPub(key.value).zpub : key.value;

    if (!key.derivationPath) {
        key.derivationPath = '0/0';
    }

    return bip32.fromBase58(pubKey).derivePath(key.derivationPath.replace(/\d+$/, `${i}`)).publicKey;
}

function multiSig(wallet: Wallet, address: string, i: number, bip32: any): AddressClipboardItem | null {
    var pubkeys = wallet.keys
        .map((key) => toHex(key, i, bip32))
        .map((hex) => Buffer.from(hex, 'hex'))
        .sort((a, b) => {
            if (a.equals(b)) return 0;
            return a.compare(b);
        });

    var p2wsh = bitcoin.payments.p2wsh({
        redeem: bitcoin.payments.p2ms({ m: wallet.m, pubkeys })
    });

    const { output } = bitcoin.payments.p2ms({
        m: wallet.m,
        pubkeys: pubkeys
    });
    const p2sh = bitcoin.payments.p2sh({ redeem: { output } });

    if (p2wsh?.address != address && p2sh.address != address) {
        return null;
    }

    return {
        name: 'Bitcoin Address',
        value: address,
        address: address,
        walletName: wallet.name,
        derivationPath: `0/${i}`,
        private: false
    };
}

export function verifyAddress(wallets: Wallet[], address: string): AddressClipboardItem | null {
    var bip32 = BIP32Factory(ecc);

    for (let i = 0; i < 200; i++) {
        for (let j = 0; j < wallets.length; j++) {
            try {
                const wallet = wallets[j];

                if (wallet.policyType == 'Multi Sig') {
                    var result = multiSig(wallet, address, i, bip32);

                    if (result) {
                        return result;
                    }
                } else {
                    var result = singleSig(wallet, address, i, bip32);

                    if (result) {
                        return result;
                    }
                }
            } catch (error) {
                console.log("verifyAddress Error: " + error)
            }
        }
    }

    return null;
}

export function verifyXpub(xpub: string): boolean {
    try {
        var bip32 = BIP32Factory(ecc);

        if (xpub.startsWith('zpub')) {
            xpub = new BIP84.fromZPub(xpub).zpub;
        }

        bip32.fromBase58(xpub).derive(0).derive(0).publicKey;

        return true;
    } catch (error) {
        console.log(error);
        return false;
    }
}
