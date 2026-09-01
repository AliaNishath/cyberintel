// Generates a 6-digit numeric OTP, e.g. "483920"
export function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// OTPs expire 5 minutes after being issued
export function otpExpiry() {
  return new Date(Date.now() + 5 * 60 * 1000);
}
