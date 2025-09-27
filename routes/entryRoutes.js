const express = require("express");
const router = express.Router();
const { addEntry, getAllEntries, updateStatus, upload, deleteEntry } = require("../controllers/entryController");

router.post("/add", upload.array("images", 5), addEntry);
router.get("/all", getAllEntries);
router.put("/status/:id", updateStatus);
router.delete("/:id", deleteEntry);

// ✅ EXPORT THE ROUTER
module.exports = router;
