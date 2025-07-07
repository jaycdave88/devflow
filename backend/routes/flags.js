const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const { createFlagSpan } = require('../otel/tracer');

const router = express.Router();
const flagsPath = path.join(__dirname, '../db/flags.json');

// I'm keeping this helper to read flags from our JSON file
// Makes it easy to reload the data fresh each time
async function readFlags() {
  try {
    const data = await fs.readFile(flagsPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Oops, had trouble reading flags:', error);
    return [];
  }
}

// Helper to write flags back to the file
// I'm being careful to handle errors here since file writes can fail
async function writeFlags(flags) {
  try {
    await fs.writeFile(flagsPath, JSON.stringify(flags, null, 2));
    return true;
  } catch (error) {
    console.error('Failed to save flags:', error);
    return false;
  }
}

// GET /flags - return all feature flags
// Pretty straightforward, just grab everything from the file
router.get('/', async (req, res) => {
  try {
    const flags = await readFlags();
    res.json(flags);
  } catch (error) {
    res.status(500).json({ error: 'Could not load flags' });
  }
});

// POST /flags/:key/toggle - toggle a flag's enabled state
// This is where I emit the OpenTelemetry span for tracking toggles
router.post('/:key/toggle', async (req, res) => {
  const flagKey = req.params.key;
  
  try {
    const flags = await readFlags();
    const flag = flags.find(f => f.key === flagKey);
    
    if (!flag) {
      return res.status(404).json({ error: 'Flag not found' });
    }
    
    // Toggle the flag
    flag.enabled = !flag.enabled;
    
    // I'm creating a span to track this toggle operation
    const span = createFlagSpan('feature.flag.toggle', flagKey, {
      'feature.flag.new_value': flag.enabled
    });
    
    // Save the updated flags
    const saved = await writeFlags(flags);
    
    if (saved) {
      span.setStatus({ code: 1 }); // SUCCESS
      span.end();
      res.json(flag);
    } else {
      span.setStatus({ code: 2, message: 'Failed to save flag' }); // ERROR
      span.end();
      res.status(500).json({ error: 'Could not save flag' });
    }
    
  } catch (error) {
    console.error('Error toggling flag:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /flags/:key/use - simulate using a flag
// This tracks when flags are actually being used in the app
router.post('/:key/use', async (req, res) => {
  const flagKey = req.params.key;
  
  try {
    const flags = await readFlags();
    const flag = flags.find(f => f.key === flagKey);
    
    if (!flag) {
      return res.status(404).json({ error: 'Flag not found' });
    }
    
    // Update the last used timestamp
    flag.lastUsedAt = new Date().toISOString();
    
    // I'm creating a span to track flag usage
    // Adding a random user_id to simulate different sessions
    const span = createFlagSpan('feature.flag.use', flagKey, {
      'feature.flag.value': flag.enabled,
      'user_id': Math.random().toString(36).substring(7) // random string for demo
    });
    
    // Save the updated timestamp
    await writeFlags(flags);
    
    span.setStatus({ code: 1 }); // SUCCESS
    span.end();
    
    res.json({ message: 'Flag usage recorded', flag: flag });
    
  } catch (error) {
    console.error('Error recording flag usage:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
