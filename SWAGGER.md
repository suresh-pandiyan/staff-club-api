# Staff Club API Documentation

## Overview
This document provides comprehensive documentation for the Staff Club API, a Node.js Express application with MongoDB and Redis integration.

## API Base URL
- **Development**: `http://localhost:3000`
- **Production**: `https://your-domain.com`

## Authentication
The API uses JWT (JSON Web Token) authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## API Endpoints

### System Endpoints

#### Health Check
- **GET** `/health` - System health status (HTML)
- **GET** `/api/health` - System health status (JSON)

#### Documentation
- **GET** `/api-docs` - Swagger UI documentation

### Authentication Endpoints

#### User Registration
- **POST** `/api/auth/register` - Register a new user
- **POST** `/api/auth/login` - User login
- **POST** `/api/auth/logout` - User logout
- **GET** `/api/auth/me` - Get current user profile
- **PUT** `/api/auth/profile` - Update user profile
- **GET** `/api/auth/refresh` - Refresh access token

#### Avatar Management
- **POST** `/api/auth/avatar` - Upload avatar
- **DELETE** `/api/auth/avatar` - Delete avatar
- **GET** `/api/auth/avatar` - Get avatar info

### User Management

#### User Operations
- **GET** `/api/users` - Get all users (Admin only)
- **GET** `/api/users/:id` - Get user by ID
- **PUT** `/api/users/:id` - Update user (Admin only)
- **DELETE** `/api/users/:id` - Delete user (Admin only)
- **GET** `/api/users/stats` - Get user statistics (Admin only)

### Financial Year Management

#### Financial Year Operations
- **POST** `/api/financial-years` - Create financial year (Admin only)
- **GET** `/api/financial-years` - Get all financial years
- **GET** `/api/financial-years/:id` - Get financial year by ID
- **PUT** `/api/financial-years/:id` - Update financial year (Admin only)
- **DELETE** `/api/financial-years/:id` - Delete financial year (Admin only)
- **GET** `/api/financial-years/currently-active` - Get currently active financial year
- **PATCH** `/api/financial-years/:id/set-active` - Set financial year as active (Admin only)
- **GET** `/api/financial-years/date-range` - Get financial years by date range
- **GET** `/api/financial-years/by-date/:date` - Get financial year by specific date
- **GET** `/api/financial-years/:id/stats` - Get financial year statistics
- **GET** `/api/financial-years/stats` - Get all financial years with statistics

### Charity Fund Management

#### Charity Fund Operations
- **POST** `/api/charity-funds` - Create charity fund (Admin/Manager only)
- **GET** `/api/charity-funds` - Get all charity funds
- **GET** `/api/charity-funds/:id` - Get charity fund by ID
- **PUT** `/api/charity-funds/:id` - Update charity fund (Admin/Manager only)
- **DELETE** `/api/charity-funds/:id` - Delete charity fund (Admin only)
- **GET** `/api/charity-funds/financial-year/:financeYearId` - Get charity funds by financial year
- **GET** `/api/charity-funds/active` - Get active charity funds
- **PATCH** `/api/charity-funds/:id/close` - Close charity fund (Admin/Manager only)
- **GET** `/api/charity-funds/:id/stats` - Get charity fund statistics
- **GET** `/api/charity-funds/summary` - Get charity funds with summary

### Chitfund Management

#### Chitfund Operations
- **POST** `/api/chitfunds` - Create chitfund (Admin/Manager only)
- **GET** `/api/chitfunds` - Get all chitfunds
- **GET** `/api/chitfunds/:id` - Get chitfund by ID
- **PUT** `/api/chitfunds/:id` - Update chitfund (Admin/Manager only)
- **DELETE** `/api/chitfunds/:id` - Delete chitfund (Admin only)
- **GET** `/api/chitfunds/financial-year/:financeYearId` - Get chitfunds by financial year
- **GET** `/api/chitfunds/status/:status` - Get chitfunds by status
- **POST** `/api/chitfunds/:id/add-staff` - Add staff to chitfund (Admin/Manager only)
- **DELETE** `/api/chitfunds/:id/remove-staff` - Remove staff from chitfund (Admin/Manager only)
- **PATCH** `/api/chitfunds/:id/complete` - Complete chitfund (Admin/Manager only)
- **GET** `/api/chitfunds/:id/stats` - Get chitfund statistics
- **GET** `/api/chitfunds/summary` - Get chitfunds with summary

### Emergency Fund Management

#### Emergency Fund Operations
- **POST** `/api/emergency-funds` - Create emergency fund (Admin/Manager only)
- **GET** `/api/emergency-funds` - Get all emergency funds
- **GET** `/api/emergency-funds/:id` - Get emergency fund by ID
- **PUT** `/api/emergency-funds/:id` - Update emergency fund (Admin/Manager only)
- **DELETE** `/api/emergency-funds/:id` - Delete emergency fund (Admin only)
- **GET** `/api/emergency-funds/financial-year/:financeYearId` - Get emergency funds by financial year
- **GET** `/api/emergency-funds/active` - Get active emergency funds
- **PATCH** `/api/emergency-funds/:id/close` - Close emergency fund (Admin/Manager only)
- **GET** `/api/emergency-funds/:id/stats` - Get emergency fund statistics
- **GET** `/api/emergency-funds/summary` - Get emergency funds with summary

### Events Management

#### Event Operations
- **POST** `/api/events` - Create event (Admin/Manager only)
- **GET** `/api/events` - Get all events
- **GET** `/api/events/:id` - Get event by ID
- **PUT** `/api/events/:id` - Update event (Admin/Manager only)
- **DELETE** `/api/events/:id` - Delete event (Admin only)
- **GET** `/api/events/financial-year/:financeYearId` - Get events by financial year
- **GET** `/api/events/active` - Get active events
- **PATCH** `/api/events/:id/close` - Close event (Admin/Manager only)
- **GET** `/api/events/:id/stats` - Get event statistics
- **GET** `/api/events/summary` - Get events with summary

### Loan Management

#### Loan Operations
- **POST** `/api/loans` - Create loan (Admin/Manager only)
- **GET** `/api/loans` - Get all loans
- **GET** `/api/loans/:id` - Get loan by ID
- **PUT** `/api/loans/:id` - Update loan (Admin/Manager only)
- **DELETE** `/api/loans/:id` - Delete loan (Admin only)
- **GET** `/api/loans/financial-year/:financeYearId` - Get loans by financial year
- **GET** `/api/loans/with-topup` - Get loans with topup enabled
- **GET** `/api/loans/without-topup` - Get loans without topup
- **PATCH** `/api/loans/:id/enable-topup` - Enable topup for loan (Admin/Manager only)
- **PATCH** `/api/loans/:id/disable-topup` - Disable topup for loan (Admin/Manager only)
- **PATCH** `/api/loans/:id/update-amount` - Update loan amount (Admin/Manager only)
- **PATCH** `/api/loans/:id/update-topup-amount` - Update topup amount (Admin/Manager only)
- **GET** `/api/loans/:id/stats` - Get loan statistics
- **GET** `/api/loans/summary` - Get loans with summary

## Data Models

### User Model
```javascript
{
  _id: ObjectId,
  employeeId: String,
  firstName: String,
  lastName: String,
  email: String,
  phone: String,
  role: String, // user, admin, moderator, manager, supervisor
  type: String,
  joinDate: Date,
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  designation: String,
  status: String, // active, inactive, suspended
  hasLoan: Boolean,
  hasChitfund: Boolean,
  currentSalary: Number,
  emergencyContact: {
    name: String,
    relationship: String,
    phone: String
  },
  avatar: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Financial Year Model
```javascript
{
  _id: ObjectId,
  financeYear: String,
  startFrom: Date,
  endTo: Date,
  currentlyActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Charity Fund Model
```javascript
{
  _id: ObjectId,
  financeYearId: ObjectId,
  charityTitle: String,
  charityDescription: String,
  charityAmount: Number,
  charityCreated: Date,
  charityClosed: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Chitfund Model
```javascript
{
  _id: ObjectId,
  financeYearId: ObjectId,
  chitName: String,
  chitStaffs: [ObjectId], // Array of User IDs
  chitStarted: Date,
  chitAmount: Number,
  chitStatus: String, // created, on-going, completed
  createdAt: Date,
  updatedAt: Date
}
```

### Emergency Fund Model
```javascript
{
  _id: ObjectId,
  financeYearId: ObjectId,
  emergencyFundName: String,
  emergencyFundDescription: String,
  emergencyFundAmount: Number,
  emergencyFundCreated: Date,
  emergencyFundClosed: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Event Model
```javascript
{
  _id: ObjectId,
  financeYearId: ObjectId,
  eventName: String,
  eventDescription: String,
  eventAmount: Number,
  eventCreated: Date,
  eventClosed: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Loan Model
```javascript
{
  _id: ObjectId,
  financeYearId: ObjectId,
  loanName: String,
  loanDescription: String,
  loanAmount: Number,
  allowTopup: Boolean,
  loanTopupAmount: Number,
  loanTotalStaffs: Number,
  createdAt: Date,
  updatedAt: Date
}
```

## Response Formats

### Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    // Response data
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "fieldName",
      "message": "Validation error message",
      "value": "invalid value"
    }
  ]
}
```

### Pagination Response
```json
{
  "success": true,
  "data": [
    // Array of items
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10,
    "hasNext": true,
    "hasPrev": false
  }
}
```

## Authentication Examples

### Register User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "employeeId": "EMP001",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "password": "password123",
    "phone": "+1234567890",
    "role": "user",
    "type": "permanent",
    "joinDate": "2024-01-15",
    "designation": "Software Engineer",
    "currentSalary": 50000
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "password123"
  }'
```

### Create Financial Year
```bash
curl -X POST http://localhost:3000/api/financial-years \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "financeYear": "2024-2025",
    "startFrom": "2024-04-01",
    "endTo": "2025-03-31",
    "currentlyActive": true
  }'
```

### Create Charity Fund
```bash
curl -X POST http://localhost:3000/api/charity-funds \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "financeYearId": "FINANCIAL_YEAR_ID",
    "charityTitle": "Disaster Relief Fund",
    "charityDescription": "Fund to help victims of natural disasters",
    "charityAmount": 100000,
    "charityCreated": "2024-01-15"
  }'
```

## Error Codes

- **400** - Bad Request (Validation errors)
- **401** - Unauthorized (Invalid or missing token)
- **403** - Forbidden (Insufficient permissions)
- **404** - Not Found (Resource not found)
- **500** - Internal Server Error

## Rate Limiting

The API implements rate limiting to prevent abuse:
- **Window**: 15 minutes
- **Max Requests**: 100 requests per window per IP
- **Message**: "Too many requests from this IP, please try again later."

## Security Features

- JWT Authentication
- Role-based access control
- Input validation and sanitization
- CORS protection
- Helmet security headers
- Rate limiting
- Request compression

## Development

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- Redis

### Installation
```bash
npm install
```

### Environment Variables
Create a `.env` file with the following variables:
```env
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/staff-club
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=7d
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Running the Application
```bash
# Development
npm run dev

# Production
npm start

# Testing
npm test
```

## Docker Support

The application includes Docker support for easy deployment:

```bash
# Build and run with Docker Compose
docker-compose up -d

# Stop containers
docker-compose down
```

## API Documentation

For interactive API documentation, visit:
- **Swagger UI**: `http://localhost:3000/api-docs`
- **Health Check**: `http://localhost:3000/health`
- **Avatar Upload**: `http://localhost:3000/avatar-upload`
