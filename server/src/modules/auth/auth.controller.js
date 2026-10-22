import { validationResult } from "express-validator";
import {
  registerUser,
  loginUser,
  findReferrer,
  verifyEmail as verifyEmailService,
} from "./auth.service.js";
import cloudinary from "../../config/cloudinary.js";

// By the time the controller runs, Multer has ALREADY uploaded the photos to
// Cloudinary. If the registration then fails (bad form data, email already
// taken...), those uploads would be left behind as orphans, and the person's
// retry would upload the same photos a second time. So we delete them.
// Best effort: a failure here is logged but never changes the response.
async function discardUploads(files) {
  const uploaded = Object.values(files || {}).flat();
  await Promise.all(
    uploaded.map(async (file) => {
      try {
        await cloudinary.uploader.destroy(file.filename); // filename = Cloudinary public id
      } catch (err) {
        console.error(
          "Could not delete orphaned upload",
          file.filename,
          err.message,
        );
      }
    }),
  );
}

async function register(req, res, next) {
  const idImageUrl = req.files?.idImage?.[0]?.path ?? null; // optional, as before
  const faceImageUrl = req.files?.faceImage?.[0]?.path ?? null;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    await discardUploads(req.files);
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array(),
    });
  }

  // The form already blocks this, but anyone can call the API without the form.
  if (!faceImageUrl) {
    await discardUploads(req.files);
    return res.status(400).json({
      success: false,
      message: "A face photo is required",
      errors: [{ msg: "A face photo is required", path: "faceImage" }],
    });
  }

  let user;
  try {
    user = await authService.registerUser(req.body, idImageUrl, faceImageUrl);
  } catch (err) {
    // registerUser only throws BEFORE the account exists, so these uploads are unused.
    await discardUploads(req.files);
    return next(err);
  }

  res
    .status(201)
    .json({ success: true, message: "Account created", data: user });
}

async function login(req, res, next) {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { token, user } = await loginUser(req.body);

    res.json({
      success: true,
      data: {
        token,
        user,
      },
    });
  } catch (err) {
    next(err);
  }
}

async function me(req, res) {
  const { password, ...safeUser } = req.user;

  res.json({
    success: true,
    data: safeUser,
  });
}

async function verifyEmail(req, res, next) {
  try {
    const user = await verifyEmailService(req.params.token);

    res.json({
      success: true,
      message: "Email verified",
      data: user,
    });
  } catch (err) {
    next(err);
  }
}

async function getReferrer(req, res, next) {
  try {
    const referrer = await findReferrer(req.params.referralCode);

    res.json({
      success: true,
      data: referrer,
    });
  } catch (err) {
    next(err);
  }
}

export default {
  register,
  login,
  me,
  verifyEmail,
  getReferrer,
};
