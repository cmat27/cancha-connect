# CanchaConnect API ⚽️

A serverless REST backend for managing local soccer tournaments, teams, and player registrations. Built with **Node.js 24**, **AWS Lambda**, **Amazon API Gateway (HTTP API v2)**, and **Amazon DynamoDB (Single-Table Design)**.

---

## 🏗 Architecture Highlights

- **Compute:** AWS Lambda (`nodejs24.x`) utilizing a Monolithic Router pattern.
- **API Gateway:** Amazon API Gateway (HTTP API v2) with `$default` catch-all routing and CORS preflight support.
- **Database:** Amazon DynamoDB utilizing Single-Table Design with Global Secondary Indexes (`GSI1`) for scalable entity listing without table scans.
- **Validation:** **Zod** schema validation for input data integrity.
- **Infrastructure as Code:** AWS CloudFormation ([infrastructure/template.yaml](file:///Users/cmat/aws-projects/CanchaConnect/infrastructure/template.yaml)).
- **Automated Testing:** Unit & Integration tests powered by Node 24 native test runner (`node --test`).

---

## 📁 Project Structure

```
CanchaConnect/
├── infrastructure/
│   ├── template.yaml            # CloudFormation IaC definition (DynamoDB, IAM, Lambda, API Gateway)
│   └── packaged.yaml
├── backend/
│   ├── src/
│   │   ├── data/                # DynamoDB Repository layer
│   │   │   ├── dbClient.js      # AWS SDK DocumentClient initialization
│   │   │   ├── teamRepository.js
│   │   │   ├── playerRepository.js
│   │   │   └── tournamentRepository.js
│   │   ├── handlers/            # Controller layer (HTTP routing & parsing)
│   │   │   ├── teamHandler.js
│   │   │   ├── playerHandler.js
│   │   │   └── tournamentHandler.js
│   │   ├── services/            # Business logic & Zod schema validation
│   │   │   ├── teamService.js
│   │   │   ├── playerService.js
│   │   │   └── tournamentService.js
│   │   ├── utils/
│   │   │   ├── KeyBuilderUtility.js  # DynamoDB key generator
│   │   │   └── responseFormatter.js  # Standardized CORS & response formatter
│   │   └── index.js             # Main Lambda entry point / Monolithic router
│   ├── test/                    # Native test suite (node --test)
│   │   ├── keyBuilder.test.js
│   │   ├── services.test.js
│   │   └── router.test.js
│   ├── server.js                # Local HTTP API emulator
│   └── package.json
├── dep-command.md               # Quick deployment reference guide
└── README.md
```

---

## 📡 API Endpoints

### Teams (`/teams`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/teams` | Create a new team |
| `GET` | `/teams` | Get all registered teams |
| `GET` | `/teams/:teamId` | Get team details by ID |
| `POST` | `/teams/:teamId/players` | Add player to team roster |
| `GET` | `/teams/:teamId/players` | Get player roster for team |
| `GET` | `/teams/:teamId/tournaments` | Get registered tournaments for team |

### Players (`/players`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/players` | Create a new player profile |
| `GET` | `/players` | Get all players |
| `GET` | `/players/:playerId` | Get player details by ID |
| `GET` | `/players/:playerId/teams` | Get teams associated with player |

### Tournaments (`/tournaments`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/tournaments` | Create a new tournament |
| `GET` | `/tournaments` | Get all tournaments |
| `GET` | `/tournaments/:tourneyId` | Get tournament details by ID |
| `POST` | `/tournaments/:tourneyId/teams` | Register team for tournament |
| `GET` | `/tournaments/:tourneyId/teams` | Get teams registered in tournament |

---

## 🚀 Local Development & Testing

### 1. Run Unit Tests
```bash
cd backend
npm test
```

### 2. Run API Locally
```bash
cd backend
npm run local
```
The server will start at `http://localhost:3000`. You can test endpoints via `curl`:
```bash
curl -X POST http://localhost:3000/teams \
  -H "Content-Type: application/json" \
  -d '{"name": "Lightning FC", "coach": "Coach Taylor"}'
```

---

## 🛠 Deployment Instructions

Follow the detailed deployment steps in [dep-command.md](file:///Users/cmat/aws-projects/CanchaConnect/dep-command.md):

1. **Zip Backend Code:**
   ```bash
   cd backend
   npm install
   zip -r ../backend.zip . -x "server.js" "test/*" "*.git*"
   cd ..
   ```
2. **Upload to S3 & Deploy Infrastructure:**
   ```bash
   aws s3 cp backend.zip s3://canchaconnect-deployments-dev/backend.zip

   aws cloudformation deploy \
     --template-file infrastructure/template.yaml \
     --stack-name CanchaConnectStack \
     --capabilities CAPABILITY_IAM
   ```
