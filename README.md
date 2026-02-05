# SurakshaOS

AI-powered, offline-first community security system designed for Indian housing societies, hostels, hospitals, and rural community gates.

## Prerequisites

- Node.js 18.0.0 or higher
- npm or yarn package manager
- SQLite3

## Installation

1. Install Node.js from [nodejs.org](https://nodejs.org/)
2. Clone the repository
3. Install dependencies:
   ```bash
   npm install
   ```
4. Copy environment configuration:
   ```bash
   cp .env.example .env
   ```
5. Initialize the database:
   ```bash
   npm run db:migrate
   ```

## Development

Start the development server:
```bash
npm run dev
```

Run tests:
```bash
npm test
```

Build for production:
```bash
npm run build
npm start
```

## Project Structure

```
src/
├── ai/               # AI analysis engine implementations
├── aws/              # AWS service integrations
├── communication/    # Communication gateways (SMS, WhatsApp, Push)
├── database/         # Database management and migrations
├── language/         # Multi-language support
├── middleware/       # Express middleware
├── models/           # Data models and interfaces
├── routes/           # API route handlers
├── services/         # Business logic services
├── test/             # Test setup and utilities
├── types/            # TypeScript type definitions
└── utils/            # Utility functions
```

## Features

- Offline-first architecture with local SQLite database
- AI-powered visitor behavior analysis
- Multi-language support (Hindi, Tamil, Telugu, Bengali, Marathi)
- Privacy-first design without mandatory biometrics
- AWS cloud integration for scalability
- Real-time communication via SMS/WhatsApp
- Emergency handling capabilities

## License

MIT