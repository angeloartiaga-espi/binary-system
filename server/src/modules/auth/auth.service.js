import prisma from "../../config/db.js";
import { hashPassword, comparePassword } from "../../utils/password.js";
import { generateReferralCode } from "../../utils/referralCode.js";
import { signToken, verifyToken } from "../../utils/jwt.js";
import { sendVerificationEmail } from "../../utils/email.js";

const PRIVACY_NOTICE_VERSION = "v1.0-2026";

async function registerUser(
  {
    firstName,
    middleName,
    lastName,
    email,
    phone,
    otherContact,
    city,
    country,
    birthdate,
    placeOfBirth,
    civilStatus,
    gender,
    taxIdentificationNumber,
    spouseName,
    password,
    referrerCode,
  },
  idImageUrl,
) {
  const existing = await prisma.user.findUnique({
    where: { email },
  });

  if (existing) {
    const err = new Error("An account with this email already exists");
    err.status = 409;
    throw err;
  }

  // Validate the referrer if a referral code was provided.
  let referrer = null;

  if (referrerCode) {
    referrer = await prisma.user.findUnique({
      where: {
        referralCode: referrerCode,
      },
      select: {
        id: true,
        firstName: true,
        middleName: true,
        lastName: true,
        referralCode: true,
      },
    });

    if (!referrer) {
      const err = new Error("Invalid referrer code");
      err.status = 400;
      throw err;
    }
  }

  const hashedPassword = await hashPassword(password);
  const referralCode = generateReferralCode(firstName);

  // Self-registered users get the member role by default.
  const memberRole = await prisma.role.findUnique({
    where: { name: "member" },
  });

  if (!memberRole) {
    const err = new Error(
      'Default "member" role not found — run "npx prisma db seed" first',
    );
    err.status = 500;
    throw err;
  }

  const user = await prisma.$transaction(async (tx) => {
    const created = await tx.user.create({
      data: {
        firstName,
        middleName,
        lastName,
        email,

        // Contact Information
        phone,
        otherContact,

        // Address
        city,
        country,

        // Personal Information
        birthdate: birthdate ? new Date(birthdate) : null,
        placeOfBirth,
        civilStatus,
        gender,

        // Tax Information
        taxIdentificationNumber,

        // Spouse Information
        spouseName,

        // Identification
        idImage: idImageUrl,

        // Referral
        referralCode,
        referrerCode: referrerCode || null,

        // Membership
        membershipStatus: "BRONZE",

        // Privacy
        privacyConsent: true,
        consentDate: new Date(),
        privacyNoticeVersion: PRIVACY_NOTICE_VERSION,

        // Account
        emailVerified: false,
      },
    });

    await tx.userRole.create({
      data: {
        userId: created.id,
        roleId: memberRole.id,
      },
    });

    return created;
  });

  // Create a short-lived JWT specifically for email verification.
  const verificationToken = signToken(
    {
      id: user.id,
      purpose: "email-verification",
    },
    "24h",
  );

  const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";

  const verifyUrl = `${clientUrl}/verify-email/${verificationToken}`;

  // Send verification email without blocking registration.
  sendVerificationEmail(user.email, user.firstName, verifyUrl).catch((err) =>
    console.error("Failed to send verification email:", err.message),
  );

  const { password: _pw, ...safeUser } = user;

  // Add referrer information to the response without storing it in User.
  return {
    ...safeUser,
    referrer: referrer
      ? {
          id: referrer.id,
          name: [referrer.firstName, referrer.middleName, referrer.lastName]
            .filter(Boolean)
            .join(" "),
          referralCode: referrer.referralCode,
        }
      : null,
  };
}

async function findReferrer(referralCode) {
  const cleanReferralCode = referralCode?.trim();

  if (!cleanReferralCode) {
    const err = new Error("Referral code is required");
    err.status = 400;
    throw err;
  }

  const referrer = await prisma.user.findUnique({
    where: {
      referralCode: cleanReferralCode,
    },
    select: {
      id: true,
      firstName: true,
      middleName: true,
      lastName: true,
      referralCode: true,
    },
  });

  if (!referrer) {
    const err = new Error("Referral code not found");
    err.status = 404;
    throw err;
  }

  return {
    id: referrer.id,
    name: [referrer.firstName, referrer.middleName, referrer.lastName]
      .filter(Boolean)
      .join(" "),
    referralCode: referrer.referralCode,
  };
}

async function loginUser({ email, password }) {
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      roles: {
        include: {
          role: {
            include: {
              permissions: {
                include: {
                  permission: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!user || !user.isActive) {
    const err = new Error("Invalid email or password");
    err.status = 401;
    throw err;
  }

  const match = await comparePassword(password, user.password);

  if (!match) {
    const err = new Error("Invalid email or password");
    err.status = 401;
    throw err;
  }

  const token = signToken({ id: user.id });

  const { password: _pw, ...safeUser } = user;

  return {
    token,
    user: safeUser,
  };
}

async function verifyEmail(token) {
  let payload;

  try {
    payload = verifyToken(token);
  } catch (err) {
    const error = new Error("Invalid or expired verification link");
    error.status = 400;
    throw error;
  }

  // Make sure this JWT is specifically an email-verification token.
  if (payload.purpose !== "email-verification") {
    const err = new Error("Invalid verification token");
    err.status = 400;
    throw err;
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.id },
  });

  if (!user) {
    const err = new Error("User not found");
    err.status = 404;
    throw err;
  }

  if (user.emailVerified) {
    return {
      id: user.id,
      email: user.email,
      emailVerified: true,
    };
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerified: true,
    },
  });

  const { password: _pw, ...safeUser } = updated;

  return safeUser;
}

export { registerUser, findReferrer, loginUser, verifyEmail };
