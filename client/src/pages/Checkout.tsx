// import { useState } from "react";
// import { useNavigate, Link } from "react-router-dom";
// import Shell from "@/components/layout/Shell";
// import { useApp } from "@/context/AppContext";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
// import { Smartphone, CreditCard, Building2, Wallet } from "lucide-react";
// import type { PaymentMethod } from "@/lib/types";
// import { toast } from "sonner";

// const PAYMENT_OPTIONS: { id: PaymentMethod; label: string; icon: React.ComponentType<{ className?: string }>; desc: string }[] = [
//   { id: "UPI", label: "UPI", icon: Smartphone, desc: "Pay instantly with any UPI app" },
//   { id: "Card", label: "Card", icon: CreditCard, desc: "Credit or debit card" },
//   { id: "Net Banking", label: "Net Banking", icon: Building2, desc: "All major Indian banks" },
//   { id: "Cash on Delivery", label: "Cash on Delivery", icon: Wallet, desc: "Pay when your order arrives" },
// ];

// export default function Checkout() {
//   const { user, cart, placeOrder } = useApp();
//   const navigate = useNavigate();
//   const [step, setStep] = useState<"address" | "payment">("address");
//   const [form, setForm] = useState({
//     fullName: user?.name || "",
//     street: "12 Glade Lane",
//     city: "Portland",
//     state: "OR",
//     zip: "97201",
//     phone: "555-0142",
//   });
//   const [payment, setPayment] = useState<PaymentMethod>("UPI");
//   const [paymentDetails, setPaymentDetails] = useState({
//     upi: "yourname@bank",
//     cardNumber: "4111 1111 1111 1111",
//     cardName: user?.name || "",
//     cardExpiry: "12/28",
//     cardCvv: "***",
//     bank: "HDFC Bank",
//   });

//   if (!user) {
//     return <Shell><div className="container py-20 text-center"><Button asChild><Link to="/auth">Sign in</Link></Button></div></Shell>;
//   }
//   if (!cart.length) {
//     return <Shell><div className="container py-20 text-center"><Button asChild><Link to="/">Add items first</Link></Button></div></Shell>;
//   }

//   const submitAddress = (e: React.FormEvent) => {
//     e.preventDefault();
//     setStep("payment");
//   };

//   const placeFinal = () => {
//     let details = "";
//     if (payment === "UPI") details = `UPI: ${paymentDetails.upi}`;
//     else if (payment === "Card") details = `Card ending ${paymentDetails.cardNumber.slice(-4)}`;
//     else if (payment === "Net Banking") details = `Bank: ${paymentDetails.bank}`;
//     else details = "Cash on Delivery";

//     if (payment === "UPI" && !paymentDetails.upi.includes("@")) { toast.error("Enter a valid UPI ID"); return; }
//     if (payment === "Card" && paymentDetails.cardNumber.replace(/\s/g, "").length < 12) { toast.error("Enter a valid card"); return; }

//     const order = placeOrder(form, payment, details);
//     if (order) navigate(`/orders/${order.id}`);
//   };

//   return (
//     <Shell>
//       <div className="container py-6 md:py-10 max-w-2xl">
//         <div className="flex items-center gap-2 mb-6 text-[11px] sm:text-xs">
//           <span className={`px-2.5 sm:px-3 py-1 rounded-full font-bold whitespace-nowrap ${step === "address" ? "bg-primary text-primary-foreground" : "bg-success/20 text-success"}`}>1. Address</span>
//           <span className="h-px flex-1 bg-border" />
//           <span className={`px-2.5 sm:px-3 py-1 rounded-full font-bold whitespace-nowrap ${step === "payment" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>2. Payment</span>
//         </div>
//         <h1 className="text-2xl md:text-3xl font-bold mb-2">Checkout</h1>
//         <p className="text-sm text-muted-foreground mb-6 md:mb-8">
//           {step === "address" ? "Where should we send your order?" : "How would you like to pay?"}
//         </p>

//         {step === "address" && (
//           <form onSubmit={submitAddress} className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-soft">
//             <div>
//               <Label>Full name (locked to profile)</Label>
//               <Input value={user.name} disabled className="mt-1.5 bg-muted/40" />
//             </div>
//             <div>
//               <Label>Street address</Label>
//               <Input value={form.street} onChange={(e) => setForm({ ...form, street: e.target.value })} required className="mt-1.5" />
//             </div>
//             <div className="grid grid-cols-3 gap-3">
//               <div><Label>City</Label><Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} required className="mt-1.5" /></div>
//               <div><Label>State</Label><Input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} required className="mt-1.5" /></div>
//               <div><Label>ZIP</Label><Input value={form.zip} onChange={(e) => setForm({ ...form, zip: e.target.value })} required className="mt-1.5" /></div>
//             </div>
//             <div><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required className="mt-1.5" /></div>
//             <Button type="submit" variant="hero" size="lg" className="w-full">Continue to payment →</Button>
//           </form>
//         )}

//         {step === "payment" && (
//           <div className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-soft">
//             <RadioGroup value={payment} onValueChange={(v) => setPayment(v as PaymentMethod)} className="space-y-2">
//               {PAYMENT_OPTIONS.map(({ id, label, icon: Icon, desc }) => (
//                 <label key={id} htmlFor={id}
//                   className={`flex items-center gap-4 rounded-xl border p-4 cursor-pointer transition-smooth ${
//                     payment === id ? "border-primary bg-primary-soft" : "border-border hover:bg-muted/50"
//                   }`}>
//                   <RadioGroupItem value={id} id={id} />
//                   <Icon className={`h-5 w-5 ${payment === id ? "text-primary" : "text-muted-foreground"}`} />
//                   <div className="flex-1">
//                     <p className="font-semibold text-sm">{label}</p>
//                     <p className="text-xs text-muted-foreground">{desc}</p>
//                   </div>
//                 </label>
//               ))}
//             </RadioGroup>

//             {/* Conditional fields */}
//             <div className="rounded-xl bg-muted/40 p-4 space-y-3">
//               {payment === "UPI" && (
//                 <div>
//                   <Label>UPI ID</Label>
//                   <Input value={paymentDetails.upi} onChange={(e) => setPaymentDetails({ ...paymentDetails, upi: e.target.value })}
//                     className="mt-1.5" placeholder="yourname@bank" />
//                 </div>
//               )}
//               {payment === "Card" && (
//                 <>
//                   <div>
//                     <Label>Card number</Label>
//                     <Input value={paymentDetails.cardNumber} onChange={(e) => setPaymentDetails({ ...paymentDetails, cardNumber: e.target.value })} className="mt-1.5 font-mono" />
//                   </div>
//                   <div className="grid grid-cols-3 gap-3">
//                     <div className="col-span-2"><Label>Name on card</Label><Input value={paymentDetails.cardName} onChange={(e) => setPaymentDetails({ ...paymentDetails, cardName: e.target.value })} className="mt-1.5" /></div>
//                     <div><Label>Expiry</Label><Input value={paymentDetails.cardExpiry} onChange={(e) => setPaymentDetails({ ...paymentDetails, cardExpiry: e.target.value })} className="mt-1.5" placeholder="MM/YY" /></div>
//                   </div>
//                 </>
//               )}
//               {payment === "Net Banking" && (
//                 <div>
//                   <Label>Bank</Label>
//                   <select value={paymentDetails.bank}
//                     onChange={(e) => setPaymentDetails({ ...paymentDetails, bank: e.target.value })}
//                     className="w-full mt-1.5 rounded-lg border border-input bg-background h-10 px-3 text-sm">
//                     {["HDFC Bank", "ICICI Bank", "SBI", "Axis Bank", "Kotak Mahindra"].map(b => <option key={b}>{b}</option>)}
//                   </select>
//                 </div>
//               )}
//               {payment === "Cash on Delivery" && (
//                 <p className="text-xs text-muted-foreground">You'll pay in cash when the courier delivers your order.</p>
//               )}
//             </div>

//             <div className="flex gap-2 pt-2">
//               <Button type="button" variant="outline" onClick={() => setStep("address")} className="flex-1">← Back</Button>
//               <Button type="button" variant="hero" size="lg" onClick={placeFinal} className="flex-1">Place order</Button>
//             </div>
//           </div>
//         )}
//       </div>
//     </Shell>
//   );
// }

import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import Shell from "@/components/layout/Shell";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Smartphone,
  CreditCard,
  Wallet,
  X,
  Check,
  Copy,
  RefreshCw,
  CheckCircle2,
  Clock,
  QrCode,
  Hash,
  Shield,
} from "lucide-react";
import type { PaymentMethod } from "@/lib/types";
import { toast } from "sonner";
import QRCode from "qrcode";

// ─── Environment ────────────────────────────────────────────────────────────
const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID;
const BASE_URL =
  typeof window !== "undefined"
    ? window.location.origin
    : "https://aislemind.com";

declare global {
  interface Window {
    Razorpay: any;
  }
}

// ─── Payment options (Net Banking removed) ───────────────────────────────────
const PAYMENT_OPTIONS: {
  id: PaymentMethod;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  desc: string;
}[] = [
  {
    id: "UPI",
    label: "UPI",
    icon: Smartphone,
    desc: "Google Pay, PhonePe, Paytm & more",
  },
  {
    id: "Card",
    label: "Credit / Debit Card",
    icon: CreditCard,
    desc: "Visa, Mastercard, RuPay — secured by Razorpay",
  },
  {
    id: "Cash on Delivery",
    label: "Cash on Delivery",
    icon: Wallet,
    desc: "Pay when your order arrives",
  },
];

// ─── UPI App Logos ────────────────────────────────────────────────────────────
function GPayLogo({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="10" fill="white" />
      <rect width="40" height="40" rx="10" stroke="#E8EAED" strokeWidth="1" />
      <path
        d="M30 20.23c0-.68-.06-1.34-.17-1.96H20v3.7h5.59a4.78 4.78 0 01-2.07 3.14v2.61h3.35C28.9 26.14 30 23.4 30 20.23z"
        fill="#4285F4"
      />
      <path
        d="M20 31c2.79 0 5.13-.92 6.84-2.5l-3.34-2.6c-.93.62-2.11.99-3.5.99-2.69 0-4.97-1.82-5.78-4.26h-3.46v2.69A10.33 10.33 0 0020 31z"
        fill="#34A853"
      />
      <path
        d="M14.22 22.63A6.2 6.2 0 0113.86 20c0-.91.16-1.78.36-2.63v-2.69H10.7A10.33 10.33 0 0010 20c0 1.65.4 3.2 1.1 4.58l3.12-1.95z"
        fill="#FBBC05"
      />
      <path
        d="M20 13.73c1.52 0 2.88.52 3.95 1.55l2.96-2.96A10.33 10.33 0 0020 9.67C16.3 9.67 13.1 11.8 11.56 14.9l3.47 2.69C15.73 15.5 17.72 13.73 20 13.73z"
        fill="#EA4335"
      />
      <text
        x="20"
        y="36"
        textAnchor="middle"
        fontFamily="'Product Sans', Arial"
        fontWeight="700"
        fontSize="5.5"
        fill="#4285F4"
      >
        Pay
      </text>
    </svg>
  );
}

function PhonePeLogo({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="10" fill="#5F259F" />
      <rect
        x="13"
        y="8"
        width="14"
        height="22"
        rx="2.5"
        stroke="white"
        strokeWidth="1.8"
        fill="none"
      />
      <path
        d="M17 13h3.5c1.4 0 2.5.9 2.5 2s-1.1 2-2.5 2H19v3h-2V13z"
        fill="white"
      />
      <path
        d="M19 14.2v2.6h1.3c.75 0 1.35-.47 1.35-1.3s-.6-1.3-1.35-1.3H19z"
        fill="#5F259F"
      />
      <circle cx="20" cy="27" r="1" fill="white" />
    </svg>
  );
}

function PaytmLogo({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="10" fill="white" />
      <rect width="40" height="40" rx="10" stroke="#E8EAED" strokeWidth="1" />
      <rect x="8" y="8" width="11" height="11" rx="2" fill="#00BAF2" />
      <text
        x="7"
        y="30"
        fontFamily="Arial, sans-serif"
        fontWeight="900"
        fontSize="7.5"
        fill="#00BAF2"
      >
        paytm
      </text>
      <circle cx="33" cy="11" r="4" fill="#00BAF2" fillOpacity="0.15" />
    </svg>
  );
}

function BhimLogo({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="10" fill="#00805A" />
      <circle
        cx="20"
        cy="16"
        r="7"
        stroke="white"
        strokeWidth="1.5"
        fill="none"
      />
      <circle cx="20" cy="16" r="2" fill="white" />
      {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
        <line
          key={deg}
          x1="20"
          y1="16"
          x2={20 + 5 * Math.cos((deg * Math.PI) / 180)}
          y2={16 + 5 * Math.sin((deg * Math.PI) / 180)}
          stroke="white"
          strokeWidth="0.7"
        />
      ))}
      <text
        x="20"
        y="32"
        textAnchor="middle"
        fontFamily="Arial, sans-serif"
        fontWeight="900"
        fontSize="7"
        fill="white"
        letterSpacing="0.5"
      >
        BHIM
      </text>
    </svg>
  );
}

// ─── UPI Payment Dialog ───────────────────────────────────────────────────────
interface UpiDialogProps {
  amount: number;
  orderInfo: {
    items: { name: string; qty: number; price: number }[];
    subtotal: number;
    tax: number;
    shipping: number;
  };
  onSuccess: () => void;
  onClose: () => void;
}

function UpiPaymentDialog({
  amount,
  orderInfo,
  onSuccess,
  onClose,
}: UpiDialogProps) {
  const [tab, setTab] = useState<"qr" | "upi">("qr");
  const [upiId, setUpiId] = useState("");
  const [upiError, setUpiError] = useState("");
  const [paymentState, setPaymentState] = useState<
    "idle" | "waiting" | "success"
  >("idle");
  const [countdown, setCountdown] = useState(300);
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [token, setToken] = useState<string>("");
  const [sessionReady, setSessionReady] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const mockUpiId = "aislemind@ybl";
  const mockMerchantName = "AisleMind";

  // Initiate UPI session on backend
  useEffect(() => {
    fetch(`${BACKEND_URL}/upi-initiate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount, merchant: mockMerchantName }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.token) {
          setToken(data.token);
          setSessionReady(true);
        } else {
          toast.error("Could not start UPI session. Try again.");
          onClose();
        }
      })
      .catch(() => {
        toast.error("Server unreachable. Check your connection.");
        onClose();
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Build verify URL (the QR encodes this link; scanning it confirms payment on the backend)
  const verifyUrl = token
    ? `${BASE_URL}/upi-verify?token=${token}&amount=${amount}&to=${encodeURIComponent(mockUpiId)}&merchant=${encodeURIComponent(mockMerchantName)}`
    : "";

  // Generate QR code image
  useEffect(() => {
    if (!verifyUrl) return;
    QRCode.toDataURL(verifyUrl, {
      width: 220,
      margin: 2,
      color: { dark: "#0f172a", light: "#ffffff" },
      errorCorrectionLevel: "H",
    })
      .then(setQrDataUrl)
      .catch(console.error);
  }, [verifyUrl]);

  // Countdown timer
  useEffect(() => {
    if (paymentState !== "idle" || !sessionReady) return;
    timerRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(timerRef.current!);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current!);
  }, [paymentState, sessionReady]);

  // Poll backend every 2s to check if QR was scanned / verified
  useEffect(() => {
    if (paymentState !== "idle" || !token) return;
    pollRef.current = setInterval(() => {
      fetch(`${BACKEND_URL}/upi-check?token=${token}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.verified) {
            clearInterval(pollRef.current!);
            doSuccess();
          }
        })
        .catch(() => {});
    }, 2000);
    return () => clearInterval(pollRef.current!);
  }, [token, paymentState]); // eslint-disable-line react-hooks/exhaustive-deps

  const doSuccess = useCallback(() => {
    setPaymentState("success");
    setTimeout(onSuccess, 1800);
  }, [onSuccess]);

  const simulateQrScan = () => {
    setPaymentState("waiting");
    setTimeout(() => doSuccess(), 2000);
  };

  const handleUpiPay = () => {
    const upiRegex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;
    if (!upiRegex.test(upiId)) {
      setUpiError("Enter a valid UPI ID (e.g. yourname@okaxis)");
      return;
    }
    setUpiError("");
    setPaymentState("waiting");
    setTimeout(() => doSuccess(), 2000);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(mockUpiId).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const minutes = String(Math.floor(countdown / 60)).padStart(2, "0");
  const seconds = String(countdown % 60).padStart(2, "0");

  const upiApps = [
    { name: "GPay", Logo: GPayLogo, handle: "@okicici" },
    { name: "PhonePe", Logo: PhonePeLogo, handle: "@ybl" },
    { name: "Paytm", Logo: PaytmLogo, handle: "@paytm" },
    { name: "BHIM", Logo: BhimLogo, handle: "@upi" },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        backgroundColor: "rgba(0,0,0,0.72)",
        backdropFilter: "blur(8px)",
      }}
    >
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full overflow-hidden"
        style={{
          maxWidth: 420,
          fontFamily: "'Segoe UI', system-ui, sans-serif",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center px-5 py-3.5"
          style={{
            background:
              "linear-gradient(135deg,#072654 0%,#1e40af 60%,#1d4ed8 100%)",
          }}
        >
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-white/15 backdrop-blur flex items-center justify-center">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <polygon
                  points="13,2 3,14 12,14 11,22 21,10 12,10"
                  fill="white"
                />
              </svg>
            </div>
            <div>
              <p className="text-[9px] text-white/50 uppercase tracking-wider leading-none">
                Secured by
              </p>
              <p className="text-xs font-bold text-white leading-tight">
                Razorpay
              </p>
            </div>
          </div>

          <div className="flex-1 text-center">
            <p className="text-[10px] text-white/60">Paying to</p>
            <p className="text-sm font-bold text-white">{mockMerchantName}</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-[9px] text-white/60 leading-none">Total</p>
              <p className="text-base font-black text-white">
                ₹{amount.toLocaleString("en-IN")}
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Order summary strip */}
        <div className="bg-slate-50 border-b border-slate-100 px-5 py-2.5">
          <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1.5">
            Order Summary
          </p>
          <div className="space-y-1 max-h-20 overflow-auto">
            {orderInfo.items.map((item, idx) => (
              <div
                key={idx}
                className="flex justify-between text-xs text-slate-600"
              >
                <span className="truncate max-w-[200px]">
                  {item.name}{" "}
                  <span className="text-slate-400">×{item.qty}</span>
                </span>
                <span className="font-semibold ml-2">
                  ₹
                  {(item.price * item.qty).toLocaleString("en-IN", {
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
            ))}
          </div>
          <div className="flex justify-between text-[11px] text-slate-500 mt-1.5 pt-1.5 border-t border-slate-200">
            <span>Subtotal · Tax · Shipping</span>
            <span className="font-semibold text-slate-700">
              ₹{amount.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* QR / UPI ID tabs */}
        <div className="flex border-b border-gray-100 bg-gray-50/80">
          {(["qr", "upi"] as const).map((id) => (
            <button
              key={id}
              onClick={() => {
                if (paymentState === "idle") setTab(id);
              }}
              disabled={paymentState !== "idle"}
              className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-[13px] font-semibold border-b-2 transition-all ${
                tab === id
                  ? "border-blue-600 text-blue-700 bg-white"
                  : "border-transparent text-gray-400 hover:text-gray-600"
              }`}
            >
              {id === "qr" ? (
                <QrCode className="w-4 h-4" />
              ) : (
                <Hash className="w-4 h-4" />
              )}
              {id === "qr" ? "QR Code" : "UPI ID"}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="px-5 py-5 min-h-[320px]">
          {/* SUCCESS */}
          {paymentState === "success" && (
            <div className="flex flex-col items-center py-8 gap-3">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center border-2 border-emerald-100">
                  <CheckCircle2 className="w-11 h-11 text-emerald-500" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center shadow-md">
                  <Check className="w-4 h-4 text-white" strokeWidth={3} />
                </div>
              </div>
              <div className="text-center">
                <p className="font-bold text-gray-800 text-xl">
                  Payment Verified!
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  Completing your order…
                </p>
              </div>
              <div className="w-48 h-1.5 bg-gray-100 rounded-full overflow-hidden mt-2">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ animation: "fillbar 1.8s linear forwards" }}
                />
              </div>
              <style>{`@keyframes fillbar{from{width:0%}to{width:100%}}`}</style>
            </div>
          )}

          {/* WAITING */}
          {paymentState === "waiting" && (
            <div className="flex flex-col items-center py-8 gap-5">
              <div className="relative w-20 h-20">
                <svg
                  className="w-20 h-20"
                  viewBox="0 0 80 80"
                  style={{ animation: "rotateSvg 2s linear infinite" }}
                >
                  <circle
                    cx="40"
                    cy="40"
                    r="34"
                    stroke="#DBEAFE"
                    strokeWidth="6"
                    fill="none"
                  />
                  <circle
                    cx="40"
                    cy="40"
                    r="34"
                    stroke="#2563EB"
                    strokeWidth="6"
                    fill="none"
                    strokeDasharray="60 153"
                    strokeLinecap="round"
                  />
                </svg>
                <style>{`@keyframes rotateSvg{to{transform:rotate(360deg)}}`}</style>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Smartphone className="w-8 h-8 text-blue-600" />
                </div>
              </div>
              <div className="text-center">
                <p className="font-bold text-gray-800 text-lg">
                  Waiting for confirmation
                </p>
                <p className="text-sm text-gray-400 mt-1 max-w-[260px] mx-auto leading-relaxed">
                  Approve the payment in your UPI app.
                  <br />
                  This page updates automatically.
                </p>
              </div>
              <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse flex-shrink-0" />
                <span className="text-xs text-amber-700 font-semibold">
                  Listening for payment signal…
                </span>
              </div>
            </div>
          )}

          {/* QR TAB */}
          {paymentState === "idle" && tab === "qr" && (
            <div className="flex flex-col items-center gap-4">
              <div className="flex gap-3 items-end">
                {upiApps.map(({ name, Logo }) => (
                  <div key={name} className="flex flex-col items-center gap-1">
                    <Logo size={34} />
                    <span className="text-[10px] text-gray-500">{name}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-400 font-medium">
                Open any UPI app · Scan QR · Pay
              </p>

              <div className="relative">
                <div
                  className={`p-3 rounded-2xl border-2 shadow-sm transition-all ${countdown === 0 ? "border-red-200 opacity-40 grayscale" : "border-slate-200 hover:border-blue-200"}`}
                >
                  {qrDataUrl ? (
                    <div className="relative inline-block">
                      <img
                        src={qrDataUrl}
                        alt="Scan to pay via UPI"
                        width={200}
                        height={200}
                        className="block rounded-lg"
                        draggable={false}
                        style={{ userSelect: "none" }}
                      />
                      <div
                        className="absolute flex items-center justify-center rounded-lg bg-white shadow-md"
                        style={{
                          top: "50%",
                          left: "50%",
                          transform: "translate(-50%,-50%)",
                          width: 38,
                          height: 38,
                          padding: 2,
                        }}
                      >
                        <svg
                          width="34"
                          height="34"
                          viewBox="0 0 34 34"
                          fill="none"
                        >
                          <rect width="34" height="34" rx="6" fill="#097939" />
                          <text
                            x="17"
                            y="22"
                            textAnchor="middle"
                            fontFamily="Arial"
                            fontWeight="900"
                            fontSize="10"
                            fill="white"
                          >
                            UPI
                          </text>
                        </svg>
                      </div>
                    </div>
                  ) : (
                    <div className="w-[200px] h-[200px] flex flex-col items-center justify-center bg-gray-50 rounded-lg gap-2">
                      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                      <p className="text-[10px] text-gray-400">
                        {!sessionReady
                          ? "Connecting to server…"
                          : "Generating QR…"}
                      </p>
                    </div>
                  )}
                </div>

                {countdown > 0 && (
                  <div className="absolute top-2 right-2 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] text-emerald-700 font-medium">
                      Live
                    </span>
                  </div>
                )}

                {countdown === 0 && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-2xl bg-white/90 backdrop-blur-sm">
                    <p className="text-sm font-bold text-red-500">QR Expired</p>
                    <button
                      onClick={() => setCountdown(300)}
                      className="flex items-center gap-1.5 text-xs text-blue-600 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-full hover:bg-blue-100 font-semibold"
                    >
                      <RefreshCw className="w-3 h-3" /> Refresh QR
                    </button>
                  </div>
                )}
              </div>

              {countdown > 0 && (
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <Clock className="w-3.5 h-3.5" />
                  Expires in{" "}
                  <span className="font-mono font-bold text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded-md">
                    {minutes}:{seconds}
                  </span>
                </div>
              )}

              <div className="w-full flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5">
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-gray-400 leading-none mb-0.5">
                    Merchant UPI ID
                  </p>
                  <p className="text-sm font-bold text-gray-800 truncate">
                    {mockUpiId}
                  </p>
                </div>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition-all flex-shrink-0"
                  style={{
                    background: copied ? "#f0fdf4" : "#eff6ff",
                    borderColor: copied ? "#bbf7d0" : "#bfdbfe",
                    color: copied ? "#16a34a" : "#2563eb",
                  }}
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>

              <button
                onClick={simulateQrScan}
                disabled={countdown === 0 || !sessionReady}
                className="w-full py-3 rounded-xl text-sm font-bold text-white disabled:opacity-40 transition-all hover:opacity-90 active:scale-[0.98]"
                style={{
                  background: "linear-gradient(135deg,#1d4ed8,#072654)",
                  boxShadow: "0 6px 24px rgba(29,78,216,0.4)",
                }}
              >
                ✓ I've scanned &amp; approved in my UPI app
              </button>

              <p className="text-[11px] text-gray-400 text-center">
                Scan QR with your phone → tap the link → page auto-confirms
                payment
              </p>
            </div>
          )}

          {/* UPI ID TAB */}
          {paymentState === "idle" && tab === "upi" && (
            <div className="flex flex-col gap-4">
              <p className="text-sm text-gray-500 leading-relaxed">
                Choose your UPI app or type your UPI ID to receive a payment
                request.
              </p>

              <div className="grid grid-cols-4 gap-2">
                {upiApps.map(({ name, Logo, handle }) => (
                  <button
                    key={name}
                    onClick={() => {
                      setUpiId(`yourname${handle}`);
                      setUpiError("");
                    }}
                    className="flex flex-col items-center gap-1.5 p-2 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all group"
                  >
                    <Logo size={32} />
                    <span className="text-[10px] text-gray-500 group-hover:text-blue-600 font-medium transition-colors">
                      {name}
                    </span>
                  </button>
                ))}
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 mb-1.5 block uppercase tracking-wider">
                  UPI ID / VPA
                </label>
                <div
                  className={`flex items-center rounded-xl border-2 overflow-hidden transition-all ${upiError ? "border-red-400 bg-red-50" : "border-gray-200 focus-within:border-blue-500 bg-gray-50 focus-within:bg-white"}`}
                >
                  <span className="pl-3 pr-1 text-gray-400 font-bold text-base select-none">
                    @
                  </span>
                  <input
                    value={upiId}
                    onChange={(e) => {
                      setUpiId(e.target.value);
                      setUpiError("");
                    }}
                    placeholder="yourname@okaxis"
                    className="flex-1 h-12 text-sm bg-transparent outline-none text-gray-800 pr-2 font-medium"
                  />
                  {upiId && (
                    <button
                      onClick={() => setUpiId("")}
                      className="pr-3 text-gray-300 hover:text-gray-500 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                {upiError && (
                  <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1 font-medium">
                    ⚠ {upiError}
                  </p>
                )}
                <p className="text-[10px] text-gray-400 mt-1.5">
                  e.g. 9876543210@paytm · name@oksbi · user@ybl
                </p>
              </div>

              <button
                onClick={handleUpiPay}
                className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 active:scale-[0.98]"
                style={{
                  background: "linear-gradient(135deg,#1d4ed8,#072654)",
                  boxShadow: "0 6px 24px rgba(29,78,216,0.4)",
                }}
              >
                Send Payment Request · ₹{amount.toLocaleString("en-IN")}
              </button>

              <p className="text-[10px] text-gray-400 text-center leading-relaxed">
                A collect request will appear on your UPI app.
                <br />
                Approve it within 5 minutes to complete payment.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 bg-gray-50/80 px-5 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-[10px] text-gray-500 font-medium">
              256-bit SSL · PCI-DSS Compliant
            </span>
          </div>
          <div className="flex items-center gap-2">
            <svg width="30" height="14" viewBox="0 0 30 14" fill="none">
              <rect width="30" height="14" rx="2.5" fill="#097939" />
              <text
                x="15"
                y="10"
                textAnchor="middle"
                fontFamily="Arial"
                fontWeight="900"
                fontSize="7.5"
                fill="white"
              >
                UPI
              </text>
            </svg>
            <svg width="32" height="14" viewBox="0 0 32 14" fill="none">
              <rect width="32" height="14" rx="2.5" fill="#072654" />
              <text
                x="16"
                y="10"
                textAnchor="middle"
                fontFamily="Arial"
                fontWeight="700"
                fontSize="6.5"
                fill="white"
              >
                Razorpay
              </text>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Checkout Page ───────────────────────────────────────────────────────
export default function Checkout() {
  const { user, cart, products, placeOrder } = useApp();
  const navigate = useNavigate();
  const [step, setStep] = useState<"address" | "payment">("address");
  const [form, setForm] = useState({
    fullName: user?.name || "",
    street: "",
    city: "",
    state: "",
    zip: "",
    phone: "",
  });
  const [payment, setPayment] = useState<PaymentMethod>("UPI");
  const [processing, setProcessing] = useState(false);
  const [showUpiDialog, setShowUpiDialog] = useState(false);

  // Load Razorpay script once
  useEffect(() => {
    if (document.getElementById("razorpay-script")) return;
    const script = document.createElement("script");
    script.id = "razorpay-script";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.head.appendChild(script);
  }, []);

  // ── Guards ────────────────────────────────────────────────────────────────
  if (!user) {
    return (
      <Shell>
        <div className="container py-20 text-center">
          <Button asChild>
            <Link to="/auth">Sign in to continue</Link>
          </Button>
        </div>
      </Shell>
    );
  }
  if (!cart.length) {
    return (
      <Shell>
        <div className="container py-20 text-center">
          <Button asChild>
            <Link to="/">Add items first</Link>
          </Button>
        </div>
      </Shell>
    );
  }

  // ── Order totals (mirrors AppContext.placeOrder formula) ──────────────────
  const cartWithProducts = cart.map((ci) => {
    const p = products.find((x) => x.id === ci.productId)!;
    const finalPrice = p?.discount
      ? p.price * (1 - p.discount / 100)
      : (p?.price ?? 0);
    return {
      ...ci,
      product: p,
      finalPrice: Math.round(finalPrice * 100) / 100,
    };
  });
  const subtotal = cartWithProducts.reduce(
    (s, i) => s + i.finalPrice * i.qty,
    0,
  );
  const tax = Math.round(subtotal * 0.08 * 100) / 100;
  const shipping = subtotal > 100 ? 0 : 9.99;
  const total = Math.round((subtotal + tax + shipping) * 100) / 100;

  const orderInfoForDialog = {
    items: cartWithProducts.map((i) => ({
      name: i.product?.name ?? "Product",
      qty: i.qty,
      price: i.finalPrice,
    })),
    subtotal,
    tax,
    shipping,
  };

  // ── Step: address form ────────────────────────────────────────────────────
  const submitAddress = (e: React.FormEvent) => {
    e.preventDefault();
    setStep("payment");
  };

  // ── Razorpay card payment ─────────────────────────────────────────────────
  const handleRazorpayPayment = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: total,
          currency: "INR",
          receipt: `receipt_${Date.now().toString().slice(-6)}`,
        }),
      });
      const orderData = await res.json();
      if (!orderData.success) throw new Error("Order creation failed");

      const options = {
        key: RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "AisleMind",
        description: `Payment for ${cartWithProducts.length} item(s)`,
        order_id: orderData.orderId,
        handler: async (response: any) => {
          const verifyRes = await fetch(`${BACKEND_URL}/verify`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });
          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            const details = `Razorpay payment ID: ${response.razorpay_payment_id}`;
            const order = placeOrder(form, "Card", details);
            toast.success("Payment Successful!");
            if (order) navigate(`/orders/${order.id}`);
          } else {
            toast.error("Payment verification failed. Please contact support.");
            setProcessing(false);
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
        },
        notes: {
          order_items: cartWithProducts
            .map((i) => `${i.product?.name ?? "item"} x${i.qty}`)
            .join(", "),
          shipping_address: `${form.street}, ${form.city}, ${form.state} ${form.zip}`,
        },
        theme: { color: "#0F172A" },
        modal: {
          ondismiss: () => setProcessing(false),
        },
      };

      new window.Razorpay(options).open();
    } catch (error) {
      console.error(error);
      toast.error("Could not initiate payment. Try again.");
      setProcessing(false);
    }
  };

  // ── UPI success callback ──────────────────────────────────────────────────
  const handleUpiSuccess = () => {
    setShowUpiDialog(false);
    const order = placeOrder(
      form,
      "UPI",
      `UPI · ${new Date().toLocaleString()}`,
    );
    toast.success("UPI Payment Successful!");
    if (order) navigate(`/orders/${order.id}`);
  };

  // ── Place order (all methods) ─────────────────────────────────────────────
  const placeFinal = () => {
    if (payment === "UPI") {
      setShowUpiDialog(true);
      return;
    }

    if (payment === "Card") {
      setProcessing(true);
      handleRazorpayPayment();
      return;
    }

    // Cash on Delivery
    setProcessing(true);
    setTimeout(() => {
      const order = placeOrder(form, "Cash on Delivery", "Pay on delivery");
      setProcessing(false);
      if (order) navigate(`/orders/${order.id}`);
    }, 800);
  };

  return (
    <Shell>
      {/* UPI dialog — rendered above everything */}
      {showUpiDialog && (
        <UpiPaymentDialog
          amount={total}
          orderInfo={orderInfoForDialog}
          onSuccess={handleUpiSuccess}
          onClose={() => setShowUpiDialog(false)}
        />
      )}

      <div className="container py-6 md:py-10 max-w-2xl">
        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-6 text-[11px] sm:text-xs">
          <span
            className={`px-2.5 sm:px-3 py-1 rounded-full font-bold whitespace-nowrap ${
              step === "address"
                ? "bg-primary text-primary-foreground"
                : "bg-success/20 text-success"
            }`}
          >
            1. Address
          </span>
          <span className="h-px flex-1 bg-border" />
          <span
            className={`px-2.5 sm:px-3 py-1 rounded-full font-bold whitespace-nowrap ${
              step === "payment"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            }`}
          >
            2. Payment
          </span>
        </div>

        <h1 className="text-2xl md:text-3xl font-bold mb-2">Checkout</h1>
        <p className="text-sm text-muted-foreground mb-6 md:mb-8">
          {step === "address"
            ? "Where should we send your order?"
            : "How would you like to pay?"}
        </p>

        {/* ── STEP 1: Address ──────────────────────────────────────────── */}
        {step === "address" && (
          <form
            onSubmit={submitAddress}
            className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-soft"
          >
            <div>
              <Label>Full name (locked to profile)</Label>
              <Input
                value={user.name}
                disabled
                className="mt-1.5 bg-muted/40"
              />
            </div>
            <div>
              <Label>Street address</Label>
              <Input
                value={form.street}
                onChange={(e) => setForm({ ...form, street: e.target.value })}
                required
                className="mt-1.5"
                placeholder="12 Glade Lane"
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>City</Label>
                <Input
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  required
                  className="mt-1.5"
                  placeholder="Portland"
                />
              </div>
              <div>
                <Label>State</Label>
                <Input
                  value={form.state}
                  onChange={(e) => setForm({ ...form, state: e.target.value })}
                  required
                  className="mt-1.5"
                  placeholder="OR"
                />
              </div>
              <div>
                <Label>ZIP</Label>
                <Input
                  value={form.zip}
                  onChange={(e) => setForm({ ...form, zip: e.target.value })}
                  required
                  className="mt-1.5"
                  placeholder="97201"
                />
              </div>
            </div>
            <div>
              <Label>Phone</Label>
              <Input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                required
                className="mt-1.5"
                placeholder="555-0142"
              />
            </div>
            <Button type="submit" variant="hero" size="lg" className="w-full">
              Continue to payment →
            </Button>
          </form>
        )}

        {/* ── STEP 2: Payment ──────────────────────────────────────────── */}
        {step === "payment" && (
          <div className="space-y-4">
            {/* Order summary card */}
            <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
              <h2 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">
                Order Summary
              </h2>
              <div className="space-y-2 mb-3 max-h-40 overflow-auto pr-1">
                {cartWithProducts.map((i) => (
                  <div
                    key={i.productId}
                    className="flex items-center gap-3 text-sm"
                  >
                    {i.product?.image && (
                      <img
                        src={i.product.image}
                        alt={i.product.name}
                        className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="truncate font-medium">
                        {i.product?.name ?? "Product"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {[i.color, i.size].filter(Boolean).join(" · ")} · Qty{" "}
                        {i.qty}
                      </p>
                    </div>
                    <span className="font-semibold text-sm flex-shrink-0">
                      ₹
                      {(i.finalPrice * i.qty).toLocaleString("en-IN", {
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-t border-border pt-3 space-y-1 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>
                    ₹
                    {subtotal.toLocaleString("en-IN", {
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Tax (8%)</span>
                  <span>
                    ₹{tax.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping</span>
                  <span>
                    {shipping === 0 ? "Free" : `₹${shipping.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-base pt-1 border-t border-border mt-1">
                  <span>Total</span>
                  <span>
                    ₹
                    {total.toLocaleString("en-IN", {
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment method selection */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-soft space-y-4">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Payment Method
              </h2>

              <RadioGroup
                value={payment}
                onValueChange={(v) => setPayment(v as PaymentMethod)}
                className="space-y-2"
              >
                {PAYMENT_OPTIONS.map(({ id, label, icon: Icon, desc }) => (
                  <label
                    key={id}
                    htmlFor={id}
                    className={`flex items-center gap-4 rounded-xl border p-4 cursor-pointer transition-smooth ${
                      payment === id
                        ? "border-primary bg-primary-soft"
                        : "border-border hover:bg-muted/50"
                    }`}
                  >
                    <RadioGroupItem value={id} id={id} />
                    <Icon
                      className={`h-5 w-5 ${
                        payment === id
                          ? "text-primary"
                          : "text-muted-foreground"
                      }`}
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{label}</p>
                      <p className="text-xs text-muted-foreground">{desc}</p>
                    </div>
                    {/* Show amount badge on selected method */}
                    {payment === id && (
                      <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-full">
                        ₹
                        {total.toLocaleString("en-IN", {
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    )}
                  </label>
                ))}
              </RadioGroup>

              {/* Method-specific helper text */}
              <div className="rounded-xl bg-muted/40 p-4">
                {payment === "UPI" && (
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    A secure UPI payment dialog will open. Scan the QR code or
                    enter your UPI ID. Payment is processed by Razorpay.
                  </p>
                )}
                {payment === "Card" && (
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    A secure Razorpay popup will open to collect your card
                    details. We never store your card information.
                  </p>
                )}
                {payment === "Cash on Delivery" && (
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    You'll pay ₹
                    {total.toLocaleString("en-IN", {
                      maximumFractionDigits: 2,
                    })}{" "}
                    in cash when the courier delivers your order.
                  </p>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep("address")}
                  className="flex-1"
                >
                  ← Back
                </Button>
                <Button
                  type="button"
                  variant="hero"
                  size="lg"
                  onClick={placeFinal}
                  disabled={processing}
                  className="flex-1"
                >
                  {processing
                    ? "Processing…"
                    : payment === "Cash on Delivery"
                      ? "Place order"
                      : `Pay ₹${total.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Shell>
  );
}
