require('express-async-errors');
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const exphbs = require('express-handlebars');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./config/swagger');

const config = require('./config');
const { connectDB } = require('./config/database');
const { connectRedis } = require('./config/redis');
const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');

// Import routes
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const charityFundRoutes = require('./routes/charityFundRoutes');
const chitfundRoutes = require('./routes/chitfundRoutes');
const emergencyFundRoutes = require('./routes/emergencyFundRoutes');
const eventsRoutes = require('./routes/eventsRoutes');
const financialYearRoutes = require('./routes/financialYearRoutes');
const loanRoutes = require('./routes/loanRoutes');

const app = express();

// Handlebars configuration
const hbs = exphbs.create({
    extname: '.hbs',
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, 'views/layouts'),
    partialsDir: path.join(__dirname, 'views/partials'),
    helpers: {
        formatDate: function (date) {
            return new Date(date).toLocaleString();
        },
        formatUptime: function (uptime) {
            const hours = Math.floor(uptime / 3600);
            const minutes = Math.floor((uptime % 3600) / 60);
            const seconds = Math.floor(uptime % 60);
            return `${hours}h ${minutes}m ${seconds}s`;
        },
        formatBytes: function (bytes) {
            if (bytes === 0) return '0 Bytes';
            const k = 1024;
            const sizes = ['Bytes', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        },
        calculateMemoryPercent: function (used, total) {
            return Math.round((used / total) * 100);
        },
        eq: function (a, b) {
            return a === b;
        }
    }
});

app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
            scriptSrc: ["'self'", "https://cdnjs.cloudflare.com"],
            fontSrc: ["'self'", "https://cdnjs.cloudflare.com", "data:"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
}));
app.use(cors());

// Rate limiting
const limiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.maxRequests,
    message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression
app.use(compression());

// Logging
if (config.env === 'development') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined'));
}

/**
 * @swagger
 * /:
 *   get:
 *     summary: API Information
 *     description: Get information about the Staff Club API server
 *     tags: [System]
 *     responses:
 *       200:
 *         description: API information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Staff Club API Server"
 *                 version:
 *                   type: string
 *                   example: "1.0.0"
 *                 environment:
 *                   type: string
 *                   example: "development"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-01-15T10:30:00.000Z"
 *                 endpoints:
 *                   type: object
 *                   properties:
 *                     health:
 *                       type: string
 *                       example: "/health"
 *                     auth:
 *                       type: string
 *                       example: "/api/auth"
 *                     users:
 *                       type: string
 *                       example: "/api/users"
 *                 documentation:
 *                   type: string
 *                   example: "Check the README.md for API documentation"
 */
app.get('/', (req, res) => {
    res.status(200).json({
        message: 'Staff Club API Server',
        version: '1.0.0',
        environment: config.env,
        timestamp: new Date().toISOString(),
        endpoints: {
            health: '/health',
            auth: '/api/auth',
            users: '/api/users',
            charityFunds: '/api/charity-funds',
            chitfunds: '/api/chitfunds',
            emergencyFunds: '/api/emergency-funds',
            events: '/api/events',
            financialYears: '/api/financial-years',
            loans: '/api/loans',
            docs: '/api-docs'
        },
        documentation: 'Check the README.md for API documentation'
    });
});

/**
 * @swagger
 * /health:
 *   get:
 *     summary: System Health Check (HTML)
 *     description: Get system health status in HTML format with detailed metrics
 *     tags: [System]
 *     responses:
 *       200:
 *         description: Health status page rendered successfully
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *               description: HTML health status page
 *       500:
 *         description: Health check error
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *               description: Error page
 */
app.get('/health', async (req, res) => {
    try {
        const healthData = {
            status: 'OK',
            timestamp: new Date().toISOString(),
            environment: config.env,
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            version: '1.0.0',
            endpoints: {
                api: '/api/auth',
                users: '/api/users',
                docs: '/docs'
            }
        };

        res.render('health', {
            title: 'Staff Club - Health Status',
            health: healthData,
            nodeVersion: process.version,
            platform: process.platform,
            architecture: process.arch,
            processId: process.pid,
            workingDir: process.cwd(),
            layout: 'main'
        });
    } catch (error) {
        res.status(500).render('error', {
            title: 'Health Check Error',
            error: error.message,
            layout: 'main'
        });
    }
});

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: System Health Check (JSON)
 *     description: Get system health status in JSON format
 *     tags: [System]
 *     responses:
 *       200:
 *         description: Health status retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "OK"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-01-15T10:30:00.000Z"
 *                 environment:
 *                   type: string
 *                   example: "development"
 */
app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        environment: config.env
    });
});

/**
 * @swagger
 * /avatar-upload:
 *   get:
 *     summary: Avatar Upload Page
 *     description: Render the avatar upload page for users to upload profile pictures
 *     tags: [System]
 *     responses:
 *       200:
 *         description: Avatar upload page rendered successfully
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *               description: HTML avatar upload page
 */
app.get('/avatar-upload', (req, res) => {
    res.render('avatar-upload', {
        title: 'Avatar Upload - Staff Club',
        layout: 'main'
    });
});

/**
 * @swagger
 * /_next/{path}:
 *   get:
 *     summary: Next.js Development Handler
 *     description: Handle Next.js development requests gracefully when Next.js server is not running
 *     tags: [System]
 *     parameters:
 *       - in: path
 *         name: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Next.js path
 *     responses:
 *       404:
 *         description: Next.js development server not running
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Next.js development server not running"
 *                 note:
 *                   type: string
 *                   example: "This is an Express API server. If you need Next.js frontend, start it separately."
 */
app.get('/_next/*', (req, res) => {
    res.status(404).json({
        message: 'Next.js development server not running',
        note: 'This is an Express API server. If you need Next.js frontend, start it separately.'
    });
});

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Staff Club API Documentation',
    customfavIcon: '/favicon.ico',
    swaggerOptions: {
        docExpansion: 'list',
        filter: true,
        showRequestHeaders: true,
        showCommonExtensions: true
    }
}));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/charity-funds', charityFundRoutes);
app.use('/api/chitfunds', chitfundRoutes);
app.use('/api/emergency-funds', emergencyFundRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/financial-years', financialYearRoutes);
app.use('/api/loans', loanRoutes);

// 404 handler
app.use(notFound);

// Error handler
app.use(errorHandler);

// Start server
const startServer = async () => {
    try {
        // Connect to databases
        await connectDB();
        await connectRedis();

        const port = config.port || 3000;
        app.listen(port, () => {
            console.log(`🚀 Server running on port ${port} in ${config.env} mode`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
    process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    process.exit(1);
});

startServer();

module.exports = app; 