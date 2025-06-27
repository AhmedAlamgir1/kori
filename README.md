# Kori - AI Chat Application

A modern AI chat application with a secure proxy backend for Gemini API integration.

## Project Structure

```
.
├── frontend/           # React + Vite frontend application
└── backend/           # Express proxy server for Gemini API
```

## Backend Proxy Service

The backend service acts as a secure proxy for the Gemini API, keeping the API key secure and providing a controlled interface for the frontend.

### Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file with your Gemini API key:
```
GEMINI_API_KEY=your_gemini_api_key_here
PORT=3001
```

4. Start the backend server:
```bash
npm run dev
```

The proxy server will run on `http://localhost:3001` and expose the following endpoint:
- POST `/api/gemini` - For making requests to the Gemini API

## Frontend Application

The frontend is built with React, Vite, and modern UI components.

### Setup

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:3001`

## Security Features

- API keys are stored securely in the backend
- CORS is properly configured
- Input validation on the proxy server
- Error handling and logging

## Development

- Backend uses Express.js with Node.js
- Frontend uses React with Vite
- Uses modern ES modules
- Hot reloading for both frontend and backend

## Deployment

The application can be deployed to any Node.js hosting service. Make sure to:
1. Set up environment variables
2. Configure CORS for production
3. Set up proper security headers
4. Use HTTPS in production
