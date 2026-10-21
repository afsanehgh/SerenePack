# PetRegister

PetRegister is a full-stack pet-record management application. It includes an authenticated REST API and command-line client, plus a browser-based web frontend for creating an account, signing in, and managing your pets. Each pet has a `petName`, a `description`, an owner, and a MongoDB-generated ID.

## Technology

- Node.js and Express
- MongoDB and Mongoose
- Zod request validation
- JWT authentication and bcrypt password hashing
- Jest tests

## Run locally

1. Open a terminal in the project folder and install dependencies:

   ```powershell
   npm.cmd install
   ```

2. Copy `.env.example` to `.env` if you do not already have a local environment file. Add a strong JWT secret:

   ```powershell
   Copy-Item .env.example .env
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

   Put the generated value after `JWT_SECRET=` in `.env`. Keep this value private and do not commit `.env`.

3. Start MongoDB and the API:

   ```powershell
   npm.cmd run db:up
   npm.cmd start
   ```

   The API listens on port 8000 by default. `npm.cmd run db:down` stops the local MongoDB container.

   In VS Code, open the workspace root and press F5 with **Debug PetRegister** selected. This launches the API from the `PetRegister` folder; MongoDB must already be running.

## Troubleshooting startup

- If `npm.cmd run db:up` reports that the `petregister-mongodb` container name is already in use, do not remove the container automatically. Check whether it is already running:

  ```powershell
  docker ps --filter "name=petregister-mongodb"
  ```

  If it is listed and healthy, leave it running and start the API with `npm.cmd start`. If it exists but is stopped, start it with `docker start petregister-mongodb`, then run `npm.cmd start`. Only use `npm.cmd run db:up` when the MongoDB container does not already exist.

- Keep both the API and frontend running in separate terminals. The API should report that MongoDB is connected and it is listening on port 8000; Vite serves the web app at `http://localhost:3000`.
- Opening `http://localhost:8000/` directly may return `404 Route not found.` This is expected: the API has no homepage route. Use the frontend at `http://localhost:3000`; registration and login send `POST` requests to `/auth/register` and `/auth/login`.
- If the frontend says it cannot connect, confirm that the API is running and that `VITE_API_URL` in `web/.env.local` points to the API (default: `http://localhost:8000`). Use `localhost` for the frontend to match the API's default CORS origin.

## Authentication

Create an account with `POST http://localhost:8000/auth/register` or log in with `POST http://localhost:8000/auth/login`. Send JSON with an email and password:

```json
{
  "email": "you@example.com",
  "password": "a-password-at-least-12-characters"
}
```

Registration requires a password of at least 12 characters. Both endpoints return a JWT. Send it with each pet request:

```text
Authorization: Bearer <token>
```

Tokens expire after one hour. The API permits browser origins listed in `CORS_ORIGIN`; its default is `http://localhost:3000`.

## Pet API

All pet endpoints require a valid JWT. Each account can access only its own pets.

The repository also includes a Postman collection at [`PetResigter.postman_collection.json`](./PetResigter.postman_collection.json), which you can import into Postman to view and try the API requests.

| Method   | Path       | Description                                 |
| -------- | ---------- | ------------------------------------------- |
| `POST`   | `/pet`     | Register a pet                              |
| `GET`    | `/pet`     | List the authenticated user's pets          |
| `GET`    | `/pet/:id` | Get one of the authenticated user's pets    |
| `PUT`    | `/pet/:id` | Update one of the authenticated user's pets |
| `DELETE` | `/pet/:id` | Delete one of the authenticated user's pets |

Pet creation and update requests accept exactly these JSON fields:

```json
{
  "petName": "Snowy",
  "description": "A friendly pet looking for a loving home."
}
```

`petName` must be 2–30 characters and `description` must be 50–200 characters. The owner is set from the authenticated token; clients must not send an `owner` field. Validation errors return HTTP 400 with a `message` and field-specific `errors`.

API errors include a stable `code` and a `requestId` (also returned in the `X-Request-Id` header). Validation errors include an `errors` array with field-specific messages. Unexpected server failures return a generic message; use the request ID to correlate the response with the server log. The CLI displays safe API messages and actionable connection/timeout guidance.

Pet business rules and owner-scoped database access live in `src/services/PetService.js`; Express controllers only translate between requests and responses. Reusable CLI pet prompts live in `src/client/prompts/petPrompts.js`.

## Command-line client

Set the token in the same PowerShell session before starting the client:

```powershell
$env:API_TOKEN = '<token returned by register or login>'
node .\src\client\petRegisterClient.js
```

## Web application

The web frontend is the part of PetRegister that runs in your browser. It provides the sign-in and registration screens and a pet dashboard where you can add, view, search, edit, and delete your pet records. It is built with React and TypeScript, uses Redux Toolkit to manage authentication and pet data, and sends requests to the existing Express API. It does not replace the API or database: all account and pet data is handled by the backend.

### Start the frontend

Start MongoDB and the API first, following [Run locally](#run-locally). Leave the API running. Open a **second terminal** at the project root (`PetRegister`) and run:

```powershell
cd .\web
npm.cmd install
npm.cmd run dev
```

Open **http://localhost:3000** in your browser. Keep both terminals open while using the app: one runs the API, and the other runs the frontend development server.

The frontend expects the API at `http://localhost:8000` by default. To use a different API address, create `web/.env.local` and set:

```powershell
VITE_API_URL=http://localhost:8000
```

Restart the frontend development server after changing `.env.local`. The API's default CORS configuration allows `http://localhost:3000`, so use `localhost` (not `127.0.0.1`) in the browser unless you also update `CORS_ORIGIN`.

### Frontend tests and production build

From the `web/` directory, run:

```powershell
npm.cmd test
npm.cmd run build
```

`npm.cmd test` runs the frontend unit and component tests. `npm.cmd run build` type-checks the TypeScript application and creates production-ready static files in `web/dist/`.

### Frontend architecture

- `src/app/` configures the Redux store, typed hooks, and application routes.
- `src/features/auth/` and `src/features/pets/` contain the authentication and pet screens, Redux slices, async API thunks, selectors, and feature tests.
- `src/services/` handles HTTP communication with the backend.
- `src/components/ui/` contains reusable interface components such as buttons, text fields, alerts, and dialogs.
- `src/styles.css` defines the responsive visual design.

## Tests

Run the Jest test suite:

```powershell
npm.cmd test -- --runInBand
```

Run tests with a coverage report and enforce the configured 90% global thresholds:

```powershell
npm.cmd run test:coverage
```
