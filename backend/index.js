// const express = require('express');
// const cors = require('cors');
// const { GoogleGenerativeAI } = require('@google/generative-ai');
// require('dotenv').config();

// const app = express();
// const port = process.env.PORT || 3002;

// // Debug environment variables
// console.log('Environment variables loaded:', {
//   PORT: process.env.PORT,
//   GEMINI_API_KEY_LENGTH: process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.length : 0,
//   GEMINI_API_KEY_START: process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.substring(0, 5) : 'none'
// });

// if (!process.env.GEMINI_API_KEY) {
//   console.error('GEMINI_API_KEY is not set in environment variables');
//   process.exit(1);
// }

// // Middleware
// app.use(cors());
// app.use(express.json());

// // Initialize Gemini
// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// // Test endpoint to verify API key
// app.get('/api/test', (req, res) => {
//   res.json({ 
//     status: 'Backend server running',
//     apiKeyPresent: !!process.env.GEMINI_API_KEY,
//     apiKeyLength: process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.length : 0
//   });
// });

// // Proxy endpoint
// app.post('/api/gemini', async (req, res) => {
//   try {
//     const { prompt } = req.body;
    
//     if (!prompt) {
//       return res.status(400).json({ error: 'Prompt is required' });
//     }

//     console.log('Attempting Gemini API call with prompt:', prompt);
//     const model = genAI.getGenerativeModel({ 
//       model: "gemini-1.5-flash",
//       generationConfig: {
//         temperature: 0.1
//       }
//     });
//     const result = await model.generateContent(prompt);
//     const response = await result.response;
//     const text = response.text();

//     console.log('Gemini API call successful');
//     res.json({ response: text });
//   } catch (error) {
//     console.error('Detailed error in Gemini API call:', {
//       message: error.message,
//       name: error.name,
//       stack: error.stack
//     });
    
//     if (error.message.includes('API_KEY_INVALID')) {
//       return res.status(500).json({ 
//         error: 'Invalid API key configuration',
//         details: 'Please check your Gemini API key format and validity'
//       });
//     }
    
//     res.status(500).json({ 
//       error: 'Internal server error',
//       details: error.message
//     });
//   }
// });

// app.listen(port, () => {
//   console.log(`Proxy server running on port ${port}`);
// }); 






// server.js (or app.js)
const express = require('express');
const cors = require('cors');
// Import the OpenAI library instead of GoogleGenerativeAI
const OpenAI = require('openai');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3002;

// Debug environment variables
console.log('Environment variables loaded:', {
  PORT: process.env.PORT,
  OPENAI_API_KEY_LENGTH: process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.length : 0,
  OPENAI_API_KEY_START: process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.substring(0, 5) : 'none'
});

// Check if OpenAI API Key is set
if (!process.env.OPENAI_API_KEY) {
  console.error('OPENAI_API_KEY is not set in environment variables');
  process.exit(1); // Exit if the critical key is missing
}

// Middleware
app.use(cors()); // Enables Cross-Origin Resource Sharing (for frontend to talk to backend)
app.use(express.json()); // Parses incoming JSON requests

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Test endpoint to verify server status and API key presence
app.get('/api/test', (req, res) => {
  res.json({
    status: 'Backend server running',
    // Only indicate presence, not the key itself for security
    apiKeyPresent: !!process.env.OPENAI_API_KEY,
    apiKeyLength: process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.length : 0
  });
});

// New proxy endpoint for ChatGPT
// Renamed from /api/gemini to /api/chatgpt for clarity
app.post('/api/chatgpt', async (req, res) => {
  try {
    const { prompt, model = "gpt-4o-mini", temperature = 0.7 } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    console.log(`Attempting ChatGPT API call with model: ${model}, prompt: ${prompt.substring(0, 50)}...`);

    const chatCompletion = await openai.chat.completions.create({
      model: model, // Use the model from the request body, default to gpt-4o-mini
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' }, // Good practice to define a system role
        { role: 'user', content: prompt },
      ],
      temperature: parseFloat(temperature), // Use temperature from request body
      // Add other parameters as needed, e.g., max_tokens
      // max_tokens: 150, 
    });

    const responseText = chatCompletion.choices[0].message.content;

    console.log('ChatGPT API call successful');
    res.json({ response: responseText });

  } catch (error) {
    console.error('Detailed error in ChatGPT API call:', {
      message: error.message,
      name: error.name,
      stack: error.stack,
      // Log response data if available for more specific API errors
      response_data: error.response?.data
    });

    // Provide more user-friendly error messages based on common OpenAI errors
    if (error.response) {
      if (error.response.status === 401) {
        return res.status(401).json({
          error: 'Authentication error',
          details: 'Invalid OpenAI API key. Please check your key or contact server administrator.'
        });
      } else if (error.response.status === 429) {
        return res.status(429).json({
          error: 'Rate limit exceeded',
          details: 'Too many requests. Please try again shortly.'
        });
      } else if (error.response.status === 400 && error.response.data?.error?.code === 'model_not_found') {
        return res.status(400).json({
          error: 'Invalid model',
          details: `The model '${req.body.model}' is not valid or accessible.`
        });
      }
    }

    res.status(500).json({
      error: 'Internal server error',
      details: error.message || 'An unknown error occurred.'
    });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`OpenAI Proxy server running on port ${port}`);
});