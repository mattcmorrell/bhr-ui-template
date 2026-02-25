# New Account Onboarding: Backend API Contract (High Level)

## 1) Upload file endpoint
- Method: `POST /api/onboarding/uploads`
- Purpose: Accept a single file and return upload identity.
- Request:
  - multipart/form-data with file payload
  - optional metadata (`accountId`, `documentType`)
- Response:
  - `fileId`
  - `name`
  - `size`
  - `uploadedAt`
  - initial `status` (`uploaded`)

## 2) Status endpoint (polling or websocket)
- Polling option:
  - Method: `GET /api/onboarding/uploads/status?accountId=:id`
  - Returns status list for all files.
- Websocket option:
  - Channel: `onboarding.uploads.status`
  - Emits status updates per file.

Each status item:
- `id`
- `name`
- `size`
- `uploadedAt`
- `uploadProgress` (0-100)
- `status` (`uploading`, `uploaded`, `processing`, `completed`, `failed`)
- `errorMessage` (optional)

## 3) Retry failed file endpoint (optional)
- Method: `POST /api/onboarding/uploads/:fileId/retry`
- Purpose: Retry failed upload/processing.
- Response: updated status item.

## 4) Finalize onboarding endpoint (optional)
- Method: `POST /api/onboarding/finalize`
- Purpose: Mark onboarding document step complete before setup continuation.
- Response:
  - `onboardingComplete: true`
  - `nextRoute: "/setup-account"`

---

# Implementation Sequence (Executed in UI)

1. Create onboarding route + page shell.
2. Add upload component + local file list state.
3. Wire upload API and per-file progress (simulated currently).
4. Add processing polling/subscription (simulated currently).
5. Add add-more upload path.
6. Add Continue Setup gating + routing.
7. Add edge-case handling + QA pass.

Current frontend implementation uses local simulation and persistence to validate UX while backend integration is pending.
