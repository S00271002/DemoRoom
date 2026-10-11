# Submission verification

Checked on 11 October 2026.

- Clean `npm ci` succeeded, with no reported vulnerabilities.
- TypeScript build and type checking passed.
- All 36 Vitest/Supertest tests passed (25 HTTP cases and 11 service cases). Database/file deletion operations in the automated suite are mocked.
- The actual server connected to MongoDB and passed 26 live checks using an existing MP3.
- Live checks covered the ten required CRUD outcomes, nested versions/comments, MP3 download and byte ranges, and removal of a disposable demo's linked MongoDB records and audio files.
- A separate sample demo was left in the assessment database with two versions and an original-version comment.

Sample demo ID: `6acb8c2ee478a229e523f8a2`.

Sample audio: `http://localhost:3000/api/demos/6acb8c2ee478a229e523f8a2/versions/1/audio`.

The Word report is a draft to review before hand-in. Its DOCX structure was checked, but page rendering was unavailable; check the final 2–3 page length in Word. The video, private configuration upload and Moodle submission still need to be completed.
