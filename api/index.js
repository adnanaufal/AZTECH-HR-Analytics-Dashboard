// ==========================================
// HR ANALYTICS DASHBOARD — AZ TECH
// Express Backend Server
// ==========================================

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

// ==========================================
// CONFIG
// ==========================================
const PORT = process.env.PORT || 3000;

// ==========================================
// EXPRESS APP
// ==========================================
const app = express();

// Trust reverse proxy
app.set('trust proxy', 1);

// Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://cdn.jsdelivr.net", "https://unpkg.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:"],
      connectSrc: ["'self'", "https://unpkg.com"]
    }
  }
}));

// CORS
app.use(cors());

// Rate limiting
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  message: { error: 'Too many requests. Try again later.' },
  validate: { xForwardedForHeader: false }
});
app.use('/api/', limiter);

// JSON parsing
app.use(express.json());

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../public')));

// ==========================================
// API ENDPOINTS
// ==========================================

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'HR Analytics Dashboard — AZ Tech',
    timestamp: new Date().toISOString()
  });
});

// Fallback — serve index.html for any non-API route (SPA support)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

// ==========================================
// START SERVER
// ==========================================
app.listen(PORT, () => {
  console.log('');
  console.log('==========================================');
  console.log('  HR Analytics Dashboard — AZ Tech');
  console.log('==========================================');
  console.log(`  URL:      http://localhost:${PORT}`);
  console.log(`  Health:   http://localhost:${PORT}/api/health`);
  console.log(`  Mode:     ${process.env.NODE_ENV || 'development'}`);
  console.log('==========================================');
  console.log('');
});

module.exports = app;
