# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run ng:serve          # Start Angular dev server (localhost:4200)
npm start                 # Build Electron app + launch with APP_DEV=true

# Building
npm run build             # Build both Electron app and Angular frontend
npm run build:app         # Compile Electron TypeScript (app/ → build/app/)
npm run build:prod        # Angular production build (→ dist/branta/browser/)

# Testing
npm test                  # Run Jest tests (app/lib/*.spec.ts)
npm run test:watch        # Jest watch mode
# Frontend component tests use Karma/Jasmine via: ng test

# Run a single Jest test file
npx jest app/lib/vault.spec.ts

# Quality
npm run lint              # ESLint (ng lint)
```

**Requirements**: Node >=22, npm >=10

## Architecture

Branta Core is an Electron + Angular desktop app that monitors the clipboard for Bitcoin/Nostr content (addresses, xpubs, Lightning payments) and notifies the user if something suspicious or recognizable is detected.

### Two distinct codebases

**`app/`** — Electron main process (TypeScript, compiled to CommonJS via `tsconfig.app.json`):
- `main.ts` — Window lifecycle, tray, IPC handlers, clipboard polling (300ms interval via `setInterval`)
- `lib/verify-address.ts` — Bitcoin address and xpub verification using `bip32`, `bip84`, `bitcoinjs-lib`, `tiny-secp256k1`
- `lib/vault.ts` — Parses `branta://` deep-link URLs into Vault objects; handles multisig wallet import
- `lib/lightning.ts` — Decodes Lightning invoices via `bolt11`
- `lib/storage.ts` — JSON file persistence for wallets, vaults, settings, history

**`src/`** — Angular 19 frontend (compiled separately via Angular CLI):
- Uses Angular Material + ngx-toastr for UI
- Communicates with Electron exclusively via IPC through `window.electron` (defined in `app/preload.ts`)
- `src/app/shared/services/` — Services inject IPC calls; `clipboard.service.ts` receives `clipboard-updated` events from main
- `src/app/features/` — Four main sections: clipboard, wallets, vaults, settings

### IPC boundary

Main process exposes handlers via `ipcMain.handle(...)`. The Angular app calls them through the preload-exposed API. Key channels: `verify-address`, `verify-xpub`, `store-data`, `retrieve-data`, `decode-lightning`, `get-all-addresses`, `show-notification`, `open-url`.

The main process pushes clipboard changes to the renderer via `mainWindow.webContents.send('clipboard-updated', text)`.

### Dev mode vs production

`APP_DEV=true` (set by `npm start`) makes Electron load `http://localhost:4200` instead of the built `dist/` files. Run `ng:serve` and `npm start` simultaneously for full hot-reload development.

### Testing split

- **Jest** (`jest.config.ts`, node environment): Tests in `app/lib/*.spec.ts` — pure business logic, no Electron dependencies
- **Karma/Jasmine**: Angular component/service tests in `src/**/*.spec.ts`

### Packaging

`npm run make` → full build → `electron-forge make` → platform distributables (DEB/RPM/ZIP/DMG/PKG). Windows MSI uses a WiX project in `installers/windows/`.


## Adding New Features and Fixing Bugs

**CRITICAL WORKFLOW - FOLLOW THESE STEPS:**

### 1. Create a Git Branch FIRST
Before making any code changes, create and switch to a new branch:
- **Format**: `feature/TICKET_NUMBER` for features, `bugfix/TICKET_NUMBER` for bugs
- **Example**: For prompt "Feature 1234: Add admin dashboard", create branch `feature/1234`
- Stay on this branch for the entire session

### 2. For New Features
1. Implement the feature code
2. Write tests to achieve 100% code coverage for the new feature
3. Run all tests to confirm they pass

### 3. For Bug Fixes (Test-Driven Approach)
1. **First**: Write a failing test that reproduces the bug
2. Run the test and confirm it fails
3. **Then**: Write code to fix the bug
4. Run the test again and confirm it now passes
5. Run full test suite to ensure no regressions
