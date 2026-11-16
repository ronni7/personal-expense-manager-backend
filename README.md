# Personal Expense Manager — Backend

Backend application for **Personal Expense Manager (PEM)**, built with **NestJS, TypeScript and MongoDB**.

The project provides a REST API for managing personal expenses, with a focus on clean architecture, maintainability, input validation and automated testing.

> **Status:** Work in Progress

## Tech Stack

| Technology                                         | Purpose                    |
| -------------------------------------------------- | -------------------------- |
| [Node.js](https://nodejs.org/)                     | JavaScript runtime         |
| [NestJS](https://nestjs.com/)                      | Backend framework          |
| [TypeScript](https://www.typescriptlang.org/)      | Application development    |
| [MongoDB](https://www.mongodb.com/)                | NoSQL database             |
| [Mongoose](https://mongoosejs.com/)                | MongoDB ODM                |
| [Vitest](https://vitest.dev/)                      | Testing framework          |
| [Supertest](https://github.com/ladjs/supertest)    | HTTP integration testing   |
| [Docker Compose](https://docs.docker.com/compose/) | Local database environment |
| [Oxlint](https://oxc.rs/)                          | Code linting               |
| [Prettier](https://prettier.io/)                   | Code formatting            |

## Features

- REST API for expense management.
- Full CRUD operations for expenses.
- MongoDB persistence using Mongoose.
- DTO-based request validation.
- Partial resource updates using PATCH.
- Centralized HTTP exception handling.
- MongoDB ObjectId-based document references.
- Decimal128 storage for financial amounts.
- Unit and E2E testing.
- Environment-based application configuration.

## Architecture

The application follows a modular, feature-oriented structure based on NestJS conventions.

```text
src/
├── features/
│   └── expenses/
│       ├── dto/
│       ├── model/
│       ├── schemas/
│       ├── expenses.controller.ts
│       ├── expenses.service.ts
│       └── expenses.module.ts
│
├── app.module.ts
└── main.ts
```

### Request lifecycle

```text
HTTP Request
    |
    v
ValidationPipe
    |
    v
ExpensesController
    |
    v
ExpensesService
    |
    v
Mongoose Model
    |
    v
MongoDB
```

Controllers handle HTTP requests, services contain application logic, and Mongoose models are responsible for database operations.

## Getting Started

### Prerequisites

- Node.js 22 LTS or compatible version.
- npm.
- Docker Desktop with Docker Compose.

### Installation

1. Clone the repository:

```bash
git clone <YOUR_REPOSITORY_URL>
cd personal-expense-manager-backend
```

2. Install dependencies:

```bash
npm ci
```

3. Create your local environment configuration:

```bash
cp .env.example .env
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

4. Start MongoDB:

```bash
docker compose up -d
```

5. Start the development server:

```bash
npm run start:dev
```

The API will be available at:

`http://localhost:3000`

## Environment Configuration

The application uses environment variables for runtime configuration.

Example `.env`:

```env
PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27017/pem
```

Never commit actual credentials or secrets. Use `.env.example` to document required configuration variables.

## API Endpoints

### Expenses

| Method | Endpoint        | Description                 |
| ------ | --------------- | --------------------------- |
| GET    | `/expenses`     | Retrieve all expenses       |
| GET    | `/expenses/:id` | Retrieve an expense by ID   |
| POST   | `/expenses`     | Create a new expense        |
| PATCH  | `/expenses/:id` | Partially update an expense |
| DELETE | `/expenses/:id` | Delete an expense           |

### Example request

Create an expense:

```http
POST /expenses
Content-Type: application/json
```

```json
{
  "description": "Groceries",
  "amount": 125.5,
  "currency": "PLN",
  "categoryId": "507f1f77bcf86cd799439011"
}
```

Supported currencies: `PLN`, `EUR`, `USD`.

## Development

### Available scripts

| Command                | Description                              |
| ---------------------- | ---------------------------------------- |
| `npm run start:dev`    | Start development server with watch mode |
| `npm run start`        | Start application                        |
| `npm run build`        | Build the application                    |
| `npm test`             | Run unit tests                           |
| `npm run test:watch`   | Run tests in watch mode                  |
| `npm run test:cov`     | Generate test coverage                   |
| `npm run test:e2e`     | Run E2E tests                            |
| `npm run lint`         | Run Oxlint                               |
| `npm run format`       | Format source files                      |
| `npm run format:check` | Verify formatting                        |
| `npm run spellcheck`   | Check spelling                           |

### Database

Start the local MongoDB instance:

```bash
docker compose up -d
```

Stop it:

```bash
docker compose down
```

The database uses a Docker named volume to preserve data between container restarts.

## Code Quality

The project uses automated development tools to maintain code quality and consistency:

- Prettier for consistent formatting.
- Oxlint for static analysis.
- CSpell for spelling checks.
- Husky and lint-staged for Git hooks.
- Commitlint for Conventional Commits enforcement.
- Vitest and Supertest for automated testing.

Commit messages follow the Conventional Commits specification:

```text
feat(expenses): add expense filtering
fix(expenses): handle invalid expense IDs
test(expenses): add service unit tests
docs: update project documentation
```

## Project Goals

This project is part of a full-stack Personal Expense Manager application.

Its goals include exploring and applying:

- Modular backend architecture with NestJS.
- NoSQL data modeling with MongoDB.
- REST API design and implementation.
- TypeScript application development.
- Automated testing strategies.
- Authentication and authorization.
- Docker-based development workflows.
- CI/CD automation.

---

**Personal Expense Manager — Backend**
