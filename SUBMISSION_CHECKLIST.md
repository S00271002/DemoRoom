# Part 1 submission checklist

Deadline: Sunday 11 October 2026, 23:59 Europe/Dublin. No further commits to part1Submission after the deadline.

## Code and repository

- [ ] npm ci succeeds.
- [ ] npm run typecheck passes.
- [ ] npm test passes; describe mocked tests accurately.
- [ ] npm start connects to MongoDB and starts the API.
- [ ] Test the requests in requests/api.http with an actual local MP3.
- [ ] Check persistence after restarting.
- [ ] Leave hosted assessment sample records in MongoDB.
- [ ] .env, uploads, node_modules and dist stay out of Git.
- [ ] README, .env.example, openapi.json, requests and tests are tracked.
- [ ] Commit and push the final code to branch part1Submission.
- [ ] Verify the pushed branch and the repository link shared with the lecturer.
- [ ] Ensure GitHub user ulestrange has repository access.
- [ ] No commits to the submission branch after the deadline.

## Word document

- [ ] Use the supplied headings and first person, 2–3 pages.
- [ ] Describe application, server data, development, bugs, features and references.
- [ ] Update outdated claims: Zod, PUT/DELETE, OpenAPI and tests are now included.
- [ ] Disclose direct ChatGPT implementation assistance as well as earlier tutoring.
- [ ] Explain limitations: no sessions, development identity, partial permission checks, local files, no transaction, concurrent numbering.
- [ ] Save and upload the actual Word document.

## Video (maximum five minutes, with audio)

Use requests/api.http. Narrate expected versus actual responses. The test numbers match the brief; PUT appears before DELETE so the same demo remains available.

- [ ] POST valid data — 201.
- [ ] POST invalid data — 400.
- [ ] GET the collection — 200.
- [ ] GET an existing resource — 200.
- [ ] GET a missing resource — 404.
- [ ] PUT valid data — 200.
- [ ] PUT missing resource — 404.
- [ ] PUT invalid data — 400.
- [ ] DELETE existing resource — 204.
- [ ] DELETE same resource again — 404.
- [ ] Show npm test and the documentation if time permits.
- [ ] Check recorded audio, readability and duration, then upload to Moodle.

## Separate configuration/data hand-in

- [ ] Submit the real .env through the designated private assessment upload, never Git.
- [ ] Hosted connection allows the marker access to the database and contains test data.
- [ ] For local MongoDB, export and submit JSON test data as required.
- [ ] Do not assume local audio on your computer is accessible to another computer. The marker can upload a new MP3 when running the backend.
- [ ] Upload all files and verify Moodle shows them before the deadline.

The assignment text says "Vitest with Superbase". This implementation uses Vitest with Supertest for Express HTTP tests. Explain this choice and verify the lecturer's expected library if possible.
