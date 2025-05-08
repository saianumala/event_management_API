# Node.js Express Project

A clean, well-structured Node.js application using Express framework.

## Prerequisites

- [Node.js](https://nodejs.org/) (v18.x or later recommended)
- [npm](https://www.npmjs.com/) (v9.x or later recommended)
- Git

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/saianumala/event_management_API.git
cd event_management_API
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Configure environment variables

```bash
cp .env.example .env
```

Edit the `.env` file with your configuration values.

### 4. Start the development server

```bash
npm run dev
```

The server will be running at `http://localhost:3000` by default.

## Available Scripts

- `npm run start`: Start the server in production mode
- `npm run dev`: Start the server in development mode with hot-reloading
- `npm run test`: Run tests
- `npm run lint`: Check code style with ESLint
- `npm run lint:fix`: Fix code style issues with ESLint
