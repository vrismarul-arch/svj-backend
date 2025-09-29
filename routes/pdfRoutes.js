const express = require("express");
const router = express.Router();
const supabase = require("../utils/supabaseClient"); // this uses SERVICE_ROLE_KEY
const multer = require("multer");

// Setup multer to handle PDF files in memory
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/upload-pdf", upload.single("pdf"), async (req, res) => {
  const file = req.file;
  const fileName = `entries/${Date.now()}-${file.originalname}`;

  try {
    // Upload PDF using Supabase service role
    const { error } = await supabase.storage
      .from("ads")
      .upload(fileName, file.buffer, { contentType: "application/pdf" });

    if (error) throw error;

    // Get public URL
    const { data } = supabase.storage.from("ads").getPublicUrl(fileName);
    res.json({ url: data.publicUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
