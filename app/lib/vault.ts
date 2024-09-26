import { dialog } from 'electron';
import { Vault, VaultCompany } from '../../src/app/shared/models/vault.model';
import { ExtendedPublicKey, PolicyType } from '../../src/app/shared/models/wallet.model';
import { loadRecords, saveRecords } from './storage';
import { verifyXpub } from './verify-address';

export class RequiredError extends Error {
    constructor(name: string) {
        super(`${name} is a required parameter`);
    }
}

export class NameMustBeUniqueError extends Error {
    constructor() {
        super('name must be unique.');
    }
}

export class NumberOfKeysMustMatchNError extends Error {
    constructor() {
        super('Number of keys must match n');
    }
}

export class XpubRequiredError extends Error {
    constructor(index: string) {
        super(`xpub${index} required since dpath${index} exists.`);
    }
}

export class InvalidXpubError extends Error {
    constructor(index: string) {
        super(`'xpub${index}' is not a valid xpub.`)
    }
}

export class MGreaterThanNError extends Error {
    constructor() {
        super('m must be less than or equal to n.');
    }
}

function getNumber(params: URLSearchParams, name: string): number | null {
    const value = params.get(name);
    return value !== null && !isNaN(Number(value)) ? Number(value) : null;
}

function getKeys(params: URLSearchParams): ExtendedPublicKey[] {
    const values: Record<string, ExtendedPublicKey> = {};

    for (const [key, value] of params) {
        const xpubMatch = key.match(/^xpub(\d+)$/);

        if (xpubMatch) {
            const index = parseInt(xpubMatch[1], 10);
            if (index in values) {
                values[index] = {
                    ...values[index],
                    value
                };
            } else {
                values[index] = {
                    derivationPath: null,
                    value
                };
            }
            continue;
        }

        const dpathMatch = key.match(/^dpath(\d+)$/);

        if (!dpathMatch) {
            continue;
        }

        const index = parseInt(dpathMatch[1], 10);
        if (index in values) {
            values[index] = {
                ...values[index],
                derivationPath: value
            };
        } else {
            values[index] = {
                value: '',
                derivationPath: value
            };
        }
    }

    let result: ExtendedPublicKey[] = [];

    for (const index in values) {
        let value = values[index];

        if (!value.value) {
            throw new XpubRequiredError(index);
        }

        if (!verifyXpub(value.value)) {
            throw new InvalidXpubError(index);
        }

        result.push(value);
    }

    return result;
}

export function urlParser(url: string): Vault {
    let params = new URLSearchParams(url.replace(/^branta:\/\//, '').replace(/\/$/, ''));

    let name = params.get('name');
    if (name == null) {
        throw new RequiredError('name');
    }

    let vaults = loadRecords('vault') as Vault[];

    if (vaults.some(vault => vault.name == name)) {
        throw new NameMustBeUniqueError();
    }

    let keys = getKeys(params);
    if (keys.length == 0) {
        throw new RequiredError('xpub');
    }

    let n = getNumber(params, 'n') ?? keys.length;
    if (n == null) {
        throw new RequiredError('n');
    }

    if (keys.length != Number(n)) {
        throw new NumberOfKeysMustMatchNError();
    }

    let m = getNumber(params, 'm') ?? (keys.length == 1 ? 1 : null);
    if (m == null) {
        throw new RequiredError('m');
    }
    if (m > n) {
        throw new MGreaterThanNError();
    }

    return {
        id: 0,
        name,
        company: params.get('company') as VaultCompany | null,
        policyType: keys.length == 1 ? PolicyType.SingleSig : PolicyType.MultiSig,
        m,
        n,
        keys: keys
    };
}

function addVault(mainWindow: any, vault: Vault) {
    let vaults = loadRecords('vault') as Vault[];

    vault.id = vaults.length == 0 ? 1 : Math.max(...vaults.map((vault) => vault.id + 1));

    vaults.push(vault);

    saveRecords('vault', vaults);

    mainWindow.webContents.send('vault-created', vault);
}

export function processUrl(mainWindow: any, argv: string[]) {
    let openFromUrl = argv.find(arg => arg.includes("branta://"));

    if (openFromUrl == null || openFromUrl.length == 0) {
        return;
    }

    // Check if the URL is exactly 'branta://'
    if (openFromUrl === "branta://") {
        return;
    }

    try {
        let vault = urlParser(openFromUrl) as Vault;
        addVault(mainWindow, vault);
    } catch (error) {
        dialog.showMessageBox(mainWindow, {
            type: 'error',
            buttons: ['Ok'],
            title: 'Error',
            message: 'Error importing Wallet',
            detail: String(error),
        });
    }
}
