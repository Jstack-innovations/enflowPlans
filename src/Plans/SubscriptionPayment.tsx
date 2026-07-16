import { useEffect, useRef } from "react";
import { apiFetch } from "../Config/api";
import { useNavigate, useLocation } from "react-router-dom";
import "./Css/Subscription.css";

export default function SubscriptionPayment() {
  const location = useLocation();
  const navigate = useNavigate();
  const paymentStarted = useRef(false);

  const { amount, planTitle, formData } = location.state || {};

  if (!amount || !formData) {
    return <h2>Invalid Payment Session</h2>;
  }

  useEffect(() => {
 async function loadKeyAndScript() {
  const data = await apiFetch("/flutterwave");

  if (!data || !data.publicKey) {
    alert("Failed to load payment key");
    return;
  }

  const script = document.createElement("script");
  script.src = "https://checkout.flutterwave.com/v3.js";
  script.async = true;

  script.onload = () => {
    setTimeout(() => startPayment(data.publicKey), 500);
  };

  document.body.appendChild(script);
}

    loadKeyAndScript();
  }, []);

  function startPayment(key: string) {
    if (paymentStarted.current) return;
    paymentStarted.current = true;

    (window as any).FlutterwaveCheckout({
      public_key: key,
      tx_ref: "SUB_" + Date.now(),
      amount,
      currency: "NGN",
      payment_options: "card,banktransfer,ussd,account",
      customer: {
        email: formData.email,
        phone_number: formData.phone,
        name: formData.fullname,
      },
      customizations: {
  title: formData.businessName || "EnflowAI Subscription",
  description: planTitle,
},

      // ✅ No status check — send straight to backend just like confirmOrder
callback: async function (data: any) {
  paymentStarted.current = false;

  const result = await apiFetch("/subPlans", {
    method: "POST",
    body: JSON.stringify({
      ...formData,
      plan: planTitle,
      amount,
      transaction_id: data.transaction_id,
    }),
  });

  if (!result) {
    alert("Payment succeeded but activation failed. Contact support.");
    return;
  }

  if (result.status === "success") {
    localStorage.setItem(
      "subscriptionSuccess",
      JSON.stringify({
        planTitle,
        amount,
        formData,
        subscriptionCode: result.subscription_code,
        renewal_date: result.renewal_date,
        zara_credits: result.zara_credits,
      })
    );

    window.location.href = "/subscriptionSuccess";
  } else {
    alert(result.message || "Subscription activation failed");
  }
},

      onclose: function () {
        navigate("/", { replace: true });
      },
    });
  }

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff",
        flexDirection: "column",
      }}
    >
      <div className="loader"></div>
      <p style={{ marginTop: 20, fontSize: 16, color: "#333" }}>
        Initializing Payment...
      </p>
    </div>
  );
}
