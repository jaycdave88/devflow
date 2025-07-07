# DevFlow  
_A lightweight, self-hosted dashboard for managing and observing feature flags in real time._

## Overview

DevFlow is a minimal feature flag management tool built for speed, simplicity, and visibility. It offers a clean Bootstrap UI, a small Express.js API layer, and built-in observability through OpenTelemetry. Flags are stored in a flat JSON file—no external dependencies or database required.

The project is designed as a developer-friendly alternative to larger feature management platforms when you just need quick toggles, simple tracking, and clear span emission for tracing usage.

## Key Features

- **Dashboard UI** – Clean and responsive Bootstrap 5 interface  
- **Toggle Support** – Flip flags on/off instantly  
- **Usage Tracking** – Record when flags are used  
- **OpenTelemetry Integration** – Emits spans for toggle and usage events  
- **JSON Storage** – Flat-file based, no database setup  
- **Zero Build Setup** – Runs on Node.js with minimal overhead  

## Getting Started

### Requirements

- Node.js v16 or higher  
- npm  

### Installation

```bash
git clone www.github.com/jaydave/devflow devflow
cd devflow
npm install
npm start
```

Open your browser and navigate to:

```
http://localhost:3000
```

You’ll see a simple dashboard with a few sample feature flags ready to test.

## Development Mode

To run with file watch and auto-reload:

```bash
npm run dev
```

## Running with Docker

### Using Docker Compose

```bash
docker-compose up -d
```

Visit:
- DevFlow: `http://localhost:3000`  
- Jaeger (if enabled): `http://localhost:16686`  

### Using Docker CLI

```bash
docker build -t devflow .
docker run -d -p 3000:3000 devflow
```

## Project Structure

```
devflow/
├── backend/
│   ├── index.js             # Express entry point
│   ├── routes/flags.js      # Feature flag APIs
│   ├── db/flags.json        # Flat-file storage
│   └── otel/tracer.js       # OpenTelemetry setup
├── public/
│   ├── index.html           # Bootstrap dashboard
│   ├── style.css            # Optional styles
│   └── app.js               # Frontend logic
├── Dockerfile
├── docker-compose.yml
└── package.json
```

## API Endpoints

### `GET /flags`  
Returns all feature flags.

### `POST /flags/:key/toggle`  
Toggles the enabled state of the given flag.

### `POST /flags/:key/use`  
Logs usage of the given flag and updates the `lastUsedAt` timestamp.

## OpenTelemetry Support

DevFlow emits structured spans whenever a flag is toggled or used. This gives visibility into when flags are active and how often they’re triggered.

### Toggle Event

- Span name: `feature.flag.toggle`  
- Attributes:
  - `feature.flag.name`
  - `feature.flag.new_value`

### Usage Event

- Span name: `feature.flag.use`  
- Attributes:
  - `feature.flag.name`
  - `feature.flag.value`
  - `env` (currently hardcoded as "dev")  
  - `user_id` (random string to simulate session)

Spans are exported to the console by default. You can reconfigure this via the OpenTelemetry setup in `backend/otel/tracer.js`.

## Adding Flags

New flags can be added directly to `backend/db/flags.json`. Example:

```json
[
  {
    "key": "beta-feature-x",
    "description": "Enables the new beta layout",
    "enabled": false,
    "lastUsedAt": null
  }
]
```

Restart the server and the new flag will appear in the dashboard.

## Troubleshooting

**Server not starting?**
- Ensure Node.js is v16+
- Make sure port 3000 is available

**Flags not loading?**
- Check for valid JSON in `flags.json`
- Restart the server after editing flags manually

**Spans not showing up?**
- Make sure you’ve installed the required OpenTelemetry packages
- Check logs from `tracer.js` for startup issues

## Roadmap

The current implementation is a functional MVP. Future improvements could include:

- User authentication and RBAC for flag management  
- UI support for creating and deleting flags  
- WebSocket-based real-time updates  
- Historical analytics and flag usage metrics  
- Prometheus metrics endpoint  
- Support for storing flags in a database  
- GitHub or GitOps integration for flag state sync  
