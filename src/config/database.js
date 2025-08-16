const mongoose = require('mongoose');
const config = require('./index');

let connection = null;

const connectDB = async () => {
    try {
        if (connection) {
            return connection;
        }

        const options = {
            ...config.mongodb.options,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        };

        connection = await mongoose.connect(config.mongodb.uri, options);

        console.log('✅ MongoDB connected successfully');

        // Handle connection events
        mongoose.connection.on('error', (err) => {
            console.error('MongoDB connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('MongoDB disconnected');
        });

        mongoose.connection.on('reconnected', () => {
            console.log('MongoDB reconnected');
        });

        // Graceful shutdown
        process.on('SIGINT', async () => {
            await mongoose.connection.close();
            console.log('MongoDB connection closed through app termination');
            process.exit(0);
        });

        return connection;
    } catch (error) {
        console.error('MongoDB connection failed:', error);
        process.exit(1);
    }
};

const disconnectDB = async () => {
    try {
        if (mongoose.connection.readyState !== 0) {
            await mongoose.connection.close();
            console.log('MongoDB disconnected');
        }
    } catch (error) {
        console.error('Error disconnecting from MongoDB:', error);
    }
};

module.exports = {
    connectDB,
    disconnectDB,
    connection: () => mongoose.connection
}; 