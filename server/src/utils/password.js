import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

async function hashPassword(plain) {
    return bcrypt.hash(plain, SALT_ROUNDS);
}

async function comparePassword(plain, hash) {
    return hash ? bcrypt.compare(plain, hash) : false;
}

export { hashPassword, comparePassword };