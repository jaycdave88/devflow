// I need to initialize OpenTelemetry before importing anything else
// This ensures all the instrumentation gets set up properly
require('./otel/tracer');

const express = require('express');
const path = require('path');
const flagsRouter = require('./routes/flags');

const app = express();
const PORT = process.env.PORT || 3000;

// I'm setting up middleware for parsing JSON and serving static files
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Mount the flags API routes
// I like keeping all the flag endpoints under /flags for organization
app.use('/flags', flagsRouter);

// Serve the main dashboard at the root
// This makes it easy to just go to localhost:3000 and see everything
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// I'm adding a simple health check endpoint
// Useful for monitoring and making sure the service is up
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'devflow' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`DevFlow is running on http://localhost:${PORT}`);
  console.log(`Dashboard: http://localhost:${PORT}`);
  console.log(`API: http://localhost:${PORT}/flags`);
});
