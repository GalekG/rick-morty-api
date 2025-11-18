# Rick and Morty API
An API built with Node.js, Express, and GraphQL, designed to access Rick and Morty character data, implementing robust caching strategies with Redis and data persistence with PostgreSQL.

## 🚀 Features

- GraphQL API for querying Rick and Morty character data
- Redis caching for improved performance
- PostgreSQL database with Sequelize ORM
- Automatic data synchronization with the Rick and Morty API (Cron Job each 12h)
- Docker and Docker Compose support
- Swagger documentation
- TypeScript support
- Unit tests
- Linting and code formatting

## 🛠 Prerequisites

- Node.js (v20 or later)
- Docker and Docker Compose
- PostgreSQL
- Redis

## 🚀 Getting Started

### 1. Clone the repository

```bash
https://github.com/GalekG/rick-morty-api.git
cd rick-morty-api
```

### 2. Environment Setup

Create a `.env` file in the root directory with the following variables:

```env
# App Configuration
APP_PORT=3000
APP_NAME=rick-and-morty
APP_ENV=development

BASE_URL=http://localhost:3000

# Security Configuration
CORS_ORIGIN=*
CORS_ALLOWED_HEADERS=Content-Type,Authorization,Accept
CORS_ALLOWED_METHODS=POST,PUT,DELETE,GET,PATCH,OPTIONS

# Database Configuration
DB_DIALECT=postgres
DB_HOST=db
DB_PORT=5432
DB_USER=user
DB_PASSWORD=password
DB_NAME=rickmortydb

# Redis Configuration
REDIS_HOST=redis
REDIS_PORT=6379

# External API
RICK_MORTY_API_URL=https://rickandmortyapi.com/graphql
```

### 3. Run with Docker Compose (Recommended)

This command builds the image, starts PostgreSQL and Redis, executes DB migrations, and starts the API.

```bash
docker-compose up --build
```
The API will be available at http://localhost:3000/api

### 4. 🏗️ Run the project locally (without Docker)

If you prefer to run the project directly on your machine without Docker, make sure that **PostgreSQL** and **Redis** are already running in your environment.

#### 1. Start required services

Before continuing, ensure that:

- **PostgreSQL** is running and the database specified in `DB_NAME` inside your `.env` file has been created.
- **Redis** is running on the host and port configured in `REDIS_HOST` and `REDIS_PORT`.

#### 2. Install dependencies

```bash
npm install
```

#### 3. Run database migrations
Before starting the API, apply the migrations:

```bash
npm run db:migrate
```
(To revert the last migration:)
```bash
npm run db:migrate:undo
```

#### 4. Start the development server
```bash
npm run dev
````
This will start the server using **nodemon**, with automatic reload on file changes.

#### 5. Local endpoints
- Base API: http://localhost:3000/api
- GraphQL Playground: http://localhost:3000/api/graphql
- Swagger Docs: http://localhost:3000/api/docs

## 🧪 Database Schema

### Entity-Relationship Diagram (ERD)

This diagram visualizes the structure of the two core entities: **Characters** and **Locations**.

![Rick and Morty Entity Relationship Diagram](Rick%20And%20Morty%20ERD.png)

### 🔗 Key Relationships

The database utilizes a **One-to-Many (1:N)** relationship where one `Location` can be linked to multiple `Characters`. Since the foreign keys are nullable (`allowNull: true` in Sequelize), these relationships are **optional** (1:0..N).

| Relationship | Description |
| :--- | :--- |
| **Origin Location** | A `Character` has a foreign key (`originLocationId`) linking to the `Location` where they originated. |
| **Current Location** | A `Character` has a foreign key (`currentLocationId`) linking to their current known `Location`. |

## 📚 API Documentation

### GraphQL Playground
#### Access the GraphQL Playground and Swagger
- **GraphQL Playground (Interactive):** http://localhost:3000/api/graphql
- **Swagger Documentation:** http://localhost:3000/api/docs

#### Primary Query: `characters`
The `characters` query supports both pagination and filtering. **The limit is fixed at 20 items per page** due to the constraints of the external API.

| Argument | Type                 | Description                                         |
|----------|----------------------|-----------------------------------------------------|
| page     | Int                  | Page number to request (Default: 1)                 |
| filters  | CharacterFilterInput | Object to filter characters by specific properties. |


#### 1. Base Query

```graphql
query GetCharactersPage {
  characters(page: 1) {
    total
    page
    items {
      id
      name
      status
      species
      origin { name dimension }
    }
  }
}
```

#### 2. Query Example with Filters (Mandatory Requirement)
This query filters by multiple criteria, including the character's origin, demonstrating compliance with all filtering requirements.

```graphql
query FilteredCharactersPage($page: Int, $filters: CharacterFilterInput) {
  characters(page: $page, filters: $filters) {
    total
    page
    items {
      id
      name
      status
      gender
      origin { name }
      location { name }
    }
  }
}
# Example Variables (to use in the Playground)
# {
#   "page": 1,
#   "filters": {
#     "name": "Morty",
#     "status": "Alive",
#     "gender": "Male",
#     "origin": "Earth" # This filter is handled by the local DB fallback logic.
#   }
# }
```
## 📐 Code Quality and Architecture

The project uses a layered architecture focused on **Separation of Responsibilities** and **Testability**:
- **Service Layer (`CharacterService`):** Contains the core business logic and the data strategy (Cache -> API -> DB Fallback).
- **Repository Pattern (`CharacterRepository`):** Isolates Sequelize (DB) queries and transactions from business logic.
- **Adapter Pattern (`RickAndMortyAdapter`):** Encapsulates all communication with the external Rick and Morty GraphQL API and data mapping.
- **Method Decorator (`@timeSpent`):** Applied to the main resolver to measure and log the exact execution time of each query in the application logs.

## 🧪 Testing

Run the test suite:
```bash
npm test
```

Generate test coverage report:
```bash
npm run test:coverage
```

## 🔧 Local Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application
- `npm start` - Start the production server
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate test coverage report
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run db:migrate` - Run database migrations
- `npm run db:migrate:undo` - Revert the last migration
- `npm run db:seed:generate` - Generates a new seeder
- `npm run db:seed:all` - Run all seeders

---

Made by Kevin Checa [kevincheca1499@gmail.com]
