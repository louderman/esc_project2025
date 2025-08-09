# ESC 50.003 Element of Software Construction - Hotel Booking Website

## Tech Stack

- **Frontend:** React
- **Backend:** Node.js, Express, MySQL
- **APIs:** Ascenda API
- **Tests:**
  - **Frontend:** Vitest, Cypress
  - **Backend:** Jest, Supertest, Fast-Check

## Installation

1. Clone the repository
   ```bash
   git clone https://github.com/louderman/esc_project2025.git
   cd esc_project2025
   ```

### Client

2. Install dependencies

   ```bash
   cd client
   npm install
   ```

3. Start the development server
   ```bash
   npm run dev
   ```

### Server

4. Install dependencies

   ```bash
   cd server
   npm install
   ```

5. Start the development server
   ```bash
   npm run dev
   ```

### Usage

- Open your browser at http://localhost:5137 to use the client app.
- The server will run on http://localhost:5000 serving API requests.

## Testing

To run tests, navigate to the respective directory and run the test command:

### Client Tests

```bash
cd client
npm test
```

### Server Tests

```bash
cd server
npm test
```

## Folder Structure

```
esc_project2025
├─── .github
│    └─── workflows
├─── client
│    ├─── public
│    └─── src
│         ├─── assets
│         ├─── pages
│         ├─── components
│         ├─── hooks
│         ├─── reducers
│         ├─── config
│         ├─── constants
│         ├─── utils
│         ├─── App.tsx
│         └─── index.html
├─── server
│    ├─── database
│    ├─── models
│    ├─── public
│    ├─── routes
│    ├─── test
│    └─── server.ts
└─── types
```
