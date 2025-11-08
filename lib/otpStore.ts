// Persistent in-memory OTP store for DEV (survives HMR)
// NOTE: For production, replace with Redis/Supabase to support multiple instances.
type OtpRecord = { hash: string; expiresAt: number; attempts: number };

interface GlobalWithOtpStore {
  __BOCC_OTP_STORE__?: Map<string, OtpRecord>;
}

const g = globalThis as GlobalWithOtpStore;
if (!g.__BOCC_OTP_STORE__) {
  g.__BOCC_OTP_STORE__ = new Map<string, OtpRecord>();
}

const otpMap: Map<string, OtpRecord> = g.__BOCC_OTP_STORE__;
export default otpMap;