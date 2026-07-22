interface TtlEntry<T> {
    value: T;
    expireAt: number;
};

/**
 * 进程内短 TTL 缓存（不缓存空值）
 */
export class TtlCache<T> {
    private store = new Map<string, TtlEntry<T>>();

    get(key: string): T | undefined {
        const entry = this.store.get(key);
        if (!entry) return undefined;
        if (Date.now() >= entry.expireAt) {
            this.store.delete(key);
            return undefined;
        };
        return entry.value;
    }

    set(key: string, value: T, ttlMs: number): void {
        this.store.set(key, { value, expireAt: Date.now() + ttlMs });
    }

    delete(key: string): void {
        this.store.delete(key);
    }
};