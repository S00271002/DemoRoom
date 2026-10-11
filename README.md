# DemoRoom Backend

DemoRoom is my REST API for sharing unfinished music within bands. Demos have separate audio versions and feedback stays attached to the recording it refers to.

This Part 1 submission uses Express, TypeScript, MongoDB/Mongoose and Zod. It includes demo CRUD, MP3 uploads and playback, version history, comments, bands, and registration/password checking.

## Run it

Use Node.js 22.12 or later in the 22 LTS line, or a current newer LTS release, with npm. Open a terminal in the repository root:

```powershell
npm ci
Copy-Item .env.example .env
```

Edit `.env` with your own values:

```dotenv
MONGODB_URI=your_database_connection_string
DEV_USER_ID=
DEV_USER_EMAIL=your_test_account_email
DEV_USER_PASSWORD=your_test_account_password
```

For MongoDB Atlas, the cluster must be running and Network Access must allow the machine running this API. The database account in the connection string needs access to the selected database.

Create a development user:

```powershell
npm run seed:dev
```

Copy the printed account ID into `DEV_USER_ID`. Remove `DEV_USER_PASSWORD` after creating the user. Existing accounts are recognised by email.

Start:

```powershell
npm start
```

The server connects to MongoDB before listening at http://localhost:3000. Run commands from the project root so `.env` and the local `uploads` folder are found. Press Ctrl+C to stop. Restart after edits to rebuild TypeScript.

## API documentation and manual requests

- Swagger UI: http://localhost:3000/api-docs
- OpenAPI JSON: http://localhost:3000/openapi.json
- Standalone specification: `openapi.json`
- Manual tests: `requests/api.http`

Open `requests/api.http` with the VS Code REST Client extension. Change the MP3 paths before sending upload requests. Run the named band request and demo request first; subsequent requests use their returned IDs. The file includes all ten required CRUD video cases plus revisions, feedback, playback and account examples.

Upload requests use `multipart/form-data`, not JSON. Supply one MP3 in the field named `audio`. Maximum file size is 50 MiB. A new demo needs title, description and a valid bandId. Tempo (1–400) and key are optional. The first recording automatically receives an initial-version note; later recordings require changeNote.

The demo ID is a MongoDB ObjectId. URLs use a version NUMBER within that demo. Comments internally link to the selected version's unique MongoDB ID.

## Main endpoints

| Method | URL | Purpose |
|---|---|---|
| GET | / | Status |
| POST | /api/users/register | Register an account |
| POST | /api/users/login | Verify credentials |
| GET, POST | /api/bands | List development user's bands / create band |
| GET, POST | /api/demos | List demos / create demo with first recording |
| GET, PUT, PATCH, DELETE | /api/demos/:id | Read, replace metadata, edit metadata, delete |
| GET, POST | /api/demos/:id/versions | List recordings / upload revision |
| GET | /api/demos/:id/versions/:versionId | Read version by number |
| GET | /api/demos/:id/versions/:versionId/audio | Play the MP3 |
| GET, POST | /api/demos/:id/versions/:versionId/comments | Read / add version-specific feedback |

PUT replaces editable demo metadata and requires title and description. Omitted optional tempo and key are removed. It preserves band, uploader, recordings and identifiers. PATCH updates selected metadata fields and requires at least one recognised field. Deleting a demo deletes its versions and comments and attempts to remove its recordings from disk.

Zod validates request bodies; middleware validates URL IDs/numbers. Mongoose also validates database fields. Errors use JSON and appropriate statuses, including 400, 401, 403, 404, 409, 413 and 500.

## Checks

```powershell
npm run typecheck
npm test
```

Vitest and Supertest cover HTTP behaviour with mocked database/service operations. These tests do not prove a live MongoDB connection, persistence or real MP3 playback. Use the REST Client requests against the running server for those checks. The brief says "Superbase"; this submission uses Supertest, the Express HTTP testing library, alongside Vitest.

For a live check, create a band, upload a demo, add a revision and comment, open the audio URL, then restart and retrieve the same data. Leave sample records in the assessment database. Do not delete the only assessment sample while recording the DELETE example.

## Structure

- `src/app.ts`: Express application, routers and documentation.
- `src/server.ts`: database connection and server startup.
- `src/routes`: HTTP handlers.
- `src/services`: database operations.
- `src/models`: Mongoose schemas.
- `src/validation`: Zod request schemas.
- `src/middleware`: URL checks, uploads and errors.
- `src/scripts/createDevUser.ts`: test account setup.

## Storage and limitations

MongoDB stores users, bands, demos, versions and comments. MP3s are local files under `uploads`; their locations are stored with versions. A fresh checkout needs new audio uploads because files are not in Git. Audio and database records must be backed up together.

Login checks credentials but does not create a session. Mutations use the server's configured DEV_USER_ID, rather than a logged-in request identity. Band ownership/membership data exists, but membership administration and complete access permissions are unfinished. This is a coursework prototype.

Database changes and file operations are not a single transaction. Failed operations may leave partial records/files; concurrent uploads can choose the same version number. MP3 checks inspect extension and size, not the actual audio contents. Angular and deployment are later stages.

## Submission

See `SUBMISSION_CHECKLIST.md` for the branch, report, video and configuration deliverables. Keep `.env` out of Git; submit it separately through the designated assessment channel. Hosted assessment data must be accessible to the marker. Local audio on my PC is not remotely available simply because Atlas is hosted.

## Sources and AI assistance

I used ChatGPT for explanations, suggested code, reviews and debugging. Near the deadline I authorised direct assistance with implementation, automated tests and submission documentation. This assistance should also be disclosed in my Word report. I need to understand and verify the submitted code.

- Express: https://expressjs.com/en/guide/routing.html
- Express errors: https://expressjs.com/en/guide/error-handling.html
- TypeScript: https://www.typescriptlang.org/tsconfig/
- Mongoose: https://mongoosejs.com/docs/guide.html
- MongoDB Atlas: https://www.mongodb.com/docs/atlas/connect-to-database-deployment/
- Multer: https://github.com/expressjs/multer
- Argon2: https://github.com/ranisalt/node-argon2
- Zod: https://zod.dev/
- Swagger UI Express: https://github.com/scottie1984/swagger-ui-express
- Vitest: https://vitest.dev/
- Supertest: https://github.com/forwardemail/supertest
- ChatGPT: https://chatgpt.com/

Only retain references I actually consulted or used.
