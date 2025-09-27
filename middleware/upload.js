const multer = require("multer");

// Memory storage (files stored in memory, not disk)
const storage = multer.memoryStorage();

module.exports = multer({ storage });
