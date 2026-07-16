import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { apiFetch } from "../Config/api";

interface OnboardingUser {
  id: number;
  name: string;
  email: string;
  phone: string;
}

interface UseOnboardingSessionResult {
  user: OnboardingUser | null;
  plan: any;
  onboarding_token: string | null;
  loading: boolean;
}

const STEP_ROUTES: Record<number, string> = {
  1: "/onboarding",
  2: "/onboarding/step-2",
  3: "/onboarding/step-3",
  4: "/onboarding/step-4",
  5: "/onboarding/step-5",
  6: "/onboarding/step-6",
  7: "/onboarding/step-7",
  8: "/onboarding/step-8",
  9: "/onboarding/step-9",
};

export function useOnboardingSession(currentStep: number): UseOnboardingSessionResult {
  const navigate = useNavigate();
  const location = useLocation();

  const stateToken = location.state?.onboarding_token ?? null;
  const stateUser  = location.state?.user ?? null;
  const statePlan  = location.state?.plan ?? null;

  const [user, setUser]                        = useState<OnboardingUser | null>(stateUser);
  const [plan, setPlan]                        = useState<any>(statePlan);
  const [onboarding_token, setOnboardingToken] = useState<string | null>(stateToken);
  const [loading, setLoading]                  = useState<boolean>(true);

  useEffect(() => {
    const token = stateToken || localStorage.getItem("onboarding_token");

    if (!token) {
      navigate("/trial-signup", { replace: true });
      return;
    }

    apiFetch("/onboardingStatus", {
  method: "POST",
  body: JSON.stringify({ onboarding_token: token }),
})
  .then(data => {
    if (!data || data.status !== "ok") {
      localStorage.removeItem("onboarding_token");
      navigate("/trial-signup", { replace: true });
      return;
    }

    setUser(data.user);
    setPlan(data.plan);
    setOnboardingToken(token);

    const nextStep = (data.onboarding_step || 0) + 1;

    if (nextStep !== currentStep && STEP_ROUTES[nextStep]) {
      navigate(STEP_ROUTES[nextStep], {
        replace: true,
        state: { onboarding_token: token, user: data.user, plan: data.plan },
      });
      return;
    }

    setLoading(false);
  })
  .catch(() => {
    localStorage.removeItem("onboarding_token");
    navigate("/trial-signup", { replace: true });
  });
  }, [location.pathname]);

  return { user, plan, onboarding_token, loading };
}
