export enum Icon {
    Default = 0,
    Sparrow = 1,
    Bold = 2,
    Yopaki = 3
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
        label: 'Yopaki',
        icon: 'yopaki.png',
        value: Icon.Yopaki
    }
];
