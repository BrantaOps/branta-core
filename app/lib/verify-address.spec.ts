import { verifyXpub, getPrefix } from './verify-address';

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

    test('Testnet Segwit', () => {
        const valid = 'tpubDDmYUCp38iSBdNXvGvNuPSpKCRZp8Qs2MNchdr6rAkwA36KjZDkveF5pZ3gU5CJGuYvcuj2CwveKgQDBRJh9vH784hSpvubS9zw2wCoDtzn';
        expect(verifyXpub(valid)).toBe(true);
    });

    test('Testnet P2PKH', () => {
        const valid = 'tpubDDCnvgBWxj9Ybh6zg6c1atUtpfFWbqnrEcWWrtXmWSMuqsWrhSzPc73fE7cYiJjVtsY9JE9JBwZyFbdPQ9SqbW6YLymzx5j1WS3wVz4vN46';
        expect(verifyXpub(valid)).toBe(true);
    });

    test('Testnet P2TR', () => {
        const valid = 'tpubDCdJV3Q5vPhUmKiSCiS68w43yKZKEZsd8wxa3t8q4DsPjfejaPDT76SDcf6iscyvLnpz4UXFMzVXxZmH5U6XEQfQYGit5NQCH1McwNSHQhq';
        expect(verifyXpub(valid)).toBe(true);
    });

    test('Testnet garbage', () => {
        const invalid = 'tpubDCdJV3Q5vPhUmKiSCiS68w43yKZKEZsd8wxa3t8q4DsPjfejaPDT76SDcf6iscyvLnpz4UXFMzVXxZmH5U6XEQfQYGit';
        expect(verifyXpub(invalid)).toBe(false);
    });

    test('ypub', () => {
    });

    test('zpub', () => {
    });
});


describe('getPrefix', () => {

    test('1', () => {
        const address = '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa';
        expect(getPrefix(address)).toBe("1");
    });

    test('3', () => {
        const address = '3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy';
        expect(getPrefix(address)).toBe("3");
    });

    test('bc1q', () => {
        const address = 'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kygt080';
        expect(getPrefix(address)).toBe("bc1q");
    });

    test('bc1p', () => {
        const address = 'bc1p5d7rjq7g6rdk2yhzks9smlaqtedr4dekq08ge8ztwac72sfr9rusxg3297';
        expect(getPrefix(address)).toBe("bc1p");
    });

    test('tb1q', () => {
        const address = 'tb1q6l2jt0ysay05yg2af0zx87p06vdyf4rhcp6npe';
        expect(getPrefix(address)).toBe("tb1q");
    });

    test('tb1p', () => {
        const address = 'tb1p6rgz84xkrn8l96s7vx6jd7xae34gs22c9a20q5p86esfj4qr3c0q3k5jjs';
        expect(getPrefix(address)).toBe("tb1p");
    });

    test('garbage', () => {
        const address = 'garbage';
        expect(getPrefix(address)).toBe("");
    });
});
