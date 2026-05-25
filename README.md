# Custom OTP Authentication Backend

Production-ready Express.js backend for a Flutter app using Fast2SMS WhatsApp OTP, Firebase Admin SDK custom tokens, Firestore OTP storage, and Swagger documentation.

## Features

- Send WhatsApp OTP using Fast2SMS.
- Verify OTP with expiry and max-attempt support.
- Generate Firebase custom token for Flutter login.
- Swagger UI at `/api-docs`.
- Centralized validation and error handling.
- Environment-based configuration.

## Installation

```bash
npm install
```

## Environment Setup

Copy `.env.example` to `.env` and fill the values:

```env
PORT=5000
NODE_ENV=development
API_BASE_URL=http://localhost:5000
FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json
FAST2SMS_API_KEY=
MESSAGE_ID=
PHONE_NUMBER_ID=
FAST2SMS_WHATSAPP_API_URL=https://www.fast2sms.com/dev/whatsapp
OTP_EXPIRY_MINUTES=5
OTP_LENGTH=6
OTP_MAX_ATTEMPTS=5
TRUST_PROXY=false
API_RATE_LIMIT_WINDOW_MINUTES=15
API_RATE_LIMIT_MAX_REQUESTS=100
OTP_SEND_RATE_LIMIT_WINDOW_MINUTES=15
OTP_SEND_RATE_LIMIT_MAX_REQUESTS=5
OTP_VERIFY_RATE_LIMIT_WINDOW_MINUTES=15
OTP_VERIFY_RATE_LIMIT_MAX_REQUESTS=10
```

## Firebase Setup

1. Open Firebase Console.
2. Create or select your Firebase project.
3. Enable Authentication in Firebase.
4. Go to Project Settings > Service accounts.
5. Generate a new private key.
6. Replace `firebase-service-account.json` with the downloaded service account file.
7. Create a Firestore database.

This backend creates Firebase custom tokens with:

```js
const firebaseToken = await admin.auth().createCustomToken(uid, {
  phone: phone,
  role: "customer"
});
```

## Fast2SMS Setup

1. Create or open your Fast2SMS account.
2. Configure a WhatsApp template such as:

```text
Your OTP is {{1}}
```

3. Get your API key, `message_id`, and `phone_number_id`.
4. Add them to `.env`.

The backend sends the OTP as the first template variable. Internally this maps to:

```json
{
  "1": "123456"
}
```

Fast2SMS simple WhatsApp template delivery expects this as `variables_values`, so a single OTP variable is sent as `123456`.

## Run Commands

Development:

```bash
npm run dev
```

Production:

```bash
npm start
```

Server runs on:

```text
https://rangstone-backend.onrender.com
```

Swagger documentation:

```text
https://rangstone-backend.onrender.com/api-docs
```

Health check:

```text
GET /health
```

## API Usage

### Send OTP

```http
POST /api/auth/send-otp
Content-Type: application/json
```

Request:

```json
{
  "phone": "7376263360"
}
```

Response:

```json
{
  "success": true,
  "message": "OTP sent successfully"
}
```

### Verify OTP

```http
POST /api/auth/verify-otp
Content-Type: application/json
```

Request:

```json
{
  "phone": "7376263360",
  "otp": "123456"
}
```

Response:

```json
{
  "success": true,
  "message": "OTP verified successfully",
  "firebaseToken": "CUSTOM_FIREBASE_TOKEN",
  "uid": "phone_7376263360"
}
```

After successful verification, the OTP document is deleted from Firestore.

## Flutter Login Example

Use the `firebaseToken` returned by `/api/auth/verify-otp`:

```dart
final credential = await FirebaseAuth.instance
    .signInWithCustomToken(firebaseToken);
```

Suggested Flutter flow:

```dart
// 1. Call POST /api/auth/send-otp with phone.
// 2. Ask the user to enter the OTP.
// 3. Call POST /api/auth/verify-otp with phone and otp.
// 4. Sign in with the returned Firebase custom token.
final credential = await FirebaseAuth.instance
    .signInWithCustomToken(firebaseToken);

final user = credential.user;
```

## Firestore Collections

### `otp_verifications/{phone_uid}`

Temporary OTP verification document:

```json
{
  "phone": "7376263360",
  "otpHash": "sha256_hash",
  "expiresAt": "timestamp",
  "attempts": 0,
  "createdAt": "serverTimestamp",
  "updatedAt": "serverTimestamp"
}
```

## Status Codes

- `200`: Success.
- `400`: Validation error or missing required field.
- `401`: Invalid, expired, or over-attempted OTP.
- `404`: OTP or route not found.
- `429`: Rate limit exceeded.
- `500`: Configuration or server error.

## Rate Limiting

The backend uses `express-rate-limit`.

- Global API limit: `100` requests per `15` minutes by default.
- Send OTP limit: `5` requests per `15` minutes by default.
- Verify OTP limit: `10` requests per `15` minutes by default.

Set `TRUST_PROXY=true` when deploying behind a trusted reverse proxy such as Nginx, Render, Railway, or a load balancer.

## Production Notes

- Keep `.env` and `firebase-service-account.json` out of source control.
- Use HTTPS in production.
- Set `NODE_ENV=production`.
- Restrict CORS to your app or trusted domains when deploying.
- Monitor failed OTP attempts and Fast2SMS delivery responses.
- Store only hashed OTP values, as implemented here.
