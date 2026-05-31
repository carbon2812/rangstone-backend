const path = require("path");
const { getStorageBucket } = require("../config/firebaseStorage");

const uploadBufferToFirebase = async (file, folder) => {
  const bucket = getStorageBucket();
  const extension = path.extname(file.originalname || "");
  const filePath = `${folder}/${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`;
  const firebaseFile = bucket.file(filePath);

  await firebaseFile.save(file.buffer, {
    metadata: {
      contentType: file.mimetype
    },
    resumable: false
  });

  await firebaseFile.makePublic();

  return {
    url: `https://storage.googleapis.com/${bucket.name}/${filePath}`,
    path: filePath
  };
};

module.exports = {
  uploadBufferToFirebase
};
