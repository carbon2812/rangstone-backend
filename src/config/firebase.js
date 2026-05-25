const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");

let cachedDb = null;
let cachedInitError = null;

const createFirebaseConfigError = (message) => {
  const error = new Error(message);
  error.statusCode = 500;
  return error;
};

const isPlaceholderServiceAccount = (serviceAccount) => {
  return !serviceAccount.project_id || serviceAccount.project_id === "your-project-id";
};

const parseServiceAccountFromEnv = () => {
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

  if (!serviceAccountJson) {
    return null;
  }

  const serviceAccount = JSON.parse(serviceAccountJson);

  if (serviceAccount.private_key) {
    serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");
  }

  return serviceAccount;
};

const parseServiceAccountFromBase64Env = () => {
  const serviceAccountBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;

  if (!serviceAccountBase64) {
    return null;
  }

  const serviceAccount = JSON.parse(
    Buffer.from(serviceAccountBase64, "base64").toString("utf8")
  );

  if (serviceAccount.private_key) {
    serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");
  }

  return serviceAccount;
};

const parseServiceAccountFromFields = () => {
  const {
    FIREBASE_CLIENT_EMAIL,
    FIREBASE_PRIVATE_KEY,
    FIREBASE_PROJECT_ID
  } = process.env;

  if (!FIREBASE_CLIENT_EMAIL && !FIREBASE_PRIVATE_KEY) {
    return null;
  }

  const missing = [];

  if (!FIREBASE_PROJECT_ID) missing.push("FIREBASE_PROJECT_ID");
  if (!FIREBASE_CLIENT_EMAIL) missing.push("FIREBASE_CLIENT_EMAIL");
  if (!FIREBASE_PRIVATE_KEY) missing.push("FIREBASE_PRIVATE_KEY");

  if (missing.length) {
    throw createFirebaseConfigError(
      `Missing Firebase service account fields: ${missing.join(", ")}.`
    );
  }

  return {
    project_id: FIREBASE_PROJECT_ID,
    client_email: FIREBASE_CLIENT_EMAIL,
    private_key: FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
  };
};

const parseServiceAccountFromFile = () => {
  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

  if (!serviceAccountPath) {
    return null;
  }

  const resolvedPath = path.resolve(process.cwd(), serviceAccountPath);

  if (!fs.existsSync(resolvedPath)) {
    throw createFirebaseConfigError(
      `Firebase service account file was not found at ${resolvedPath}. Download it from Firebase Console > Project Settings > Service accounts.`
    );
  }

  return JSON.parse(fs.readFileSync(resolvedPath, "utf8"));
};

const getServiceAccount = () =>
  parseServiceAccountFromEnv() ||
  parseServiceAccountFromBase64Env() ||
  parseServiceAccountFromFields() ||
  parseServiceAccountFromFile();

const initializeFirebase = () => {
  if (admin.apps.length) {
    cachedDb = cachedDb || admin.firestore();
    return;
  }

  const serviceAccount = getServiceAccount();

  if (!serviceAccount) {
    throw createFirebaseConfigError(
      "Firebase service account is not configured. Set FIREBASE_SERVICE_ACCOUNT_JSON, FIREBASE_SERVICE_ACCOUNT_BASE64, FIREBASE_CLIENT_EMAIL/FIREBASE_PRIVATE_KEY/FIREBASE_PROJECT_ID, or FIREBASE_SERVICE_ACCOUNT_PATH."
    );
  }

  if (isPlaceholderServiceAccount(serviceAccount)) {
    throw createFirebaseConfigError(
      "Firebase service account is still using placeholder values. Replace firebase-service-account.json with the real file downloaded from Firebase Console."
    );
  }

  const appOptions = {
    credential: admin.credential.cert(serviceAccount)
  };

  if (process.env.FIREBASE_PROJECT_ID) {
    appOptions.projectId = process.env.FIREBASE_PROJECT_ID;
  }

  admin.initializeApp(appOptions);
  cachedDb = admin.firestore();
};

const ensureFirebase = () => {
  if (cachedDb) {
    return {
      admin,
      db: cachedDb
    };
  }

  try {
    initializeFirebase();
    cachedInitError = null;
  } catch (error) {
    cachedInitError = error;
    throw error;
  }

  return {
    admin,
    db: cachedDb
  };
};

const getFirebaseStatus = () => {
  if (cachedDb) {
    return {
      configured: true
    };
  }

  try {
    ensureFirebase();
    return {
      configured: true
    };
  } catch (error) {
    return {
      configured: false,
      message: cachedInitError ? cachedInitError.message : error.message
    };
  }
};

module.exports = {
  admin,
  ensureFirebase,
  getFirebaseStatus
};
