const redis = require('redis');
const config = require('./index');

let client = null;

const connectRedis = async () => {
    try {
        if (client && client.isReady) {
            return client;
        }

        client = redis.createClient({
            url: config.redis.url,
            socket: {
                host: config.redis.host,
                port: config.redis.port,
                reconnectStrategy: (retries) => {
                    if (retries > 10) {
                        console.error('Redis max reconnection attempts reached');
                        return new Error('Redis max reconnection attempts reached');
                    }
                    return Math.min(retries * 100, 3000);
                },
                connectTimeout: 10000,
                commandTimeout: 5000,
            },
            password: config.redis.password,
            retryDelayOnFailover: config.redis.retryDelayOnFailover,
            maxRetriesPerRequest: config.redis.maxRetriesPerRequest,
        });

        // Event handlers
        client.on('connect', () => {
            console.log('🔄 Redis connecting...');
        });

        client.on('ready', () => {
            console.log('✅ Redis connected successfully');
        });

        client.on('error', (err) => {
            console.error('Redis error:', err);
        });

        client.on('end', () => {
            console.log('Redis connection ended');
        });

        client.on('reconnecting', () => {
            console.log('Redis reconnecting...');
        });

        await client.connect();
        return client;
    } catch (error) {
        console.error('Redis connection failed:', error);
        throw error;
    }
};

const disconnectRedis = async () => {
    try {
        if (client && client.isReady) {
            await client.quit();
            console.log('Redis disconnected');
        }
    } catch (error) {
        console.error('Error disconnecting from Redis:', error);
    }
};

const getRedisClient = () => {
    if (!client || !client.isReady) {
        throw new Error('Redis client not connected');
    }
    return client;
};

module.exports = {
    connectRedis,
    disconnectRedis,
    getRedisClient,
    client: () => client
}; 