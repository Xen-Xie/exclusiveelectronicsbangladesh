import crypto from "crypto";
import multer from "multer";

// Multer memory storage (keeps file in RAM so we can hash)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Middleware to filter duplicate files in a single request
const dedupFiles = (req, res, next) => {
  if (!req.files || req.files.length === 0) return next();

  const seen = new Map();
  const uniqueFiles = [];

  for (const file of req.files) {
    const hash = crypto
      .createHash("sha256")
      .update(file.buffer) // buffer since memoryStorage
      .digest("hex");

    if (!seen.has(hash)) {
      seen.set(hash, true);
      uniqueFiles.push(file);
    }
  }

  req.files = uniqueFiles;
  next();
};

export { upload, dedupFiles };
