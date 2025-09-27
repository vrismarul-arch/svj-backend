const Entry = require("../models/Entry");
const supabase = require("../config/supabaseClient");
const multer = require("multer");

// Multer setup for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

/**
 * Add new entry with image uploads
 */
const addEntry = async (req, res) => {
  try {
    const { name, phoneNumber, email, companyName, requirement } = req.body;

    if (!name || !phoneNumber || !email || !companyName) {
      return res.status(400).json({ message: "All required fields must be provided" });
    }

    let imageUrls = [];

    if (req.files && req.files.length > 0) {
      // Upload each image to Supabase
      for (const file of req.files) {
        const fileName = `entries/${Date.now()}-${file.originalname}`;
        const { error: uploadError } = await supabase.storage
          .from("ads") // bucket name
          .upload(fileName, file.buffer, {
            contentType: file.mimetype,
          });

        if (uploadError) throw uploadError;

        // Get public URL
        const { data } = supabase.storage.from("ads").getPublicUrl(fileName);
        imageUrls.push(data.publicUrl);
      }
    }

    const newEntry = new Entry({
      name,
      phoneNumber,
      email,
      companyName,
      requirement: requirement || "",
      images: imageUrls,
    });

    await newEntry.save();
    res.status(201).json({ message: "Entry saved successfully.", entry: newEntry });
  } catch (error) {
    console.error("Error adding entry:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Get all entries
 */
const getAllEntries = async (req, res) => {
  try {
    const entries = await Entry.find().sort({ createdAt: -1 });
    res.json(entries);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Update status of entry
 */
const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["Pending", "Completed", "Rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const entry = await Entry.findByIdAndUpdate(id, { status }, { new: true });
    if (!entry) return res.status(404).json({ message: "Entry not found" });

    res.json({ message: "Status updated", entry });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Delete entry by ID
 */
const deleteEntry = async (req, res) => {
  try {
    const { id } = req.params;

    const entry = await Entry.findById(id);
    if (!entry) return res.status(404).json({ message: "Entry not found" });

    // Optional: delete associated images from Supabase
    if (entry.images && entry.images.length > 0) {
      for (const url of entry.images) {
        // Extract file path from URL
        const path = url.split("/storage/v1/object/public/ads/")[1];
        if (path) {
          const { error } = await supabase.storage.from("ads").remove([path]);
          if (error) console.error("Error deleting image:", error.message);
        }
      }
    }

    await Entry.findByIdAndDelete(id);

    res.json({ message: "Entry deleted successfully" });
  } catch (error) {
    console.error("Error deleting entry:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};



module.exports = { 
  addEntry, 
  getAllEntries, 
  updateStatus, 
  upload, 
  deleteEntry 
};

