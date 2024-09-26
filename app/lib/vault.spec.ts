import { Vault } from '../../src/app/shared/models/vault.model';
import { PolicyType } from '../../src/app/shared/models/wallet.model';
import { loadRecords } from './storage';
import { InvalidXpubError, MGreaterThanNError, NameMustBeUniqueError, NumberOfKeysMustMatchNError, RequiredError, XpubRequiredError, urlParser } from './vault';

jest.mock('./storage', () => ({
    loadRecords: jest.fn(),
    saveRecords: jest.requireActual('./storage').saveRecords,
}));

const xpub0 = 'xpub661MyMwAqRbcFtXgS5sYJABqqG9YLmC4Q1Rdap9gSE8NqtwybGhePY2gZ29ESFjqJoCu1Rupje8YtGqsefD265TMg7usUDFdp6W1EGMcet8';
const xpub1 = 'xpub661MyMwAqRbcFtXgS5sYJABqqG9YLmC4Q1Rdap9gSE8NqtwybGhePY2gZ29ESFjqJoCu1Rupje8YtGqsefD265TMg7usUDFdp6W1EGMcet8';
const xpub2 = 'xpub661MyMwAqRbcFtXgS5sYJABqqG9YLmC4Q1Rdap9gSE8NqtwybGhePY2gZ29ESFjqJoCu1Rupje8YtGqsefD265TMg7usUDFdp6W1EGMcet8';

describe('urlParser', () => {
    it('should fail with no name specified.', () => {
        expect(() => urlParser('')).toThrow(RequiredError);
    });

    it('should fail with name not unique.', () => {
        const mockVaults = [
            { id: '1', name: 'NotUnique' },
        ];

        (loadRecords as jest.Mock).mockReturnValue(mockVaults);

        expect(() => urlParser('name=NotUnique')).toThrow(NameMustBeUniqueError);
    });

    it('should fail with no xpubs set', () => {
        (loadRecords as jest.Mock).mockReturnValue([]);

        expect(() => urlParser('name=Unique')).toThrow(RequiredError);
    });

    it('should fail with n not equal to number of xpubs', () => {
        (loadRecords as jest.Mock).mockReturnValue([]);

        expect(() => urlParser(`name=Unique&xpub0=${xpub0}&n=0`)).toThrow(NumberOfKeysMustMatchNError);
        expect(() => urlParser(`name=Unique&xpub0=${xpub0}&n=2`)).toThrow(NumberOfKeysMustMatchNError);
        expect(() => urlParser(`name=Unique&xpub0=${xpub0}&xpub0=${xpub0}&n=3`)).toThrow(NumberOfKeysMustMatchNError);
    });

    it('should fail with invalid xpub set', () => {
        (loadRecords as jest.Mock).mockReturnValue([]);

        expect(() => urlParser(`name=Unique&xpub0=xpub123`)).toThrow(InvalidXpubError);
    });

    it('should fail with xpub required if dpath set', () => {
        (loadRecords as jest.Mock).mockReturnValue([]);

        expect(() => urlParser(`name=Unique&dpath0=0/0&xpub1=${xpub1}`)).toThrow(XpubRequiredError);
    })

    it('should fail with no m specified', () => {
        (loadRecords as jest.Mock).mockReturnValue([]);

        expect(() => urlParser(`name=Unique&xpub0=${xpub0}&xpub1=${xpub1}&n=2`)).toThrow(RequiredError);
    });

    it('should fail with m greater than n', () => {
        (loadRecords as jest.Mock).mockReturnValue([]);

        expect(() => urlParser(`name=Unique&xpub0=${xpub0}&xpub1=${xpub1}&n=2&m=3`)).toThrow(MGreaterThanNError);
    });

    it('should pass', () => {
        (loadRecords as jest.Mock).mockReturnValue([]);

        var result: Vault = urlParser(`name=Unique&xpub0=${xpub0}&xpub1=${xpub1}&xpub2=${xpub2}&m=2`);

        expect(result.name).toBe('Unique');
        expect(result.company).toBe(null);
        expect(result.policyType).toBe(PolicyType.MultiSig);
        expect(result.m).toBe(2);
        expect(result.n).toBe(3);
        expect(result.keys.length).toBe(3);
    });
});
