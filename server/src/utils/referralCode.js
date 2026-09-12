export function generateReferralCode(firstName = '') {
    const prefix = firstName.slice(0, 3).toUpperCase() || 'ESP';
    const random = Math.random().toString(36).slice(2, 8).toUpperCase();

    return `${prefix}-${random}`;
}