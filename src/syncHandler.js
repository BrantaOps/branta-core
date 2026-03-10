\n// Sync via NOSTR PoC\nconst nostrEncrypt = (data, nsec) => {\n  const encrypted = encrypt(data, nsec);\n  publishToRelay(encrypted);\n};
