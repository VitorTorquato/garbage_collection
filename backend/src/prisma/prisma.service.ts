import { Injectable, Logger, type OnModuleDestroy, type OnModuleInit } from "@nestjs/common";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/client.js";
import { Pool } from "pg";

// Prisma error codes that indicate a lost/stale connection
const CONNECTION_ERROR_CODES = new Set(['P1001', 'P1002', 'P1008', 'P1017']);

function isConnectionError(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  const code = (err as { code?: string }).code;
  if (code && CONNECTION_ERROR_CODES.has(code)) return true;
  // DriverAdapterError thrown by @prisma/adapter-pg on stale pg connections
  return err.message.includes('Control plane request failed') ||
    err.constructor.name === 'PrismaClientInitializationError';
}

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);
  private readonly pool: Pool;

  constructor() {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      // Evict idle connections after 5 minutes so we never hand Prisma a
      // connection the server has already closed on its side.
      idleTimeoutMillis: 5 * 60 * 1000,
      keepAlive: true,
      connectionTimeoutMillis: 10_000,
    });
    super({ adapter: new PrismaPg(pool) });
    this.pool = pool;
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
    await this.pool.end();
  }

  async reconnect(): Promise<void> {
    this.logger.warn('Reconnecting Prisma after idle timeout...');
    try { await this.$disconnect(); } catch { /* ignore disconnect errors */ }
    await this.$connect();
    this.logger.log('Prisma reconnected.');
  }

  async withRetry<T>(fn: () => Promise<T>, maxAttempts = 3): Promise<T> {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (err) {
        if (isConnectionError(err) && attempt < maxAttempts) {
          this.logger.warn(`Connection error on attempt ${attempt}/${maxAttempts}, reconnecting...`);
          await this.reconnect();
          await new Promise((r) => setTimeout(r, 500 * attempt));
          continue;
        }
        throw err;
      }
    }
    throw new Error('withRetry: all attempts exhausted');
  }
}
