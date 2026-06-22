import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import urlRoutes from './routes/urlRoutes.js';

// Load environment variables (only effective locally; Render injects them natively)
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

// ── Serve interactive API documentation on the root URL ──────────────────────
app.get('/', (req, res) => {
  const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>CodeAlpha URL Shortener API</title>
      <meta name="description" content="Interactive API reference for the CodeAlpha URL Shortener — shorten, redirect, and track URLs via REST.">
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&family=Plus+Jakarta+Sans:wght@300;400;600;700&display=swap" rel="stylesheet">
      <style>
        :root {
          --bg:        #090d16;
          --surface:   rgba(17, 24, 39, 0.75);
          --surface2:  rgba(255,255,255,0.03);
          --blue:      #3b82f6;
          --cyan:      #06b6d4;
          --green:     #10b981;
          --red:       #ef4444;
          --text:      #f3f4f6;
          --muted:     #9ca3af;
          --border:    rgba(255,255,255,0.08);
          --grad:      linear-gradient(135deg, var(--blue), var(--cyan));
          --radius:    16px;
        }
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          font-family: 'Plus Jakarta Sans', sans-serif;
          background: var(--bg);
          color: var(--text);
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 40px 20px 80px;
          position: relative;
          overflow-x: hidden;
        }
        body::before, body::after {
          content: '';
          position: fixed;
          width: 420px; height: 420px;
          border-radius: 50%;
          filter: blur(130px);
          z-index: -1;
          opacity: 0.12;
          pointer-events: none;
        }
        body::before { top: -60px; left: -60px; background: var(--blue); }
        body::after  { bottom: -60px; right: -60px; background: var(--cyan); }

        /* ── Layout ── */
        .page { width: 100%; max-width: 860px; }

        /* ── Header ── */
        header { text-align: center; margin-bottom: 48px; }
        .badge {
          display: inline-block;
          padding: 5px 14px;
          background: rgba(59,130,246,.12);
          color: var(--blue);
          border: 1px solid rgba(59,130,246,.25);
          border-radius: 100px;
          font-size: .78rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1.2px;
          margin-bottom: 16px;
        }
        h1 {
          font-family: 'Outfit', sans-serif;
          font-size: clamp(2rem, 5vw, 2.8rem);
          font-weight: 800;
          background: var(--grad);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          letter-spacing: -.5px;
          margin-bottom: 10px;
        }
        .subtitle { color: var(--muted); font-size: 1.05rem; }

        /* ── Base URL chip ── */
        .base-url-bar {
          display: flex;
          align-items: center;
          gap: 10px;
          background: var(--surface2);
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 10px 16px;
          margin-bottom: 36px;
          flex-wrap: wrap;
        }
        .base-url-bar .label { color: var(--muted); font-size: .8rem; font-weight: 600; text-transform: uppercase; letter-spacing: .8px; }
        .base-url-bar .url   { font-family: monospace; font-size: .95rem; color: var(--cyan); word-break: break-all; }

        /* ── Section heading ── */
        h2 {
          font-family: 'Outfit', sans-serif;
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--text);
          border-bottom: 1px solid var(--border);
          padding-bottom: 10px;
          margin-bottom: 20px;
        }

        /* ── Endpoint card ── */
        .endpoint {
          background: var(--surface);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid var(--border);
          border-radius: 20px;
          padding: 28px;
          margin-bottom: 24px;
          transition: border-color .3s, transform .3s;
        }
        .endpoint:hover { border-color: rgba(6,182,212,.3); transform: translateY(-2px); }

        .ep-header { display: flex; align-items: center; gap: 12px; margin-bottom: 14px; flex-wrap: wrap; }
        .method {
          font-family: 'Outfit', sans-serif;
          font-weight: 700;
          font-size: .8rem;
          padding: 4px 12px;
          border-radius: 6px;
          color: #fff;
          min-width: 64px;
          text-align: center;
          letter-spacing: .5px;
        }
        .method.post { background: var(--green); }
        .method.get  { background: var(--blue);  }
        .ep-path { font-family: monospace; font-size: 1.05rem; font-weight: 700; color: #fff; }
        .ep-desc { color: var(--muted); font-size: .9rem; margin-bottom: 16px; line-height: 1.5; }

        /* ── Try-it form ── */
        .try-form { display: flex; flex-direction: column; gap: 10px; }
        .input-row { display: flex; gap: 8px; flex-wrap: wrap; }
        .try-input {
          flex: 1;
          min-width: 200px;
          padding: 10px 14px;
          background: rgba(0,0,0,.35);
          border: 1px solid rgba(255,255,255,.12);
          border-radius: 8px;
          color: var(--text);
          font-family: monospace;
          font-size: .9rem;
          outline: none;
          transition: border-color .2s;
        }
        .try-input:focus { border-color: var(--cyan); }
        .try-input::placeholder { color: rgba(255,255,255,.3); }

        .try-btn {
          padding: 10px 22px;
          border: none;
          border-radius: 8px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: .9rem;
          font-weight: 700;
          cursor: pointer;
          transition: opacity .2s, transform .15s;
          white-space: nowrap;
        }
        .try-btn:active { transform: scale(.97); }
        .try-btn.post-btn { background: var(--green); color: #fff; }
        .try-btn.get-btn  { background: var(--blue);  color: #fff; }
        .try-btn:disabled { opacity: .5; cursor: not-allowed; }

        /* ── Response box ── */
        .response-box {
          display: none;
          background: #060913;
          border: 1px solid rgba(255,255,255,.06);
          border-radius: 10px;
          padding: 14px 16px;
          font-family: 'Courier New', monospace;
          font-size: .82rem;
          line-height: 1.6;
          overflow-x: auto;
          white-space: pre-wrap;
          word-break: break-all;
          animation: fadeIn .3s ease-out;
        }
        .response-box.ok  { color: #6ee7b7; border-color: rgba(16,185,129,.2); }
        .response-box.err { color: #fca5a5; border-color: rgba(239,68,68,.2);  }

        /* ── Static code snippet ── */
        pre.code-block {
          background: #060913;
          border: 1px solid rgba(255,255,255,.05);
          border-radius: 8px;
          padding: 12px 16px;
          font-family: 'Courier New', monospace;
          font-size: .82rem;
          color: #a78bfa;
          overflow-x: auto;
          white-space: pre;
        }

        /* ── Footer ── */
        footer {
          text-align: center;
          margin-top: 50px;
          color: var(--muted);
          font-size: .82rem;
          border-top: 1px solid var(--border);
          padding-top: 20px;
          width: 100%;
          max-width: 860px;
        }
        footer a { color: var(--cyan); text-decoration: none; }
        footer a:hover { text-decoration: underline; }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      </style>
    </head>
    <body>
      <div class="page">
        <header>
          <span class="badge">Interactive API Reference</span>
          <h1>CodeAlpha URL Shortener</h1>
          <p class="subtitle">A robust MVC-structured REST API — shorten, redirect &amp; track URLs</p>
        </header>

        <div class="base-url-bar">
          <span class="label">Base URL</span>
          <span class="url" id="baseUrlDisplay">${baseUrl}</span>
        </div>

        <h2>API Endpoints</h2>

        <!-- ── POST /shorten ────────────────────────────────────── -->
        <div class="endpoint">
          <div class="ep-header">
            <span class="method post">POST</span>
            <span class="ep-path">/shorten</span>
          </div>
          <p class="ep-desc">Shortens a long URL. Returns the generated short code and full shortened URL. If the URL was already shortened, the existing record is returned.</p>
          <p class="ep-desc"><strong>Request Body:</strong></p>
          <pre class="code-block">{ "originalUrl": "https://www.example.com" }</pre>

          <div class="try-form" style="margin-top:14px;">
            <div class="input-row">
              <input
                id="shortenInput"
                class="try-input"
                type="url"
                placeholder="https://www.example.com"
                autocomplete="off"
                spellcheck="false"
              />
              <button id="shortenBtn" class="try-btn post-btn" onclick="tryShortenUrl()">
                ▶ Try it
              </button>
            </div>
            <div id="shortenResponse" class="response-box"></div>
          </div>
        </div>

        <!-- ── GET /:code ────────────────────────────────────────── -->
        <div class="endpoint">
          <div class="ep-header">
            <span class="method get">GET</span>
            <span class="ep-path">/:code</span>
          </div>
          <p class="ep-desc">Redirects to the original URL for the given short code and increments the click counter. Paste a short code from the <code>/shorten</code> response above to test.</p>

          <div class="try-form">
            <div class="input-row">
              <input
                id="redirectInput"
                class="try-input"
                type="text"
                placeholder="e.g. aB3xYz9K"
                autocomplete="off"
                spellcheck="false"
              />
              <button id="redirectBtn" class="try-btn get-btn" onclick="tryRedirect()">
                ↗ Open URL
              </button>
            </div>
            <div id="redirectResponse" class="response-box"></div>
          </div>
        </div>

        <!-- ── GET /stats/:code ──────────────────────────────────── -->
        <div class="endpoint">
          <div class="ep-header">
            <span class="method get">GET</span>
            <span class="ep-path">/stats/:code</span>
          </div>
          <p class="ep-desc">Returns analytics for a shortened URL: original URL, short code, total click count, and creation timestamp.</p>

          <div class="try-form">
            <div class="input-row">
              <input
                id="statsInput"
                class="try-input"
                type="text"
                placeholder="e.g. aB3xYz9K"
                autocomplete="off"
                spellcheck="false"
              />
              <button id="statsBtn" class="try-btn get-btn" onclick="tryGetStats()">
                ▶ Get Stats
              </button>
            </div>
            <div id="statsResponse" class="response-box"></div>
          </div>
        </div>

      </div><!-- /.page -->

      <footer>
        <p>Developed for <strong>CodeAlpha</strong> Backend Development Internship — Task 1</p>
      </footer>

      <script>
        // ── Helpers ──────────────────────────────────────────────────
        function showResponse(boxId, data, isOk) {
          const box = document.getElementById(boxId);
          box.style.display = 'block';
          box.className = 'response-box ' + (isOk ? 'ok' : 'err');
          box.textContent = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
        }

        function setLoading(btnId, loading) {
          const btn = document.getElementById(btnId);
          btn.disabled = loading;
          if (loading) btn.dataset.original = btn.textContent;
          btn.textContent = loading ? '⏳ ...' : btn.dataset.original;
        }

        // ── POST /shorten ─────────────────────────────────────────────
        async function tryShortenUrl() {
          const url = document.getElementById('shortenInput').value.trim();
          if (!url) { showResponse('shortenResponse', 'Please enter a URL first.', false); return; }

          setLoading('shortenBtn', true);
          try {
            const res = await fetch('/shorten', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ originalUrl: url })
            });
            const data = await res.json();
            showResponse('shortenResponse', data, res.ok);

            // Auto-fill the code into the redirect and stats inputs
            if (data.shortCode) {
              document.getElementById('redirectInput').value = data.shortCode;
              document.getElementById('statsInput').value = data.shortCode;
            }
          } catch (err) {
            showResponse('shortenResponse', 'Network error: ' + err.message, false);
          } finally {
            setLoading('shortenBtn', false);
          }
        }

        // ── GET /:code ────────────────────────────────────────────────
        function tryRedirect() {
          const code = document.getElementById('redirectInput').value.trim();
          if (!code) { showResponse('redirectResponse', 'Please enter a short code first.', false); return; }
          showResponse('redirectResponse', 'Opening ' + window.location.origin + '/' + code + ' in a new tab...', true);
          window.open('/' + code, '_blank');
        }

        // ── GET /stats/:code ──────────────────────────────────────────
        async function tryGetStats() {
          const code = document.getElementById('statsInput').value.trim();
          if (!code) { showResponse('statsResponse', 'Please enter a short code first.', false); return; }

          setLoading('statsBtn', true);
          try {
            const res = await fetch('/stats/' + encodeURIComponent(code));
            const data = await res.json();
            showResponse('statsResponse', data, res.ok);
          } catch (err) {
            showResponse('statsResponse', 'Network error: ' + err.message, false);
          } finally {
            setLoading('statsBtn', false);
          }
        }

        // Allow Enter key on inputs
        document.getElementById('shortenInput').addEventListener('keydown', e => { if (e.key === 'Enter') tryShortenUrl(); });
        document.getElementById('redirectInput').addEventListener('keydown', e => { if (e.key === 'Enter') tryRedirect(); });
        document.getElementById('statsInput').addEventListener('keydown', e => { if (e.key === 'Enter') tryGetStats(); });
      </script>
    </body>
    </html>
  `);
});

// ── API Routes ────────────────────────────────────────────────────────────────
app.use('/', urlRoutes);

// ── Global Error Handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(`[Error Handler] ${err.stack || err.message}`);

  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(val => val.message);
    return res.status(400).json({ error: messages.join(', ') });
  }

  if (err.code === 11000) {
    return res.status(400).json({ error: 'Short URL code collision or duplicate entry occurred' });
  }

  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

// ── Start Server ──────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  console.log(`   Base URL: ${process.env.BASE_URL || 'http://localhost:' + PORT}`);
});
