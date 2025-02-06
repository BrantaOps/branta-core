import {
  AddressRegExp,
  SegwitAddressRegExp,
  TestnetAddressRegExp,
  TestnetLegacyAddressRegExp,
  NostrPubKeyRegExp,
  NostrPrivateKeyRegExp,
  LightningAddressRegExp,
  isBitcoinAddress
 } from './regex';

describe('ClipboardService isBitcoinAddress', () => {
  it('should match a valid Bitcoin Address', () => {
    expect(isBitcoinAddress('1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa')).toBe(true);
  });
  it('should not match a nostr pub key', () => {
    expect(isBitcoinAddress('npub1d4ed5x49d7p24xn63flj4985dc4gpfngdhtqcxpth0ywhm6czxcscfpcq8')).toBe(false);
  });

  it('should not match a nostr pub key', () => {
    expect(isBitcoinAddress('npub1d4ed5x49d7p24xn63flj4985dc4gpfngdhtqcxpth0ywhm6czxcscfpcq8')).toBe(false);
  });

  it('should not match a nostr private key', () => {
    expect(isBitcoinAddress('nsec1hp4ahsfaadfwkytju7evnqsmxc5rjul0cd709msu64kw40d0m29s2zx8kf')).toBe(false);
  });

  it('should match a testnet legacy address', () => {
    expect(isBitcoinAddress('2N2JD6wb56AfK4tfmM6PwdVmoYk2dCKf4Br')).toBe(true);
  });
})

describe('ClipboardService Regex Tests', () => {
  it('should match valid Bitcoin addresses', () => {
    expect(AddressRegExp.test('1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa')).toBe(true);
    expect(AddressRegExp.test('3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy')).toBe(true);
    expect(AddressRegExp.test(' 3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy')).toBe(false);
    expect(AddressRegExp.test('3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy ')).toBe(false);
    expect(AddressRegExp.test('3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy.')).toBe(false);
    expect(AddressRegExp.test('-3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy')).toBe(false);
    expect(AddressRegExp.test('-3J98t1WpEZ73/CNmQviecrnyiWrnqRhWNLy')).toBe(false);
    expect(AddressRegExp.test('InvalidAddress')).toBe(false);
  });

  it('should match valid SegWit Bitcoin addresses', () => {
    expect(SegwitAddressRegExp.test('bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kygt080')).toBe(true);
    expect(SegwitAddressRegExp.test('bc1qrp33g0qynl8xe4dp9r83pkkfjhx0wlh8yk69yg')).toBe(true);
    expect(SegwitAddressRegExp.test('bc1qrp33g0qynl8xe4dp9r83pkkfjhx0wlh8yk69yg ')).toBe(false);
    expect(SegwitAddressRegExp.test(' bc1qrp33g0qynl8xe4dp9r83pkkfjhx0wlh8yk69yg')).toBe(false);
    expect(SegwitAddressRegExp.test('bc1qrp33g0qynl/8xe4dp9r83pkkfjhx0wlh8yk69yg')).toBe(false);
    expect(SegwitAddressRegExp.test('bc1qrp33g0qynl8xe4dp9r83pkkfjhx0.wlh8yk69yg')).toBe(false);
    expect(SegwitAddressRegExp.test('bc1qrp33g0qynl8xe4dp9r83pkkfjhx0wlh8yk69yg$')).toBe(false);
    expect(SegwitAddressRegExp.test('InvalidAddress')).toBe(false);
  });

  it('should match valid TapRoot Bitcoin addresses', () => {
    expect(SegwitAddressRegExp.test('bc1p5d7rjq7g6rdk2yhzks9smlaqtedr4dekq08ge8ztwac72sfr9rusxg3297')).toBe(true);
    expect(SegwitAddressRegExp.test(' bc1p5d7rjq7g6rdk2yhzks9smlaqtedr4dekq08ge8ztwac72sfr9rusxg3297')).toBe(false);
    expect(SegwitAddressRegExp.test('%bc1p5d7rjq7g6rdk2yhzks9smlaqtedr4dekq08ge8ztwac72sfr9rusxg3297')).toBe(false);
    expect(SegwitAddressRegExp.test('bc1p5d7rjq7g6rdk2yhzks/9smlaqtedr4dekq08ge8ztwac72sfr9rusxg3297')).toBe(false);
    expect(SegwitAddressRegExp.test('bc1p5d7rjq7g6rdk2yhzks9smlaqtedr4dekq08ge8ztwac72sfr9rusxg3297.')).toBe(false);
    expect(SegwitAddressRegExp.test('bc1p5d7rjq7g6rdk2yhzks9smlaqtedr4dekq08ge8ztwac72sfr9rusxg3297://')).toBe(false);
  });

  it('should match valid Testnet SegWit Bitcoin addresses', () => {
    expect(TestnetAddressRegExp.test('tb1q6l2jt0ysay05yg2af0zx87p06vdyf4rhcp6npe')).toBe(true);
    expect(TestnetAddressRegExp.test('tb1p6rgz84xkrn8l96s7vx6jd7xae34gs22c9a20q5p86esfj4qr3c0q3k5jjs')).toBe(true);
    expect(TestnetAddressRegExp.test('InvalidAddress')).toBe(false);
  });

  it('should match valid Testnet Legacy Bitcoin addresses', () => {
    expect(TestnetLegacyAddressRegExp.test('nsec1hp4ahsfaadfwkytju7evnqsmxc5rjul0cd709msu64kw40d0m29s2zx8kf')).toBe(false);
    expect(TestnetLegacyAddressRegExp.test('2N2JD6wb56AfK4tfmM6PwdVmoYk2dCKf4Br')).toBe(true);
    expect(TestnetLegacyAddressRegExp.test('InvalidAddress')).toBe(false);
  });

  it('should match valid Nostr public keys', () => {
    expect(NostrPubKeyRegExp.test('npub1d4ed5x49d7p24xn63flj4985dc4gpfngdhtqcxpth0ywhm6czxcscfpcq8')).toBe(true);
    expect(NostrPubKeyRegExp.test('npub1d4ed5x49d7p24xn63flj4985dc4gpfngdhtqcxpt:h0ywhm6czxcscfpcq8')).toBe(false);
    expect(NostrPubKeyRegExp.test('npub1examplekey1234567890abcdef ')).toBe(false);
    expect(NostrPubKeyRegExp.test('InvalidNostrPubKey')).toBe(false);
  });

  it('should match valid Nostr private keys', () => {
    expect(NostrPrivateKeyRegExp.test('nsec1d4ed5x49d7p24xn63flj4985dc4gpfngdhtqcxpth0ywhm6czxcs5l2exj')).toBe(true);
    expect(NostrPrivateKeyRegExp.test('nsec1d4ed5x.49d7p24xn63flj4985dc4gpfngdhtqcxpth0ywhm6czxcs5l2exj')).toBe(false);
    expect(NostrPrivateKeyRegExp.test('nsec1d4ed5x49d7p24xn63flj4985dc4gpfngdhtqcxpth0ywhm6czxcs5l2exj:')).toBe(false);
    expect(NostrPrivateKeyRegExp.test('nsec1d4ed5x49d7p24xn63flj4985dc4gpfngdhtqcxpth0ywhm6czxcs5l2exj ')).toBe(false);
    expect(NostrPrivateKeyRegExp.test('InvalidNostrPrivateKey')).toBe(false);
  });

  it('should match valid Lightning addresses', () => {
    expect(LightningAddressRegExp.test('lnbc1pwr45dpp5q9wa3sjr4cnyvdh0wwufzldvlnm2qa5lc2sh3qkp3y')).toBe(true);
    expect(LightningAddressRegExp.test('lnbc5530n1pnn2jh0pp5gwzykw0ttdk84pr583lmq4f05nnvha9ae9k4q88gwkr6x503dlcqdq2f38xy6t5wvcqzzsxqrrsssp5yq8dcyjkf2wy5fasu6pm7z02l7lzkceq95a26krgnaaknkexlprq9qyyssq7qtyq7d7qwaftgajs496dkmylkrnmj5l4cunlyqpkadn08xyumt4nx79fh8auvd79a3hhr38q7t2j04zqysz48mrhhq3y9ufylazy7cqtv2804')).toBe(true);
    expect(LightningAddressRegExp.test('lnbc1pwr45dpp5q9wa3sjr4cnyvdh0wwufzldvlnm2qa5lc2sh3qkp3y ')).toBe(false);
    expect(LightningAddressRegExp.test(' lnbc1pwr45dpp5q9wa3sjr4cnyvdh0wwufzldvlnm2qa5lc2sh3qkp3y')).toBe(false);
    expect(LightningAddressRegExp.test('-lnbc1pwr45dpp5q9wa3sjr4cnyvdh0wwufzldvlnm2qa5lc2sh3qkp3y')).toBe(false);
    expect(LightningAddressRegExp.test('lnbc1pwr45dpp5q9wa3sjr-4cnyvdh0wwufzldvlnm2qa5lc2sh3qkp3y')).toBe(false);
    expect(LightningAddressRegExp.test('lnbc1pwr45dpp5q9wa3sjr4cnyvdh0wwufzldvlnm2qa5lc2sh3qkp3y://')).toBe(false);
    expect(LightningAddressRegExp.test('InvalidLightningAddress')).toBe(false);
  });
});
