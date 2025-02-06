const XPUB_REGEX = '^([xyYzZtuUvV]pub[1-9A-HJ-NP-Za-km-z]{79,108})$';

export const AddressRegExp = new RegExp('^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$');
export const SegwitAddressRegExp = new RegExp('^bc1[0-9a-zA-Z]{25,65}$');
export const TestnetAddressRegExp = new RegExp('^tb1[0-9a-zA-Z]{25,65}$');
export const TestnetLegacyAddressRegExp = new RegExp('^[2mn](?!sec|pub)[0-9a-zA-Z]{25,65}$');
export const ExtendedKeyRegExp = new RegExp(XPUB_REGEX);
export const NostrPubKeyRegExp = new RegExp('^npub[0-9a-z]{58,65}$');
export const NostrPrivateKeyRegExp = new RegExp('^nsec[0-9a-z]{58,65}$');
export const LightningAddressRegExp = new RegExp('^lnbc[a-zA-z0-9]+$');
export const isBitcoinAddress = (text: string) => {
    return (
        AddressRegExp.test(text) ||
        SegwitAddressRegExp.test(text) ||
        TestnetAddressRegExp.test(text) ||
        (TestnetLegacyAddressRegExp.test(text))
    );
};
