# Nest.js High-Performance Order System

This project implements a backend for an order system with high-concurrency handling using Nest.js, PostgreSQL, and Redis Distributed Locks.

## Tech Stack
- **Framework**: Nest.js
- **Database**: PostgreSQL (TypeORM)
- **Cache/Lock**: Redis (ioredis)
- **Test**: Jest

## Setup & Running

### 1. Environment Setup
Make sure you have Docker and Node.js installed.

Start the database and redis modules:
```bash
docker-compose up -d
```

### 2. Installation
```bash
npm install
```

### 3. Running the App
```bash
# Development
npm run start:dev
```

### 4. Running Tests
```bash
# Unit tests
npm run test
```

## API Endpoint
- **POST /orders**
    - Body: `{ "productId": "uuid...", "quantity": 1 }`
    - Creates an order and decrements stock. Handles concurrency safely.
