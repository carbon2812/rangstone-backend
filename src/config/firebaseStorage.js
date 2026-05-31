const admin = require("firebase-admin");
const path = require("path");
const fs = require("fs");
const env = require("./env");

let bucket;

const parseServiceAccount = () => {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    const account = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
    if (account.private_key) account.private_key = account.private_key.replace(/\\n/g, "\n");
    return account;
  }

  if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
    const account = JSON.parse(
      Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, "base64").toString("utf8")
    );
    if (account.private_key) account.private_key = account.private_key.replace(/\\n/g, "\n");
    return account;
  }

  if (
    process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.FIREBASE_PRIVATE_KEY
  ) {
    return {
      project_id: process.env.FIREBASE_PROJECT_ID,
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
    };
  }

  if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
    const serviceAccountPath = path.resolve(process.cwd(), process.env.FIREBASE_SERVICE_ACCOUNT_PATH);
    return JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));
  }

  return null;
};

const getStorageBucket = () => {
  if (bucket) return bucket;

  if (!env.firebaseStorageBucket) {
    const error = new Error("FIREBASE_STORAGE_BUCKET is required for file upload.");
    error.statusCode = 500;
    throw error;
  }

  if (!admin.apps.length) {
    const serviceAccount = parseServiceAccount();
    if (!serviceAccount) {
      const error = new Error("Firebase service account is not configured for Storage uploads.");
      error.statusCode = 500;
      throw error;
    }

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: env.firebaseStorageBucket
    });
  }

  bucket = admin.storage().bucket();
  return bucket;
};

const getFirebaseStorageStatus = () => ({
  configured: Boolean(env.firebaseStorageBucket) && (
    Boolean(process.env.FIREBASE_SERVICE_ACCOUNT_JSON) ||
    Boolean(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) ||
    Boolean(process.env.FIREBASE_SERVICE_ACCOUNT_PATH) ||
    Boolean(
      process.env.FIREBASE_PROJECT_ID &&
        process.env.FIREBASE_CLIENT_EMAIL &&
        process.env.FIREBASE_PRIVATE_KEY
    )
  )
});

module.exports = {
  getStorageBucket,
  getFirebaseStorageStatus
};
