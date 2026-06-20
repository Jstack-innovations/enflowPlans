import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from "react-router-dom"

import './index.css'

import App from './App.tsx'


import TrialSignup from "./Plans/TrialSignup.tsx";
import CheckoutPage from "./Plans/CheckoutPage.tsx";
import SubscriptionPayment from "./Plans/SubscriptionPayment.tsx";
import SubscriptionSuccess from "./Plans/SubscriptionSuccess.tsx";


import OnboardingStep1 from "./Onboard/OnboardingStep1.tsx";
import OnboardingStep2 from "./Onboard/OnboardingStep2.tsx";
import OnboardingStep3 from "./Onboard/OnboardingStep3.tsx";
import OnboardingStep4 from "./Onboard/OnboardingStep4.tsx";
import OnboardingStep5 from "./Onboard/OnboardingStep5.tsx";
import OnboardingStep6 from "./Onboard/OnboardingStep6.tsx";
import OnboardingStep7 from "./Onboard/OnboardingStep7.tsx";
import OnboardingStep8 from "./Onboard/OnboardingStep8.tsx";
import OnboardingStep9 from "./Onboard/OnboardingStep9.tsx";








const root = document.getElementById("root");

if (root) {
  createRoot(root).render(
    <StrictMode>
      <BrowserRouter>
        <Routes>

          <Route path="/" element={<App />} />

          <Route path="/trial-signup" element={<TrialSignup />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/subscription-payment" element={<SubscriptionPayment />} />
          <Route path="/subscriptionSuccess" element={<SubscriptionSuccess />} />
          
          
          
        <Route path="/onboarding" element={<OnboardingStep1 />} />
          <Route path="/onboarding/step-2" element={<OnboardingStep2/>} />
               <Route path="/onboarding/step-3" element={<OnboardingStep3/>} />
               <Route path="/onboarding/step-4" element={<OnboardingStep4/>} />
                   <Route path="/onboarding/step-5" element={<OnboardingStep5/>} />
                                      <Route path="/onboarding/step-6" element={<OnboardingStep6/>} />
                                                                            <Route path="/onboarding/step-7" element={<OnboardingStep7/>} />
                                                                                          <Route path="/onboarding/step-8" element={<OnboardingStep8/>} />
                                                                                          <Route path="/onboarding/step-9" element={<OnboardingStep9/>} />

                                      

          
          
          
          

        </Routes>
      </BrowserRouter>
    </StrictMode>
  );
          }
