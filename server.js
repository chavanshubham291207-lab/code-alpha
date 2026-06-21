import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import urlRoutes from './routes/urlRoutes.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB Atlas
connectDB();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Request logger middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Serve static documentation page on the root URL
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>CodeAlpha URL Shortener API</title>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&family=Plus+Jakarta+Sans:wght@300;400;600;700&display=swap" rel="stylesheet">
      <style>
        :root {
          --bg-color: #0b0f19;
          --panel-bg: rgba(17, 24, 39, 0.7);
          --accent-blue: #3b82f6;
          --accent-cyan: #06b6d4;
          --text-primary: #f3f4f6;
          --text-secondary: #9ca3af;
          --border-color: rgba(255, 255, 255, 0.08);
          --gradient: linear-gradient(135deg, var(--accent-blue), var(--accent-cyan));
        }

        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        body {
          font-family: 'Plus Jakarta Sans', sans-serif;
          background-color: var(--bg-color);
          color: var(--text-primary);
          line-height: 1.6;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          overflow-x: hidden;
          position: relative;
        }

        /* Ambient glow backgrounds */
        body::before, body::after {
          content: "";
          position: absolute;
          width: 300px;
          height: 300px;
          border-radius: 50%;
          filter: blur(120px);
          z-index: -1;
          opacity: 0.15;
        }
        body::before {
          top: 10%;
          left: 15%;
          background: var(--accent-blue);
        }
        body::after {
          bottom: 10%;
          right: 15%;
          background: var(--accent-cyan);
        }

        .container {
          width: 100%;
          max-width: 800px;
          padding: 40px 20px;
        }

        .card {
          background: var(--panel-bg);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid var(--border-color);
          border-radius: 24px;
          padding: 40px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
          animation: fadeIn 0.8s ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        header {
          text-align: center;
          margin-bottom: 40px;
        }

        .badge {
          display: inline-block;
          padding: 6px 16px;
          background: rgba(59, 130, 246, 0.1);
          color: var(--accent-blue);
          border: 1px solid rgba(59, 130, 246, 0.2);
          border-radius: 100px;
          font-size: 0.85rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 16px;
        }

        h1 {
          font-family: 'Outfit', sans-serif;
          font-size: 2.5rem;
          font-weight: 800;
          background: var(--gradient);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 10px;
          letter-spacing: -0.5px;
        }

        p.subtitle {
          color: var(--text-secondary);
          font-size: 1.1rem;
        }

        h2 {
          font-family: 'Outfit', sans-serif;
          font-size: 1.5rem;
          font-weight: 600;
          margin: 30px 0 20px;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 10px;
          color: var(--text-primary);
        }

        .endpoint-card {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border-color);
          border-radius: 16px;
          padding: 20px;
          margin-bottom: 20px;
          transition: all 0.3s ease;
        }

        .endpoint-card:hover {
          transform: translateY(-2px);
          border-color: rgba(6, 182, 212, 0.3);
          background: rgba(255, 255, 255, 0.04);
        }

        .endpoint-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
          flex-wrap: wrap;
        }

        .method {
          font-family: 'Outfit', sans-serif;
          font-weight: 700;
          font-size: 0.85rem;
          padding: 4px 10px;
          border-radius: 6px;
          color: #ffffff;
          min-width: 70px;
          text-align: center;
        }

        .method.post { background-color: #10b981; }
        .method.get { background-color: #3b82f6; }

        .path {
          font-family: monospace;
          font-size: 1.1rem;
          color: #fff;
          font-weight: 600;
        }

        .desc {
          color: var(--text-secondary);
          font-size: 0.95rem;
          margin-bottom: 12px;
        }

        .code-block {
          background: #060913;
          border-radius: 8px;
          padding: 12px 16px;
          font-family: 'Courier New', Courier, monospace;
          font-size: 0.85rem;
          color: #a78bfa;
          overflow-x: auto;
          border: 1px solid rgba(255, 255, 255, 0.04);
        }

        .footer {
          text-align: center;
          margin-top: 40px;
          color: var(--text-secondary);
          font-size: 0.85rem;
          border-top: 1px solid var(--border-color);
          padding-top: 20px;
        }

        .footer a {
          color: var(--accent-cyan);
          text-decoration: none;
          transition: color 0.2s;
        }

        .footer a:hover {
          color: var(--accent-blue);
          text-decoration: underline;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="card">
          <header>
            <span class="badge">API Reference</span>
            <h1>CodeAlpha URL Shortener</h1>
            <p class="subtitle">A robust MVC-structured REST API for shortening and tracking URLs</p>
          </header>

          <h2>API Endpoints</h2>

          <!-- POST /shorten -->
          <div class="endpoint-card">
            <div class="endpoint-header">
              <span class="method post">POST</span>
              <span class="path">/shorten</span>
            </div>
            <p class="desc">Shortens a long URL and returns the generated short code and shortened URL.</p>
            <p class="desc"><strong>Request Body:</strong></p>
            <pre class="code-block">{
  "originalUrl": "https://www.codealpha.in"
}</pre>
          </div>

          <!-- GET /:code -->
          <div class="endpoint-card">
            <div class="endpoint-header">
              <span class="method get">GET</span>
              <span class="path">/:code</span>
            </div>
            <p class="desc">Redirects the user to the original URL associated with the short code, incrementing click counts.</p>
          </div>

          <!-- GET /stats/:code -->
          <div class="endpoint-card">
            <div class="endpoint-header">
              <span class="method get">GET</span>
              <span class="path">/stats/:code</span>
            </div>
            <p class="desc">Retrieves analytics data for the shortened URL, including click count, creation date, and original URL.</p>
          </div>

          <div class="footer">
            <p>Developed for CodeAlpha Backend Development Internship - Task 1</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `);
});

// API Routes
app.use('/', urlRoutes);

// Global Error Handler Middleware
app.use((err, req, res, next) => {
  console.error(`[Error Handler] ${err.stack || err.message}`);
  
  // Mongoose validation errors
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(val => val.message);
    return res.status(400).json({ error: messages.join(', ') });
  }

  // Duplicate key error
  if (err.code === 11000) {
    return res.status(400).json({ error: 'Short URL code collision or duplicate entry occurred' });
  }

  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  console.log(`Base URL configured as: ${process.env.BASE_URL || 'http://localhost:' + PORT}`);
});
