export const API_BASE = import.meta.env.VITE_API_BASE;
const USE_DIRECT = import.meta.env.VITE_USE_DIRECT === "true";

const ROUTE_MAP = {
  "/subscriptionContent": "/api/plans/GET/CORS/subscriptionContent.php",
  "/settings": "/api/plans/GET/CORS/settings.php",
  "/onboardingStatus": "/api/plans/POST/get-onboarding-status.php",
  "/onboarding": "/api/plans/POST/onboarding-welcome.php",
  "/onboardingSetPassword": "/api/plans/POST/onboarding-set-password.php",
  "/onboardingResendOtp": "/api/plans/POST/onboarding-resend-otp.php",
  "/onboardingVerifyOtp": "/api/plans/POST/onboarding-verify-otp.php",
  "/onboardingBusiness": "/api/plans/POST/onboarding-business.php",
  "/onboardingBusinessType": "/api/plans/POST/onboarding-business-type.php",
  "/onboardingTools": "/api/plans/POST/onboarding-tools.php",
  "/onboardingTeam": "/api/plans/POST/onboarding-team.php",
  "/onboardingZara": "/api/plans/POST/onboarding-zara.php",
  "/onboardingFinalize": "/api/plans/POST/onboarding-finalize.php",
  "/trialSignup": "/api/plans/POST/trial-signup.php",
  "/flutterwave": "/api/SECURE/flutterwave-key.php",
  "/subPlans": "/api/plans/POST/subPlans.php",
  "/verifyAccess": "/api/plans/POST/verifyAccess.php",
};

export async function apiFetch(path, options = {}) {
  try {
    const base = path.split("?")[0];
    const query = path.includes("?") ? "?" + path.split("?")[1] : "";
    const resolved = USE_DIRECT ? (ROUTE_MAP[base] ?? base) : base;

    const isFormData = options.body instanceof FormData;

    const res = await fetch(`${API_BASE}${resolved}${query}`, {
      ...options,
      headers: {
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
        ...(options.headers || {})
      }
    });

    if (!res.ok) return null;

    return await res.json();

  } catch (err) {
    return null;
  }
}