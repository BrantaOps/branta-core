export enum Icon {
    Default = 0,
    Sparrow = 1,
    Bold = 2,
    Trezor = 3,
    Unchained = 4,
    Purple = 5,
    Teal = 6,
    Rust = 7,
    Blockstream = 8,
}

export interface IconOption {
    label: string;
    value: number;
    icon: string;
}

export var iconOptions: IconOption[] = [
    {
        label: 'Default',
        icon: 'default.svg',
        value: Icon.Default,
    },
    {
        label: 'Sparrow',
        icon: 'sparrow.png',
        value: Icon.Sparrow,
    },
    {
        label: 'Bold',
        icon: 'bold.png',
        value: Icon.Bold
    },
    {
        label: 'Trezor',
        icon: 'trezor_white.svg',
        value: Icon.Trezor
    },
    {
        label: 'Unchained',
        icon: 'unchained.png',
        value: Icon.Unchained
    },
    {
        label: 'Blockstream',
        icon: 'blockstream.svg',
        value: Icon.Blockstream
    },
    {
        label: 'Purple',
        icon: 'purple.svg',
        value: Icon.Purple
    },
    {
        label: 'Teal',
        icon: 'teal.svg',
        value: Icon.Teal
    },
    {
        label: 'Rust',
        icon: 'rust.svg',
        value: Icon.Rust
    },
];
