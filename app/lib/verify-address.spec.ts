import { verifyXpub } from './verify-address';

describe('verifyXpub', () => {

    test('Native Segwit', () => {
        const valid = 'xpub6CZbGEd4YL33sqfx5ZxEqgANx9p7KV6qai4LbmkSZCH28ueYEboWPDYnoaXWqP3hig9J7VzbC4QaLwPi3YzpdxmnEdy5USMpqEULzHyMcAm';
        expect(verifyXpub(valid)).toBe(true);
    });

    test('p2tr', () => {
        const valid = 'xpub6D8yByp7kK9vESeHG1Z4RZwThQTGe91dNu55PBpSkwMNHBcAPkJrkKkV8ScXaSUeV16Ub7zXeYohDKFokcGJMNZa4cStK49EEc6vPkeKfeM';
        expect(verifyXpub(valid)).toBe(true);
    });

    test('invalid', () => {
        const invalid = 'xpub661MyMwAqRbcFtXgS5sYJABqqG9YLmC4Q1Rdap9gSE8NqtwybGhePY2gZ29ESFjqJoCu1Rupje8YtGqsefD265TMg7usUDFdp6W';
        expect(verifyXpub(invalid)).toBe(false);
    });

    test('invalid format', () => {
        const invalid = '123';
        expect(verifyXpub(invalid)).toBe(false);
    });

    test('tpub', () => {
    });

    test('ypub', () => {
    });

    test('zpub', () => {
    });
});
