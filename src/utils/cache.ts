import fs from 'fs'
import path from 'path'

import logger from './logger'

const cacheFolderPath = path.join(process.cwd(), '.cache');

const _ensureCacheDirExists = () => {
    if (!fs.existsSync(cacheFolderPath)) {
        fs.mkdirSync(cacheFolderPath);
    }
}

export const cache = {
    logger: logger.use({
        prefix: ({ yellow }) => yellow('[CACHE]')
    }),
    write(key: string, data: unknown) {
        _ensureCacheDirExists();

        const filePath = path.join(cacheFolderPath, `${key}.json`);
        fs.writeFileSync(filePath, JSON.stringify(data, null, 4));

        return data;
    },
    read<T>(key: string): T | null {
        _ensureCacheDirExists();

        const filePath = path.join(cacheFolderPath, `${key}.json`);
        if (!fs.existsSync(filePath)) return null;

        try {
            const content = fs.readFileSync(filePath, 'utf-8');
            return JSON.parse(content) as T;
        } catch (e) {
            this.logger.error(`Failed to parse cache "${key}":`, e);
            return null;
        }
    },
    exists(key: string): boolean {
        return fs.existsSync(path.join(cacheFolderPath, `${key}.json`));
    },
    clear(key: string) {
        _ensureCacheDirExists();

        const filePath = path.join(cacheFolderPath, `${key}.json`);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
}

export default cache;