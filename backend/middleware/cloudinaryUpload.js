const { uploadFromBuffer, isConfigured } = require('../config/cloudinary');

async function processCloudinaryUpload(req, res, next) {
  if (!isConfigured) return next();

  try {
    const filesToProcess = [];

    if (req.file) {
      filesToProcess.push(req.file);
    }
    if (req.files) {
      if (Array.isArray(req.files)) {
        filesToProcess.push(...req.files);
      } else {
        for (const key of Object.keys(req.files)) {
          filesToProcess.push(...req.files[key]);
        }
      }
    }

    for (const file of filesToProcess) {
      if (file.buffer) {
        const url = await uploadFromBuffer(file.buffer, {
          folder: 'hungrylakwatsero'
        });
        file.cloudinaryUrl = url;
        file.filename = url;
      }
    }
  } catch (err) {
    console.error('[cloudinary] Upload failed:', err.message);
    return res.status(500).json({ message: 'Image upload service unavailable. Please try again.' });
  }

  next();
}

module.exports = { processCloudinaryUpload };
