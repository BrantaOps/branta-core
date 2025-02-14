import { Address, AddressType } from "../../src/app/shared/models/address";
import { AddressClipboardItem } from "../../src/app/shared/models/clipboard-item";
import { ExtendedPublicKey, PolicyType, Wallet } from "../../src/app/shared/models/wallet.model";

const bitcoin = require('bitcoinjs-lib');
const ecc = require('tiny-secp256k1');
const { BIP32Factory } = require('bip32');
const BIP84 = require('bip84');

bitcoin.initEccLib(ecc);

const MAX_ACCOUNT = 1;

export function getPrefix(address: string) {
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

    if (address.startsWith('tb1q')) {
        return 'tb1q';
    }

    if (address.startsWith('tb1p')) {
        return 'tb1p';
    }

    return '';
}

export function getAllAddresses(wallet: Wallet, i: number): Address[] {
    var bip32 = BIP32Factory(ecc);

    if (wallet.policyType == PolicyType.SingleSig) {
        return [
            AddressType.PayToPublicKeyHash,
            AddressType.PayToWitnessPublicKeyHash,
            AddressType.PayToTapRoot,
        ]
            .map((type) => {
                var address = getSingleSigAddress(wallet, 0, i, type, bip32);
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
                var address = getMultiSigAddress(wallet, 0, i, type, bip32);
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

function getNetwork(wallet: Wallet) {
    return (wallet.keys[0].value.startsWith('tpub')) ? bitcoin.networks.testnet : bitcoin.networks.bitcoin;
}

function getSingleSigAddress(wallet: Wallet, account: number, i: number, type: AddressType, bip32: any): string {
    const network = getNetwork(wallet);

    const pubkey = toHex(wallet.keys[0], account, i, bip32);

    if (type == AddressType.PayToPublicKeyHash) {
        return bitcoin.payments.p2pkh(
            {
                pubkey,
                network
            })?.address;
    } else if (type == AddressType.PayToWitnessPublicKeyHash) {
        return bitcoin.payments.p2wpkh({
            pubkey,
            network
        })?.address;
    } else if (type == AddressType.PayToTapRoot) {
        return bitcoin.payments.p2tr({
            internalPubkey: pubkey.slice(1),
            network
        })?.address;
    }

    throw Error("Single sig address type not found.");
}

function getMultiSigAddress(wallet: Wallet, account: number, i: number, type: AddressType, bip32: any): string {
    const network = getNetwork(wallet);

    var pubkeys = wallet.keys
        .map((key) => toHex(key, account, i, bip32))
        .map((hex) => Buffer.from(hex, 'hex'))
        .sort((a, b) => {
            if (a.equals(b)) return 0;
            return a.compare(b);
        });
    if (type == AddressType.PayToWitnessPublicKeyHash) {
        var p2wsh = bitcoin.payments.p2wsh({
            redeem: bitcoin.payments.p2ms({ m: wallet.m, pubkeys, network }),
            network
        });

        return p2wsh.address;
    } else if (type == AddressType.PayToScriptHash) {
        const { output } = bitcoin.payments.p2ms({
            m: wallet.m,
            pubkeys: pubkeys,
            network
        });
        const p2sh = bitcoin.payments.p2sh({ redeem: { output }, network });

        return p2sh.address;
    }

    throw Error("Multi sig address type not found.");
}

function singleSig(wallet: Wallet, address: string, account: number, i: number, bip32: any): AddressClipboardItem | null {
    if (getSingleSigAddress(wallet, account, i, AddressType.PayToPublicKeyHash, bip32) != address &&
        getSingleSigAddress(wallet, account, i, AddressType.PayToWitnessPublicKeyHash, bip32) != address &&
        getSingleSigAddress(wallet, account, i, AddressType.PayToTapRoot, bip32) != address) {
        return null;
    }

    return {
        name: 'Bitcoin Address',
        value: address,
        address: address,
        wallet: wallet,
        derivationPath: `${account}/${i}`,
        private: false
    };
}

function toHex(key: ExtendedPublicKey, account: number, i: number, bip32: any) {
    let pubKey = key.value.startsWith('zpub') ? new BIP84.fromZPub(key.value).zpub : key.value;

    if (key.value.startsWith('tpub')) {
        return bip32.fromBase58(pubKey, bitcoin.networks.testnet).derivePath(`${account}/${i}`).publicKey;
    }
    else {
        return bip32.fromBase58(pubKey).derivePath(`${account}/${i}`).publicKey;
    }
}

function multiSig(wallet: Wallet, address: string, account: number, i: number, bip32: any): AddressClipboardItem | null {
    if (getMultiSigAddress(wallet, account, i, AddressType.PayToWitnessPublicKeyHash, bip32) != address &&
        getMultiSigAddress(wallet, account, i, AddressType.PayToScriptHash, bip32) != address) {
        return null;
    }

    return {
        name: 'Bitcoin Address',
        value: address,
        address: address,
        wallet: wallet,
        derivationPath: `${account}/${i}`,
        private: false
    };
}

export function verifyAddress(wallets: Wallet[], address: string): AddressClipboardItem | null {
    var bip32 = BIP32Factory(ecc);

    for (let j = 0; j < wallets.length; j++) {
        const wallet = wallets[j];
        for (let i = (wallet.indexStart ?? 0); i < (wallet.indexLimit ?? 50) + 1; i++) {
            for (let k = 0; k <= MAX_ACCOUNT; k++) {
                try {

                    if (wallet.policyType == 'Multi Sig') {
                        var result = multiSig(wallet, address, k, i, bip32);

                        if (result) {
                            return result;
                        }
                    } else {
                        var result = singleSig(wallet, address, k, i, bip32);

                        if (result) {
                            return result;
                        }
                    }
                } catch (error) {
                    console.log("verifyAddress Error: " + error)
                }
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

        if (xpub.startsWith('tpub')) {
            bip32.fromBase58(xpub, bitcoin.networks.testnet).derive(0).derive(0).publicKey;
        }
        else {
            bip32.fromBase58(xpub).derive(0).derive(0).publicKey;
        }

        return true;
    } catch (error) {
        console.log(error);
        return false;
    }
}
