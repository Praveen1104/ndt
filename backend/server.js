const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5200;

// Enable CORS for frontend requests
app.use(cors({
  origin: '*', // In production, replace with specific frontend domain
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Ensure the 'static' directory exists locally
const staticDir = path.join(__dirname, 'static');
if (!fs.existsSync(staticDir)) {
  fs.mkdirSync(staticDir, { recursive: true });
  console.log(`[Server] Created missing 'static' directory at: ${staticDir}`);
}

// Serve static files dynamically from the 'static' directory
app.use('/static', express.static(staticDir));

// System/API status route
app.get('/api/status', (req, res) => {
  // Read directory contents to verify it's working
  let staticFiles = [];
  try {
    staticFiles = fs.readdirSync(staticDir);
  } catch (err) {
    console.error('[Server] Error reading static directory:', err);
  }

  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
    system: {
      platform: process.platform,
      arch: process.arch,
      memoryUsage: process.memoryUsage(),
    },
    staticDirInfo: {
      path: staticDir,
      exists: fs.existsSync(staticDir),
      fileCount: staticFiles.length,
      files: staticFiles.filter(file => file !== '.gitkeep')
    }
  });
});

// A sample API endpoint to create a dummy file in the static folder (for testing)
app.post('/api/static/create-test', (req, res) => {
  const fileName = req.body.name || `test-${Date.now()}.json`;
  const filePath = path.join(staticDir, fileName);
  const fileContent = JSON.stringify({ message: "Hello from unified backend", created: new Date().toISOString() }, null, 2);

  try {
    fs.writeFileSync(filePath, fileContent, 'utf8');
    res.json({
      success: true,
      message: `Successfully created file ${fileName} in static directory.`,
      file: fileName
    });
  } catch (err) {
    console.error('[Server] Failed to write file to static directory:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to write file to static directory.',
      error: err.message
    });
  }
});

// Start listening
app.listen(PORT, '0.0.0.0', () => {
  console.log(`===================================================`);
  console.log(`[Server] Unified Express Backend running on port ${PORT}`);
  console.log(`[Server] API status endpoint: http://localhost:${PORT}/api/status`);
  console.log(`[Server] Static files directory: ${staticDir}`);
  console.log(`===================================================`);
});
