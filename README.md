# Session Store API

A standalone Express service that stores session JSON objects in a MinIO
(S3-compatible) bucket.

Each session is stored as a JSON file named:

- `session-<id>.json`

## Architecture

```
whatsappRoutes  ->  sessionStore  ->  bucketService  ->  MinioFilesClient  ->  MinIO
sessionRoutes   ->  sessionStore  ->  bucketService  ->  MinioFilesClient  ->  MinIO
bucketRoutes    ->                    bucketService  ->  MinioFilesClient  ->  MinIO
```

- `bucketService` is the only thing that talks to `MinioFilesClient` (the raw MinIO SDK wrapper).
- `sessionStore` is the only thing `sessionRoutes` and `whatsappRoutes` use to persist/read session data.
- MinIO buckets are identified by **name** (no separate numeric bucket id), and objects by their **key** (`session-<id>.json`) within the bucket.

## What this project provides

- `POST /buckets/init` → create a MinIO bucket (optional helper)
- `GET /buckets/:bucketId/objects` → inspect bucket objects
- `POST /sessions/:id` → create/save session JSON
- `PUT /sessions/:id` → update session JSON
- `GET /sessions/:id` → fetch session JSON
- `GET /sessions` → list session-like objects in bucket
- `DELETE /sessions/:id` → delete session by id
- `GET /whatsapp?number=...` → start WhatsApp pairing-code flow
- `GET /whatsapp/qr` → start WhatsApp QR-code flow
- `GET /whatsapp/fetch-example/:id` → fetch a persisted WhatsApp session
- `GET /` → simple frontend for entering a number / scanning a QR

## Setup

1. Have a MinIO server running (self-hosted or `docker run minio/minio`), reachable at the host/port you configure below.

2. Install dependencies:

```bash
npm install
```

3. Set these in `.env`:

- `MINIO_ENDPOINT` (e.g. `localhost`)
- `MINIO_PORT` (e.g. `9000`)
- `MINIO_USE_SSL` (`true`/`false`)
- `MINIO_ACCESS_KEY`
- `MINIO_SECRET_KEY`
- `MINIO_BUCKET` (bucket name — optional if you'll call `POST /buckets/init` first)

4. Run service:

```bash
npm run dev
# or
npm start
```

## API usage examples

### 1) Create a bucket (if needed)

```bash
curl -X POST http://localhost:3000/buckets/init \
  -H "Content-Type: application/json" \
  -d '{"name":"sessions","public":false}'
```

### 2) Save a session

```bash
curl -X POST http://localhost:3000/sessions/user-123 \
  -H "Content-Type: application/json" \
  -d '{"user":"kenny","state":{"step":"otp"}}'
```

### 3) Fetch a session

```bash
curl http://localhost:3000/sessions/user-123
```

### 4) List sessions

```bash
curl http://localhost:3000/sessions
```

### 5) Delete session

```bash
curl -X DELETE http://localhost:3000/sessions/user-123
```

## Notes

- Session metadata cache is stored locally in `data/session-index.json`. It's just a lookup helper — the source of truth is always the object in the MinIO bucket.
- Session content isn't stored with a permanent public URL. If you need a shareable link, generate one on demand via `sessionStore.getPresignedUrl(id)` (short-lived, since session files contain sensitive WhatsApp creds).
- Keep the bucket **private** (`public: false`) unless you specifically want files to be publicly downloadable.
# codex-session
# codex-session
