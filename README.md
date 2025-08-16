# Staff Club - Node.js Express Redis MongoDB Boilerplate

A production-ready Node.js boilerplate with Express, Redis, and MongoDB featuring proper separation of concerns including controllers, business logic, configuration, and helpers.

## 🚀 Features

- **Express.js** - Fast, unopinionated web framework
- **MongoDB** - NoSQL database with Mongoose ODM
- **Redis** - In-memory data structure store for caching
- **JWT Authentication** - Secure token-based authentication
- **Role-based Access Control** - User, Admin, and Moderator roles
- **Input Validation** - Express-validator for request validation
- **Error Handling** - Comprehensive error handling middleware
- **Rate Limiting** - API rate limiting for security
- **Security Middleware** - Helmet, CORS, and other security features
- **Caching** - Redis-based caching system
- **Async/Await** - Modern JavaScript with proper error handling
- **Environment Configuration** - Environment-based configuration
- **Logging** - Request logging with Morgan
- **Compression** - Response compression for better performance

## 📁 Project Structure

```
src/
├── app.js                 # Main application entry point
├── config/               # Configuration files
│   ├── index.js          # Main configuration
│   ├── database.js       # MongoDB connection
│   └── redis.js          # Redis connection
├── controllers/          # Request handlers
│   ├── authController.js # Authentication controller
│   └── userController.js # User controller
├── helpers/             # Utility functions
│   ├── asyncHandler.js   # Async error wrapper
│   ├── responseHandler.js # Response utilities
│   └── redisHelper.js    # Redis utilities
├── middleware/           # Express middleware
│   ├── auth.js          # Authentication middleware
│   ├── errorHandler.js   # Error handling
│   └── notFound.js      # 404 handler
├── models/              # Database models
│   └── User.js          # User model
├── routes/              # Route definitions
│   ├── authRoutes.js    # Authentication routes
│   └── userRoutes.js    # User routes
└── services/            # Business logic
    └── authService.js   # Authentication service
```

## 🛠️ Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd staff-club
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup**

   ```bash
   # Copy environment example
   cp env.example .env

   # Edit .env file with your configuration
   ```

4. **Database Setup**

   - Install and start MongoDB
   - Install and start Redis
   - Update database connection strings in `.env`

5. **Start the application**

   ```bash
   # Development
   npm run dev

   # Production
   npm start
   ```

## 🔧 Configuration

### Environment Variables

Create a `.env` file based on `env.example`:

```env
# Server Configuration
NODE_ENV=development
PORT=3000

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/staff-club

# Redis Configuration
REDIS_URL=redis://localhost:6379
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## 📚 API Documentation

### Authentication Endpoints

#### Register User

```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "user"
}
```

#### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Get Current User

```http
GET /api/auth/me
Authorization: Bearer <token>
```

#### Update Profile

```http
PUT /api/auth/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Updated",
  "avatar": "https://example.com/avatar.jpg"
}
```

#### Change Password

```http
PUT /api/auth/change-password
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentPassword": "password123",
  "newPassword": "newpassword123"
}
```

#### Logout

```http
POST /api/auth/logout
Authorization: Bearer <token>
```

### User Endpoints

#### Get User by ID

```http
GET /api/users/:id
Authorization: Bearer <token>
```

#### Get All Users (Admin Only)

```http
GET /api/auth/users?page=1&limit=10&search=john
Authorization: Bearer <token>
```

#### Deactivate User (Admin Only)

```http
PUT /api/auth/users/:id/deactivate
Authorization: Bearer <token>
```

#### Activate User (Admin Only)

```http
PUT /api/auth/users/:id/activate
Authorization: Bearer <token>
```

## 🔐 Authentication

The application uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### User Roles

- **user** - Basic user access
- **moderator** - Enhanced access for content moderation
- **admin** - Full administrative access

## 🗄️ Database Models

### User Model

```javascript
{
  name: String,           // User's full name
  email: String,          // Unique email address
  password: String,       // Hashed password
  role: String,           // user, admin, moderator
  avatar: String,         // Profile picture URL
  isActive: Boolean,      // Account status
  lastLogin: Date,        // Last login timestamp
  emailVerified: Boolean, // Email verification status
  createdAt: Date,        // Account creation date
  updatedAt: Date         // Last update date
}
```

## 🚀 Deployment

### Prerequisites

- Node.js 18+
- MongoDB
- Redis

### Production Setup

1. **Environment Variables**

   ```bash
   NODE_ENV=production
   PORT=3000
   MONGODB_URI=mongodb://your-mongodb-uri
   REDIS_URL=redis://your-redis-uri
   JWT_SECRET=your-production-secret
   ```

2. **Start Application**

   ```bash
   npm start
   ```

3. **Process Manager (PM2)**
   ```bash
   npm install -g pm2
   pm2 start src/app.js --name "staff-club"
   ```

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## 📝 Scripts

```bash
# Development
npm run dev          # Start with nodemon

# Production
npm start            # Start application

# Testing
npm test             # Run tests
npm run test:watch   # Run tests in watch mode

# Linting
npm run lint         # Check code style
npm run lint:fix     # Fix code style issues
```

## 🔧 Development

### Code Style

The project uses ESLint for code linting. Configure your editor to use the project's ESLint configuration.

### Adding New Features

1. **Create Model** - Add to `src/models/`
2. **Create Service** - Add business logic to `src/services/`
3. **Create Controller** - Add request handling to `src/controllers/`
4. **Create Routes** - Add routes to `src/routes/`
5. **Update App** - Register routes in `src/app.js`

### Database Migrations

For database changes, create migration scripts in a `migrations/` directory.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:

- Create an issue in the repository
- Check the documentation
- Review the code examples

## 🔄 Updates

Stay updated with the latest changes by:

- Watching the repository
- Checking the releases page
- Following the changelog

---

**Happy Coding! 🚀**
