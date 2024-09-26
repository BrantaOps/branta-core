import { app, safeStorage } from 'electron';
import * as path from 'path';
import * as fs from 'fs';

export function loadRecords(name: string): Object[] {
    let recordPath = path.join(app.getPath('userData'), `${name}.json`);
    if (!fs.existsSync(recordPath)) {
        return [];
    }

    const data = fs.readFileSync(recordPath);
    return JSON.parse(safeStorage.decryptString(data));
}

export function saveRecords(name: string, data: Object[]): void {
    let recordPath = path.join(app.getPath('userData'), `${name}.json`);

    fs.writeFileSync(recordPath, safeStorage.encryptString(JSON.stringify(data)));
}
