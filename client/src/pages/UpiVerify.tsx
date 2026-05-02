import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { CheckCircle2, ShoppingBag, ArrowLeft, Loader2 } from "lucide-react";

const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

type Status = "confirming" | "done" | "already_done" | "error";

export default function UpiVerify() {
  const [params] = useSearchParams();
  const [status, setStatus] = useState<Status>("confirming");
  const [errorMsg, setErrorMsg] = useState("");

  const token = params.get("token");
  const amount = params.get("amount");
  const merchant = params.get("merchant") ?? "AisleMind";

  useEffect(() => {
    if (!token) {
      setErrorMsg("No payment token found in this link.");
      setStatus("error");
      return;
    }

    fetch(`${BACKEND_URL}/upi-confirm`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setStatus(data.alreadyVerified ? "already_done" : "done");
        } else {
          setErrorMsg(data.message ?? "Verification failed.");
          setStatus("error");
        }
      })
      .catch(() => {
        setErrorMsg(
          "Could not reach the server. Check your internet connection.",
        );
        setStatus("error");
      });
  }, [token]);

  const formattedAmount = amount
    ? `₹${parseFloat(amount).toLocaleString("en-IN")}`
    : "";

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{
        background:
          "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #f0fdf4 100%)",
        fontFamily: "'Segoe UI', system-ui, sans-serif",
      }}
    >
      <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden">
        {/* Header band — same Razorpay style as the dialog */}
        <div
          className="px-6 py-4 text-center"
          style={{ background: "linear-gradient(135deg,#072654,#1e40af)" }}
        >
          <div className="flex items-center justify-center gap-2 mb-1">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <polygon
                points="13,2 3,14 12,14 11,22 21,10 12,10"
                fill="white"
              />
            </svg>
            <span className="text-white font-bold text-sm">Razorpay · UPI</span>
          </div>
          <p className="text-white/60 text-xs">Payment Verification</p>
        </div>

        <div className="p-8 flex flex-col items-center text-center gap-5">
          {/* CONFIRMING */}
          {status === "confirming" && (
            <>
              <div className="w-16 h-16 rounded-full bg-blue-50 border-2 border-blue-100 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
              </div>
              <div>
                <p className="font-bold text-gray-800 text-lg">
                  Confirming payment…
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  Sending signal to checkout page
                </p>
              </div>
            </>
          )}

          {/* SUCCESS */}
          {(status === "done" || status === "already_done") && (
            <>
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-emerald-50 border-2 border-emerald-100 flex items-center justify-center">
                  <CheckCircle2 className="w-11 h-11 text-emerald-500" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center shadow-md">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <polyline
                      points="20 6 9 17 4 12"
                      stroke="white"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>

              <div>
                <p className="font-black text-gray-800 text-2xl">
                  {status === "already_done"
                    ? "Already Verified!"
                    : "Payment Confirmed!"}
                </p>
                {formattedAmount && (
                  <p className="text-3xl font-black text-emerald-600 mt-1">
                    {formattedAmount}
                  </p>
                )}
                <p className="text-sm text-gray-400 mt-2">
                  Paid to{" "}
                  <span className="font-semibold text-gray-600">
                    {decodeURIComponent(merchant)}
                  </span>
                </p>
              </div>

              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl px-5 py-4 w-full">
                <p className="text-sm text-emerald-700 font-bold">
                  ✓ Checkout page notified
                </p>
                <p className="text-xs text-emerald-600 mt-1 leading-relaxed">
                  Your order is being placed on the other screen.
                  <br />
                  You can safely close this tab.
                </p>
              </div>

              <Link
                to="/"
                className="flex items-center gap-2 text-sm text-blue-600 font-semibold hover:underline"
              >
                <ShoppingBag className="w-4 h-4" />
                Back to AisleMind
              </Link>
            </>
          )}

          {/* ERROR */}
          {status === "error" && (
            <>
              <div className="w-20 h-20 rounded-full bg-red-50 border-2 border-red-100 flex items-center justify-center text-4xl">
                ⚠️
              </div>
              <div>
                <p className="font-bold text-gray-800 text-lg">
                  Verification Failed
                </p>
                <p className="text-sm text-gray-400 mt-1 leading-relaxed max-w-xs">
                  {errorMsg ||
                    "This link is invalid or has expired. Please go back and try again."}
                </p>
              </div>
              <Link
                to="/"
                className="flex items-center gap-2 text-sm text-blue-600 font-semibold hover:underline"
              >
                <ArrowLeft className="w-4 h-4" />
                Return to homepage
              </Link>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 bg-gray-50 px-6 py-3 text-center">
          <p className="text-[10px] text-gray-400">
            🔒 256-bit SSL secured · Powered by{" "}
            <span className="font-semibold text-gray-600">Razorpay</span>
          </p>
        </div>
      </div>
    </div>
  );
}
