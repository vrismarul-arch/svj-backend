const Entry = require("../models/Entry");
const supabase = require("../config/supabaseClient");
const multer = require("multer");

// Multer memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

const uploadPDF = async (req, res) => {
  try {
    const { entryId } = req.body;
    if (!entryId) return res.status(400).json({ message: "Entry ID required" });
    if (!req.file) return res.status(400).json({ message: "PDF file required" });

    const fileName = `entries/${Date.now()}-${entryId}.pdf`;

    const { error } = await supabase.storage
      .from("ads")
      .upload(fileName, req.file.buffer, { contentType: "application/pdf" });

    if (error) throw error;

    const { data } = supabase.storage.from("ads").getPublicUrl(fileName);

    // Save PDF URL in MongoDB
    const entry = await Entry.findByIdAndUpdate(entryId, { pdfUrl: data.publicUrl }, { new: true });
    if (!entry) return res.status(404).json({ message: "Entry not found" });

    res.json({ message: "PDF uploaded", pdfUrl: data.publicUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Upload failed" });
  }
};

module.exports = { uploadPDF, upload };
