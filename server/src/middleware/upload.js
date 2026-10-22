import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";
// ===========================================================================
// REGISTRATION UPLOADS: government ID + face photo, in ONE request.
// (Everything above is your existing code and does not change.)
// ===========================================================================
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB per file

// What each form field may contain, and which Cloudinary folder it goes to.
const REGISTRATION_FILES = {
  idImage: {
    folder: "espi/id-images",
    formats: ["jpg", "jpeg", "png", "pdf"],
    mimeTypes: ["image/jpeg", "image/png", "application/pdf"],
    rejectMessage: "The ID must be a JPG, PNG or PDF file",
  },
  faceImage: {
    folder: "espi/face-images",
    formats: ["jpg", "jpeg", "png", "webp"],
    mimeTypes: ["image/jpeg", "image/png", "image/webp"],
    rejectMessage: "The face photo must be a JPG, PNG or WebP image",
  },
};

// An error the errorHandler will send back as a 400 (not a 500).
function uploadError(message) {
  const err = new Error(message);
  err.status = 400;
  return err;
}

// Tells Cloudinary the folder + allowed formats for each file, by form field.
export function registrationUploadParams(req, file) {
  const rule = REGISTRATION_FILES[file.fieldname];
  return { folder: rule.folder, allowed_formats: rule.formats };
}

// Runs BEFORE anything is sent to Cloudinary, and turns away the wrong kind of file.
export function registrationFileFilter(req, file, cb) {
  const rule = REGISTRATION_FILES[file.fieldname];
  if (!rule)
    return cb(uploadError(`Unexpected file field "${file.fieldname}"`));
  if (!rule.mimeTypes.includes(file.mimetype))
    return cb(uploadError(rule.rejectMessage));
  cb(null, true);
}

const registrationMulter = multer({
  storage: new CloudinaryStorage({
    cloudinary,
    params: registrationUploadParams,
  }),
  limits: { fileSize: MAX_FILE_SIZE, files: 2 },
  fileFilter: registrationFileFilter,
}).fields([
  { name: "idImage", maxCount: 1 },
  { name: "faceImage", maxCount: 1 },
]);

// Use this on the register route instead of upload.single('idImage').
// After it runs: req.files.idImage[0] and req.files.faceImage[0]
// (each has .path = the Cloudinary URL, .filename = the Cloudinary public id).
export function registrationUploads(req, res, next) {
  registrationMulter(req, res, (err) => {
    if (!err) return next();

    // Multer's own errors carry a `code`, not a `status`, so translate them.
    if (err instanceof multer.MulterError) {
      const messages = {
        LIMIT_FILE_SIZE: "Each file must be 5MB or smaller",
        LIMIT_FILE_COUNT: "Too many files were uploaded",
        LIMIT_UNEXPECTED_FILE: "Unexpected file field",
      };
      return next(uploadError(messages[err.code] || err.message));
    }

    // Cloudinary refused the file (for example it is not really an image).
    if (err.http_code && err.http_code < 500) {
      return next(
        uploadError(
          "The uploaded file could not be processed. Please try a different image.",
        ),
      );
    }

    next(err); // our own 400s from the filter, and anything unexpected
  });
}
