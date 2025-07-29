# Kori App Backend

A complete Node.js backend application with authentication, JWT tokens, and MongoDB integration.

## Features

- 🔐 Complete authentication system (register, login, logout)
- 🔑 JWT access and refresh tokens
- 🛡️ Secure password hashing with bcrypt
- 🚦 Rate limiting and security middleware
- 📝 Input validation with express-validator
- 🗄️ MongoDB integration with Mongoose
- 🤖 Gemini AI integration
- �️ Image generation with Replicate AI
- 📦 AWS S3 integration for image storage
- �📊 Request logging with Morgan
- 🔒 Account lockout after failed login attempts
- 🍪 HTTP-only cookies for refresh tokens
- 🔄 Token refresh mechanism

## Folder Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── config.js          # Application configuration
│   │   └── database.js        # MongoDB connection
│   ├── controllers/
│   │   └── AuthController.js  # Authentication controller
│   ├── middleware/
│   │   ├── auth.js            # Authentication middleware
│   │   └── security.js        # Security middleware
│   ├── models/
│   │   └── User.js            # User model with Mongoose
│   ├── routes/
│   │   ├── auth.js            # Authentication routes
│   │   └── index.js           # Main routes
│   ├── services/
│   │   └── AuthService.js     # Authentication business logic
│   ├── utils/
│   │   ├── ApiError.js        # Custom error class
│   │   ├── ApiResponse.js     # Standardized API responses
│   │   └── jwt.js             # JWT utility functions
│   └── validators/
│       └── authValidators.js  # Input validation schemas
├── server.js                  # Main application entry point
├── package.json
├── .env.example              # Environment variables example
└── README.md
```

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy environment variables:
   ```bash
   cp .env.example .env
   ```

4. Update the `.env` file with your configuration:
   - Add your MongoDB connection string
   - Add your JWT secrets (use strong, random strings)
   - Add your Gemini API key (optional)

5. Start the development server:
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication Routes

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | User login | No |
| POST | `/api/auth/refresh-token` | Refresh access token | No |
| POST | `/api/auth/logout` | Logout (single device) | Yes |
| POST | `/api/auth/logout-all` | Logout from all devices | Yes |
| GET | `/api/auth/profile` | Get user profile | Yes |
| GET | `/api/auth/me` | Get current user info | Yes |
| PUT | `/api/auth/profile` | Update user profile | Yes |
| PUT | `/api/auth/change-password` | Change password | Yes |
| POST | `/api/auth/forgot-password` | Request password reset | No |
| POST | `/api/auth/reset-password` | Reset password with token | No |

### Other Routes

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/health` | Health check | No |
| GET | `/api/test` | Test endpoint | No |
| POST | `/api/gemini` | Gemini AI chat | Optional |
| GET | `/api/protected` | Protected route example | Yes |

## User Model

The User model includes the following fields:

- `fullName`: String (required, 2-100 characters)
- `email`: String (required, unique, validated)
- `password`: String (required, hashed, min 6 chars)
- `role`: String (enum: 'user', 'admin')
- `isVerified`: Boolean (email verification status)
- `refreshTokens`: Array of refresh tokens
- `loginAttempts`: Number (for account lockout)
- `lockUntil`: Date (account lock expiration)
- `resetPasswordToken`: String (for password reset)
- `resetPasswordExpire`: Date (reset token expiration)

## Security Features

- Password hashing with bcrypt (12 rounds)
- JWT tokens with separate access and refresh tokens
- Account lockout after 5 failed login attempts
- Rate limiting (100 requests per 15 minutes)
- Strict rate limiting for auth routes (5 attempts per 15 minutes)
- Helmet for security headers
- CORS configuration
- HTTP-only cookies for refresh tokens
- Input validation and sanitization

## Environment Variables

Required environment variables:

```env
PORT=3002
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/kori-app
JWT_SECRET=your-jwt-secret
JWT_REFRESH_SECRET=your-refresh-jwt-secret
GEMINI_API_KEY=your-gemini-api-key
```

## Usage Examples

### Register User
```bash
curl -X POST http://localhost:3002/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John Doe",
    "email": "john@example.com",
    "password": "Password123",
    "confirmPassword": "Password123"
  }'
```

### Login User
```bash
curl -X POST http://localhost:3002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "Password123"
  }'
```

### Access Protected Route
```bash
curl -X GET http://localhost:3002/api/auth/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Development

- Use `npm run dev` for development with nodemon
- Use `npm start` for production
- MongoDB should be running locally or provide a connection string
- The server will automatically restart on file changes in development mode

## Security Best Practices

1. Always use HTTPS in production
2. Set strong JWT secrets (at least 32 characters)
3. Configure CORS properly for your frontend domain
4. Use environment variables for sensitive data
5. Regularly rotate JWT secrets
6. Monitor for unusual login patterns
7. Implement proper logging and monitoring

## License

ISC License
