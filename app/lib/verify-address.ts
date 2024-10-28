import { Address, AddressType } from "../../src/app/shared/models/address";
import { AddressClipboardItem } from "../../src/app/shared/models/clipboard-item";
import { ExtendedPublicKey, PolicyType, Wallet } from "../../src/app/shared/models/wallet.model";

const bitcoin = require('bitcoinjs-lib');
const ecc = require('tiny-secp256k1');
const { BIP32Factory } = require('bip32');
const BIP84 = require('bip84');

bitcoin.initEccLib(ecc);

function getPrefix(address: string) {
    if (address.startsWith('1')) {
        return '1';
    }

    if (address.startsWith('3')) {
        return '3';
    }

    if (address.startsWith('bc1q')) {
        return 'bc1q';
    }

    if (address.startsWith('bc1p')) {
        return 'bc1p';
    }

    return '';
}

export function getAllAddresses(wallet: Wallet, i: number): Address[] {
    var bip32 = BIP32Factory(ecc);

    if (wallet.policyType == PolicyType.SingleSig) {
        return [AddressType.PayToPublicKeyHash, AddressType.PayToWitnessPublicKeyHash, AddressType.PayToTapRoot]
            .map((type) => {
                var address = getSingleSigAddress(wallet, i, type, bip32);
                var prefix = getPrefix(address);

                return {
                    value: address,
                    prefix: prefix,
                    remainder: address.replace(new RegExp(`^${prefix}`), ''),
                    type: type.toString(),
                    selected: false
                } as Address;
            });
    } else {
        return [AddressType.PayToWitnessPublicKeyHash, AddressType.PayToScriptHash]
            .map((type) => {
                var address = getMultiSigAddress(wallet, i, type, bip32);
                var prefix = getPrefix(address);

                return {
                    value: address,
                    prefix: prefix,
                    remainder: address.replace(new RegExp(`^${prefix}`), ''),
                    type: type.toString(),
                    selected: false
                } as Address;
            });
    }
}

function getSingleSigAddress(wallet: Wallet, i: number, type: AddressType, bip32: any): string {
    var pubkey = toHex(wallet.keys[0], i, bip32);

    if (type == AddressType.PayToPublicKeyHash) {
        return bitcoin.payments.p2pkh({ pubkey })?.address;
    } else if (type == AddressType.PayToWitnessPublicKeyHash) {
        return bitcoin.payments.p2wpkh({ pubkey })?.address;
    } else if (type == AddressType.PayToTapRoot) {
        return bitcoin.payments.p2tr({
          internalPubkey: pubkey.slice(1),
          network: bitcoin.networks.bitcoin
        })?.address;
    }

    throw Error("Single sig address type not found.");
}

function getMultiSigAddress(wallet: Wallet, i: number, type: AddressType, bip32: any): string {
    var pubkeys = wallet.keys
        .map((key) => toHex(key, i, bip32))
        .map((hex) => Buffer.from(hex, 'hex'))
        .sort((a, b) => {
            if (a.equals(b)) return 0;
            return a.compare(b);
        });
    if (type == AddressType.PayToWitnessPublicKeyHash) {
        var p2wsh = bitcoin.payments.p2wsh({
            redeem: bitcoin.payments.p2ms({ m: wallet.m, pubkeys })
        });

        return p2wsh.address;
    } else if (type == AddressType.PayToScriptHash) {
        const { output } = bitcoin.payments.p2ms({
            m: wallet.m,
            pubkeys: pubkeys
        });
        const p2sh = bitcoin.payments.p2sh({ redeem: { output } });

        return p2sh.address;
    }

    throw Error("Multi sig address type not found.");
}

function singleSig(wallet: Wallet, address: string, i: number, bip32: any): AddressClipboardItem | null {
    if (getSingleSigAddress(wallet, i, AddressType.PayToPublicKeyHash, bip32) != address &&
        getSingleSigAddress(wallet, i, AddressType.PayToWitnessPublicKeyHash, bip32) != address &&
        getSingleSigAddress(wallet, i, AddressType.PayToTapRoot, bip32) != address) {
        return null;
    }

    return {
        name: 'Bitcoin Address',
        value: address,
        address: address,
        wallet: wallet,
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
    if (getMultiSigAddress(wallet, i, AddressType.PayToWitnessPublicKeyHash, bip32) != address &&
        getMultiSigAddress(wallet, i, AddressType.PayToScriptHash, bip32) != address) {
        return null;
    }

    return {
        name: 'Bitcoin Address',
        value: address,
        address: address,
        wallet: wallet,
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
    const xpubRegex = /(xpub[a-zA-Z0-9]+|ypub[a-zA-Z0-9]+|zpub[a-zA-Z0-9]+)/;
    try {
        var bip32 = BIP32Factory(ecc);

        const match = xpub.match(xpubRegex);
        if (match) {
          xpub = match[0];
        }

        if (xpub.startsWith('zpub')) {
            xpub = new BIP84.fromZPub(xpub).zpub;
        }

        bip32.fromBase58(xpub).derive(0).derive(0).publicKey;

        console.log("RETURNING TRUE IN VERIFY XPUB");
        return true;
    } catch (error) {
        console.log(error);
        return false;
    }
}
