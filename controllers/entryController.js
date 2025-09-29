const Entry = require("../models/Entry");
const supabase = require("../config/supabaseClient");
const multer = require("multer");

// Multer memory storage for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });


const addEntry = async (req, res) => {
  try {
    const { name, phoneNumber, email, companyName, requirement, requirementType, brands } = req.body;

    if (!name || !phoneNumber || !email || !companyName || !requirementType) {
      return res.status(400).json({ message: "All required fields must be provided" });
    }

    // Handle images upload to Supabase
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const fileName = `entries/${Date.now()}-${file.originalname}`;
        const { error } = await supabase.storage.from("ads").upload(fileName, file.buffer, {
          contentType: file.mimetype,
        });
        if (error) throw error;

        const { data } = supabase.storage.from("ads").getPublicUrl(fileName);
        imageUrls.push(data.publicUrl);
      }
    }

    // Parse brands if JSON string
    let parsedBrands = [];
    if (brands) {
      try {
        parsedBrands = JSON.parse(brands);
      } catch {
        parsedBrands = Array.isArray(brands) ? brands : [brands];
      }
    }

    const newEntry = new Entry({
      name,
      phoneNumber,
      email,
      companyName,
      requirement: requirement || "",
      requirementType,
      brands: parsedBrands,
      images: imageUrls,
    });

    await newEntry.save();
    res.status(201).json({ message: "Entry saved successfully.", entry: newEntry });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const getAllEntries = async (req, res) => {
  try {
    const entries = await Entry.find().sort({ createdAt: -1 });
    res.json(entries);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

/** Update status of entry */
const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["Pending", "Action In Progress", "Completed", "Rejected"].includes(status)) {
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

/** Delete entry */
const deleteEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const entry = await Entry.findById(id);
    if (!entry) return res.status(404).json({ message: "Entry not found" });

    // Delete images from Supabase
    if (entry.images?.length > 0) {
      for (const url of entry.images) {
        const path = url.split("/storage/v1/object/public/ads/")[1];
        if (path) await supabase.storage.from("ads").remove([path]);
      }
    }

    await Entry.findByIdAndDelete(id);
    res.json({ message: "Entry deleted successfully" });
  } catch (error) {
    console.error("Error deleting entry:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { addEntry, getAllEntries, updateStatus, deleteEntry, upload };




