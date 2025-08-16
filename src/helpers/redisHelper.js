const { getRedisClient } = require('../config/redis');

class RedisHelper {
    static async set(key, value, expireTime = 3600) {
        try {
            const client = getRedisClient();
            const serializedValue = typeof value === 'object' ? JSON.stringify(value) : value;
            await client.setEx(key, expireTime, serializedValue);
            return true;
        } catch (error) {
            console.error('Redis SET error:', error);
            return false;
        }
    }

    static async get(key) {
        try {
            const client = getRedisClient();
            const value = await client.get(key);
            if (!value) return null;

            try {
                return JSON.parse(value);
            } catch {
                return value;
            }
        } catch (error) {
            console.error('Redis GET error:', error);
            return null;
        }
    }

    static async del(key) {
        try {
            const client = getRedisClient();
            await client.del(key);
            return true;
        } catch (error) {
            console.error('Redis DEL error:', error);
            return false;
        }
    }

    static async exists(key) {
        try {
            const client = getRedisClient();
            const result = await client.exists(key);
            return result === 1;
        } catch (error) {
            console.error('Redis EXISTS error:', error);
            return false;
        }
    }

    static async setHash(key, field, value) {
        try {
            const client = getRedisClient();
            const serializedValue = typeof value === 'object' ? JSON.stringify(value) : value;
            await client.hSet(key, field, serializedValue);
            return true;
        } catch (error) {
            console.error('Redis HSET error:', error);
            return false;
        }
    }

    static async getHash(key, field) {
        try {
            const client = getRedisClient();
            const value = await client.hGet(key, field);
            if (!value) return null;

            try {
                return JSON.parse(value);
            } catch {
                return value;
            }
        } catch (error) {
            console.error('Redis HGET error:', error);
            return null;
        }
    }

    static async getAllHash(key) {
        try {
            const client = getRedisClient();
            const hash = await client.hGetAll(key);
            if (!hash || Object.keys(hash).length === 0) return null;

            const result = {};
            for (const [field, value] of Object.entries(hash)) {
                try {
                    result[field] = JSON.parse(value);
                } catch {
                    result[field] = value;
                }
            }
            return result;
        } catch (error) {
            console.error('Redis HGETALL error:', error);
            return null;
        }
    }

    static async expire(key, seconds) {
        try {
            const client = getRedisClient();
            await client.expire(key, seconds);
            return true;
        } catch (error) {
            console.error('Redis EXPIRE error:', error);
            return false;
        }
    }

    static async ttl(key) {
        try {
            const client = getRedisClient();
            return await client.ttl(key);
        } catch (error) {
            console.error('Redis TTL error:', error);
            return -1;
        }
    }

    // Cache wrapper for functions
    static async cache(key, fn, expireTime = 3600) {
        try {
            // Try to get from cache first
            const cached = await this.get(key);
            if (cached !== null) {
                return cached;
            }

            // If not in cache, execute function and cache result
            const result = await fn();
            await this.set(key, result, expireTime);
            return result;
        } catch (error) {
            console.error('Cache wrapper error:', error);
            // If cache fails, still execute the function
            return await fn();
        }
    }

    // Clear cache by pattern
    static async clearPattern(pattern) {
        try {
            const client = getRedisClient();
            const keys = await client.keys(pattern);
            if (keys.length > 0) {
                await client.del(keys);
            }
            return keys.length;
        } catch (error) {
            console.error('Redis clear pattern error:', error);
            return 0;
        }
    }
}

module.exports = RedisHelper; 