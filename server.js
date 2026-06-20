require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (frontend HTML/CSS/JS)
app.use(express.static(path.join(__dirname)));

// --- TAMBAHAN PINTU MASUK FRONTEND ---
// Jika membuka halaman utama web, arahkan ke index.html
app.get('/', (req, res) => {
  res.redirect('/index.html');
});

// Menangani navigasi antar halaman HTML lainnya (misal /catalog.html)
app.get('/:page.html', (req, res) => {
  res.sendFile(path.join(__dirname, `${req.params.page}.html`));
});
// -------------------------------------

// Simple health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK' });
});



// Only start the HTTP server in local development.
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 Server listening on http://localhost:${PORT}`);
  });
}

module.exports = app;