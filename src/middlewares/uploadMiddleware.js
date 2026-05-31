const multer = require("multer");

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: Number(process.env.UPLOAD_MAX_FILE_SIZE_MB || 5) * 1024 * 1024
  }
});

module.exports = upload;
