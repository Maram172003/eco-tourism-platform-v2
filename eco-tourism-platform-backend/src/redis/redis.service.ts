import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly client: Redis;
  private readonly defaultTtl: number;

  constructor(private readonly config: ConfigService) {
    const host = this.config.get<string>('REDIS_HOST', 'localhost');
    const port = this.config.get<number>('REDIS_PORT', 6379);
    this.defaultTtl = this.config.get<number>('REDIS_TTL', 300);

    this.client = new Redis({ host, port, maxRetriesPerRequest: 3 });
  }

  async get<T>(key: string): Promise<T | null> {
    const raw = await this.client.get(key);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return raw as unknown as T;
    }
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    const serialized = JSON.stringify(value);
    await this.client.setex(key, ttl ?? this.defaultTtl, serialized);
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  async delByPattern(pattern: string): Promise<void> {
    const stream = this.client.scanStream({ match: pattern, count: 100 });
    for await (const keys of stream) {
      if (keys.length) {
        await this.client.del(...keys);
      }
    }
  }

  async reset(): Promise<void> {
    await this.client.flushall();
  }

  onModuleDestroy() {
    this.client.quit();
  }
}
