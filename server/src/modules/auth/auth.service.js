import prisma from '../../config/db.js';
import { hashPassword, comparePassword } from '../../utils/password.js';
import { generateReferralCode } from '../../utils/referralCode.js';
import { signToken, verifyToken } from '../../utils/jwt.js';
import { sendVerificationEmail } from '../../utils/email.js';

const PRIVACY_NOTICE_VERSION = 'v1.0-2026';

async function registerUser(
  { firstName, lastName, email, phone, password, referrerCode },
  idImageUrl
) {
  const existing = await prisma.user.findUnique({
    where: { email },
  });

  if (existing) {
    const err = new Error('An account with this email already exists');
    err.status = 409;
    throw err;
  }

  const hashedPassword = await hashPassword(password);
  const referralCode = generateReferralCode(firstName);

  // Self-registered users get the member role by default.
  const memberRole = await prisma.role.findUnique({
    where: { name: 'member' },
  });

  if (!memberRole) {
    const err = new Error(
      'Default "member" role not found — run "npx prisma db seed" first'
    );
    err.status = 500;
    throw err;
  }

  const user = await prisma.$transaction(async (tx) => {
    const created = await tx.user.create({
      data: {
        firstName,
        lastName,
        email,
        phone,
        password: hashedPassword,
        idImage: idImageUrl,
        referralCode,
        referrerCode: referrerCode || null,
        membershipStatus: 'BRONZE',
        privacyConsent: true,
        consentDate: new Date(),
        privacyNoticeVersion: PRIVACY_NOTICE_VERSION,
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
      purpose: 'email-verification',
    },
    '24h'
  );

  const clientUrl =
    process.env.CLIENT_URL || 'http://localhost:5173';

  const verifyUrl =
    `${clientUrl}/verify-email/${verificationToken}`;

  // Send verification email without blocking registration.
  sendVerificationEmail(
    user.email,
    user.firstName,
    verifyUrl
  ).catch((err) =>
    console.error(
      'Failed to send verification email:',
      err.message
    )
  );

  const { password: _pw, ...safeUser } = user;

  return safeUser;
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
    const err = new Error('Invalid email or password');
    err.status = 401;
    throw err;
  }

  const match = await comparePassword(password, user.password);

  if (!match) {
    const err = new Error('Invalid email or password');
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
    const error = new Error('Invalid or expired verification link');
    error.status = 400;
    throw error;
  }

  // Make sure this JWT is specifically an email-verification token.
  if (payload.purpose !== 'email-verification') {
    const err = new Error('Invalid verification token');
    err.status = 400;
    throw err;
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.id },
  });

  if (!user) {
    const err = new Error('User not found');
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

export {
  registerUser,
  loginUser,
  verifyEmail,
};