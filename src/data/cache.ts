import { DatabaseConfig } from './types';

export class CacheManager {
	private cache: Map<string, CacheEntry> = new Map();
	private maxSize: number;
	private ttl: number;

	constructor(maxSize: number = 100, ttl: number = 5 * 60 * 1000) {
		this.maxSize = maxSize;
		this.ttl = ttl;
	}

	get(key: string): DatabaseConfig | null {
		const entry = this.cache.get(key);
		if (!entry) {
			return null;
		}

		if (Date.now() - entry.timestamp > this.ttl) {
			this.cache.delete(key);
			return null;
		}

		return entry.data;
	}

	set(key: string, data: DatabaseConfig): void {
		if (this.cache.size >= this.maxSize) {
			this.evictOldest();
		}

		this.cache.set(key, {
			data,
			timestamp: Date.now()
		});
	}

	delete(key: string): void {
		this.cache.delete(key);
	}

	clear(): void {
		this.cache.clear();
	}

	has(key: string): boolean {
		const entry = this.cache.get(key);
		if (!entry) {
			return false;
		}

		if (Date.now() - entry.timestamp > this.ttl) {
			this.cache.delete(key);
			return false;
		}

		return true;
	}

	private evictOldest(): void {
		let oldestKey: string | null = null;
		let oldestTimestamp = Infinity;

		for (const [key, entry] of this.cache.entries()) {
			if (entry.timestamp < oldestTimestamp) {
				oldestTimestamp = entry.timestamp;
				oldestKey = key;
			}
		}

		if (oldestKey) {
			this.cache.delete(oldestKey);
		}
	}
}

interface CacheEntry {
	data: DatabaseConfig;
	timestamp: number;
}
