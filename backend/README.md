# Backend API

## Tech Stack

- **Framework:** Express.js with TypeScript
- **Database:** MongoDB (Mongoose)
- **Auth:** Firebase Admin SDK (JWT Verification)

---

## Getting Started

### 1. Installation

Navigate to the backend directory and install dependencies:

```bash
cd backend
npm install
```

---

### 2. Required Configuration Files

1. `backend/.env` file for environment variables

```dotenv
PORT=5000
MONGO_URL=mongodb+srv://<YOUR_DB_ACCESS_USERNAME>:<YOUR_DB_ACCESS_PASSWORD>@righttocomparecluster.g0jxqgn.mongodb.net/?appName=RightToCompareCluster
```

2. `backend/serviceAccountKey.json` contains private key for Firebase Admin SDK

Can be obtained via:

`Firebase -> RightToCompare Project -> Project Settings -> Service accounts -> Generate new private key`

Rename the file to serviceAccountKey.json and move it into root of `/backend` folder.

---

### 3. Running the server

To run the backend server:

```bash
npm run dev
```

Run both the backend and frontend on two separate terminals.
