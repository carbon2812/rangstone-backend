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
  if (!process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    return null;
  }

  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);

  if (serviceAccount.private_key) {
    serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");
  }

  return serviceAccount;
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

const getServiceAccount = () => parseServiceAccountFromEnv() || parseServiceAccountFromFile();

const initializeFirebase = () => {
  if (admin.apps.length) {
    cachedDb = cachedDb || admin.firestore();
    return;
  }

  const serviceAccount = getServiceAccount();

  if (!serviceAccount) {
    throw createFirebaseConfigError(
      "Firebase service account is not configured. Set FIREBASE_SERVICE_ACCOUNT_PATH or FIREBASE_SERVICE_ACCOUNT_JSON."
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
