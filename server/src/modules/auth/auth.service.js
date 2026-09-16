import prisma from '../../config/db.js';
import { hashPassword, comparePassword } from '../../utils/password.js';
import { generateReferralCode } from '../../utils/referralCode.js';
import { signToken } from '../../utils/jwt.js';
import { sendWelcomeEmail } from '../../utils/email.js';

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
    throw new Error(
      'Default "member" role not found — run "npx prisma db seed" first'
    );
  }

  // Create user and role assignment together.
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

  // Email failure should not fail registration.
  sendWelcomeEmail(user.email, user.firstName).catch((err) =>
    console.error('Failed to send welcome email:', err.message)
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

export {
  registerUser,
  loginUser,
};