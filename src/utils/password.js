const bcrypt = require("bcryptjs");

const hashPassword = (password) => bcrypt.hash(password, 12);

const comparePassword = (password, hash) => {
  if (!password || !hash) return false;
  return bcrypt.compare(password, hash);
};

module.exports = {
  hashPassword,
  comparePassword
};
