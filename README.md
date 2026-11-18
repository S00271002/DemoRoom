# DemoRoom Backend

An Express and MongoDB API for band demos, MP3 versions and comments.

## Run locally

1. Run `npm ci`.
2. Copy `.env.example` to `.env`. Set `MONGODB_URI` to your MongoDB connection string.
3. Set `DEV_USER_ID` to your development user ID. To create a user, fill in `DEV_USER_EMAIL` and `DEV_USER_PASSWORD`, run `npm run seed:dev`, and use the printed ID.
4. Run `npm start`.

The API runs at [localhost:3000](http://localhost:3000). Open [Swagger](http://localhost:3000/api-docs) to try the endpoints.

Create a band with `POST /api/bands` before uploading your first demo. Send JSON such as `{"name":"My Band"}`.

Run `npm test` to run the backend tests.
