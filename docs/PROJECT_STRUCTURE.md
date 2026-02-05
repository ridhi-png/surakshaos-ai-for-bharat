# SurakshaOS Project Structure

This document outlines the complete project structure for SurakshaOS, an AI-powered, offline-first community security system.

## Root Directory Structure

```
suraksha-os/
├── .kiro/                    # Kiro IDE configuration and specs
│   └── specs/
│       └── suraksha-os/
├── data/                     # Local SQLite database files
├── docs/                     # Project documentation
├── models/                   # AI/ML model files for local inference
├── scripts/                  # Utility scripts
├── src/                      # Source code
└── dist/                     # Compiled TypeScript output (generated)
```

## Source Code Structure (`src/`)

```
src/
├── ai/                       # AI Analysis Engine
│   ├── AnalysisEngine.ts     # Core AI analysis implementation
│   ├── RiskScoring.ts        # Risk score calculation
│   ├── AnomalyDetection.ts   # Anomaly detection algorithms
│   └── ModelManager.ts       # ML model loading and management
│
├── aws/                      # AWS Service Integrations
│   ├── GreengrassConnector.ts # IoT Greengrass integration
│   ├── LambdaClient.ts       # Lambda function interactions
│   ├── RDSClient.ts          # RDS database client
│   └── S3Client.ts           # S3 storage client
│
├── communication/            # Communication Gateways
│   ├── SMSGateway.ts         # SMS service integration
│   ├── WhatsAppGateway.ts    # WhatsApp Business API
│   ├── PushNotification.ts   # Push notification service
│   └── CommunicationManager.ts # Multi-channel communication
│
├── database/                 # Database Layer
│   ├── DatabaseManager.ts    # SQLite connection management
│   ├── migrate.ts            # Database migrations
│   └── seed.ts               # Database seeding
│
├── language/                 # Multi-Language Support
│   ├── LanguageService.ts    # Language switching and translation
│   ├── VoiceInput.ts         # Voice input handling
│   └── translations/         # Translation files
│       ├── hi.json           # Hindi translations
│       ├── ta.json           # Tamil translations
│       ├── te.json           # Telugu translations
│       ├── bn.json           # Bengali translations
│       └── mr.json           # Marathi translations
│
├── middleware/               # Express Middleware
│   ├── auth.ts               # Authentication middleware
│   ├── validation.ts         # Request validation
│   ├── errorHandler.ts       # Error handling
│   └── logging.ts            # Request logging
│
├── models/                   # Data Models
│   ├── VisitorModel.ts       # Visitor data model
│   ├── DomesticStaffModel.ts # Domestic staff model
│   ├── RiskAssessmentModel.ts # Risk assessment model
│   └── __tests__/            # Model tests
│
├── routes/                   # API Routes
│   ├── visitors.ts           # Visitor management endpoints
│   ├── staff.ts              # Staff management endpoints
│   ├── emergency.ts          # Emergency handling endpoints
│   └── analytics.ts          # Analytics and reporting
│
├── services/                 # Business Logic Services
│   ├── VisitorService.ts     # Visitor management service
│   ├── StaffService.ts       # Staff management service
│   ├── EmergencyService.ts   # Emergency handling service
│   ├── OfflineDataManager.ts # Offline data management
│   └── SyncService.ts        # Cloud synchronization
│
├── test/                     # Test Configuration
│   └── setup.ts              # Jest test setup
│
├── types/                    # TypeScript Type Definitions
│   └── index.ts              # Shared type definitions
│
├── utils/                    # Utility Functions
│   ├── logger.ts             # Logging utilities
│   ├── validation.ts         # Data validation
│   ├── serialization.ts      # Data serialization
│   └── __tests__/            # Utility tests
│
└── index.ts                  # Application entry point
```

## Configuration Files

- **package.json**: Node.js project configuration and dependencies
- **tsconfig.json**: TypeScript compiler configuration
- **eslint.config.js**: ESLint linting rules
- **.prettierrc**: Code formatting configuration
- **jest.config.js**: Jest testing framework configuration
- **.env.example**: Environment variables template
- **.gitignore**: Git ignore patterns

## Key Architectural Principles

### 1. Offline-First Architecture
- Local SQLite database as primary data source
- Background synchronization with cloud services
- Progressive enhancement for online features

### 2. Modular Design
- Clear separation of concerns across directories
- Service layer for business logic
- Repository pattern for data access

### 3. Type Safety
- Comprehensive TypeScript type definitions
- Strict compiler settings for better code quality
- Interface-driven development

### 4. Testing Strategy
- Unit tests for individual components
- Property-based tests for comprehensive coverage
- Integration tests for service interactions

### 5. Security First
- Privacy-by-design principles
- Encrypted local data storage
- Secure communication channels

## Development Workflow

1. **Setup**: Run `npm run verify-setup` to check project structure
2. **Development**: Use `npm run dev` for hot-reloading development server
3. **Testing**: Run `npm test` for unit tests, `npm run test:coverage` for coverage
4. **Linting**: Use `npm run lint` to check code quality
5. **Building**: Run `npm run build` to compile TypeScript to JavaScript

## Deployment Structure

The compiled application follows the same structure in the `dist/` directory, ready for production deployment on AWS or local infrastructure.