const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();
const app = express();

// ✅ CORS Config
const corsOptions = {
  origin: [
    "http://localhost:5173",             // Local dev
    "https://svj-security.netlify.app/",             // Local dev
        // Custom domain frontend
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

// ✅ Apply CORS globally (handles preflight automatically in Express v5)
app.use(cors(corsOptions));

app.use(express.json());

// ✅ Debugging middleware
app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.originalUrl}`);
  next();
});

// ✅ Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// ✅ Routes
const entryRoutes = require("./routes/entryRoutes");
app.use("/api/entries", entryRoutes);

const adminRoutes = require("./routes/adminRoutes");
app.use("/api/admin", adminRoutes);

// ✅ Database
const connectDB = require("./config/db");
connectDB();

// ✅ Server Start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
