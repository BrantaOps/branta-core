const { FusesPlugin } = require('@electron-forge/plugin-fuses');
const { FuseV1Options, FuseVersion } = require('@electron/fuses');
const path = require('path');

module.exports = {
    packagerConfig: {
        asar: true,
        icon: path.join(__dirname, 'resources/icon'),
        executableName: 'branta',
        appBundleId: "branta.mac",
        buildVersion: '7',
        extraResource: [
            path.join(__dirname, 'resources/icon.png'),
            path.join(__dirname, 'resources/icon.ico'),
            path.join(__dirname, 'resources/tray-mac.png')
        ],
        ignore: ['installers'],
        osxSign: {},
        osxNotarize: {
            tool: 'notarytool',
            appleId: process.env.APPLE_ID,
            appleIdPassword: process.env.APPLE_PASSWORD,
            teamId: process.env.APPLE_TEAM_ID
        }
    },
    rebuildConfig: {},
    makers: [
        {
            name: '@electron-forge/maker-zip',
            platforms: ['darwin']
        },
        {
            name: '@electron-forge/maker-deb',
            config: {
                icon: 'resources/icon.png',
                executableName: 'Branta',
                name: 'Branta',
                mimeType: ["x-scheme-handler/branta"]
            }
        },
        {
            name: '@electron-forge/maker-rpm',
            config: {}
        },
        {
            name: '@electron-forge/maker-dmg',
            config: {
                background: './resources/dmg-background.jpg',
                format: 'ULFO',
                setupIcon: './resources/icon.icns'
            }
        },
        {
            "name": "@electron-forge/maker-pkg",
            "platforms": ["darwin"]
        }
    ],
    plugins: [
        {
            name: '@electron-forge/plugin-auto-unpack-natives',
            config: {}
        },
        // Fuses are used to enable/disable various Electron functionality
        // at package time, before code signing the application
        new FusesPlugin({
            version: FuseVersion.V1,
            [FuseV1Options.RunAsNode]: false,
            [FuseV1Options.EnableCookieEncryption]: true,
            [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
            [FuseV1Options.EnableNodeCliInspectArguments]: false,
            [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
            [FuseV1Options.OnlyLoadAppFromAsar]: true
        })
    ]
};
