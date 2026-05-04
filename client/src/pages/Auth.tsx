import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import Shell from "@/components/layout/Shell";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Role, User } from "@/lib/types";
import { Sprout, KeyRound, Mail, Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";

const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

type Mode = "login" | "signup";
type PendingAction =
  | { kind: "login"; email: string; password: string; otp: string }
  | {
      kind: "signup";
      data: {
        name: string;
        email: string;
        password: string;
        role: Role;
        storeName?: string;
      };
      otp: string;
    }
  | { kind: "reset"; email: string; otp: string }
  | null;

const DEMO_CREDS = [
  {
    role: "Admin",
    email: "chakravartysawvik208@gmail.com",
    password: "123456789",
  },
  { role: "Vendor", email: "souvikc919@gmail.com", password: "123456789" },
  { role: "Customer", email: "souviklc2005@gmail.com", password: "123456789" },
];

export default function Auth() {
  const { signup, loginWithCredentials, resetPassword, users } = useApp();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const initialRole = (params.get("role") as Role) || "customer";

  const [mode, setMode] = useState<Mode>("login");
  const [showPwd, setShowPwd] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [signupForm, setSignupForm] = useState({
    name: "",
    email: "",
    password: "",
    role: initialRole as Role,
    storeName: "",
  });

  const [pending, setPending] = useState<PendingAction>(null);
  const [otpInput, setOtpInput] = useState("");

  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [resetOpen, setResetOpen] = useState(false);
  const [newPwd, setNewPwd] = useState({ p1: "", p2: "" });

  const routeFor = (u: User) => {
    if (u.role === "vendor") navigate("/vendor");
    else if (u.role === "admin") navigate("/admin");
    else navigate("/");
  };

  // --- API Connection Helper ---
  const requestOtpFromServer = async (
    email: string,
    userName: string,
    type: string,
  ) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, userName, type }),
      });
      const data = await response.json();
      if (data.success) {
        toast.success(`Verification code sent to ${email}`);
        return data.otp.toString();
      } else {
        toast.error(data.message || "Failed to send OTP");
        return null;
      }
    } catch (error) {
      toast.error("Server connection failed. Is the backend running?");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // ---- Login flow ----
  const startLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginForm.email || !loginForm.password) {
      toast.error("Email and password required");
      return;
    }

    const target = users.find(
      (u) => u.email.toLowerCase() === loginForm.email.toLowerCase(),
    );
    if (!target) {
      toast.error("No account with this email");
      return;
    }
    if (target.password && target.password !== loginForm.password) {
      toast.error("Incorrect password");
      return;
    }

    const serverOtp = await requestOtpFromServer(
      loginForm.email,
      target.name,
      "Login",
    );
    if (serverOtp) {
      setPending({
        kind: "login",
        email: loginForm.email,
        password: loginForm.password,
        otp: serverOtp,
      });
      setOtpInput("");
    }
  };

  // ---- Signup flow ----
  const startSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (signupForm.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (
      users.some(
        (u) => u.email.toLowerCase() === signupForm.email.toLowerCase(),
      )
    ) {
      toast.error("Email already registered");
      return;
    }

    const serverOtp = await requestOtpFromServer(
      signupForm.email,
      signupForm.name,
      "Account Creation",
    );
    if (serverOtp) {
      setPending({ kind: "signup", data: signupForm, otp: serverOtp });
      setOtpInput("");
    }
  };

  // ---- Forgot pwd flow ----
  const startForgot = async () => {
    if (!forgotEmail) {
      toast.error("Enter your email");
      return;
    }
    const target = users.find(
      (u) => u.email.toLowerCase() === forgotEmail.toLowerCase(),
    );
    if (!target) {
      toast.error("No account with that email");
      return;
    }

    const serverOtp = await requestOtpFromServer(
      forgotEmail,
      target.name,
      "Password Reset",
    );
    if (serverOtp) {
      setPending({ kind: "reset", email: forgotEmail, otp: serverOtp });
      setForgotOpen(false);
      setOtpInput("");
    }
  };

  // ---- OTP confirmation ----
  const confirmOtp = () => {
    if (!pending) return;
    if (otpInput !== pending.otp) {
      toast.error("Incorrect code");
      return;
    }

    if (pending.kind === "login") {
      const u = loginWithCredentials(pending.email, pending.password);
      if (u) {
        toast.success(`Welcome back, ${u.name}`);
        setPending(null);
        routeFor(u);
      }
    } else if (pending.kind === "signup") {
      const u = signup(pending.data);
      if (u) {
        toast.success("Account created!");
        setPending(null);
        routeFor(u);
      }
    } else if (pending.kind === "reset") {
      setResetOpen(true);
    }
  };

  const submitNewPwd = () => {
    if (pending?.kind !== "reset") return;
    if (newPwd.p1.length < 6) {
      toast.error("Min 6 characters");
      return;
    }
    if (newPwd.p1 !== newPwd.p2) {
      toast.error("Passwords don't match");
      return;
    }

    if (resetPassword(pending.email, newPwd.p1)) {
      toast.success("Password updated — please sign in");
      setResetOpen(false);
      setPending(null);
      setMode("login");
    }
  };

  return (
    <Shell>
      <div className="container py-12 grid lg:grid-cols-[1fr_360px] gap-10 items-start max-w-5xl">
        <div className="max-w-md mx-auto w-full">
          <div className="text-center mb-8">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-hero shadow-elegant mb-4">
              <Sprout className="h-7 w-7 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">
              Welcome to AisleMind
            </h1>
            <p className="text-sm text-muted-foreground mt-2">
              Sign in to your forest-fresh marketplace.
            </p>
          </div>

          <Tabs
            value={mode}
            onValueChange={(v) => setMode(v as Mode)}
            className="w-full"
          >
            <TabsList className="grid grid-cols-2 w-full mb-6 bg-muted/60 p-1 rounded-xl">
              <TabsTrigger value="login" className="rounded-lg">
                Sign in
              </TabsTrigger>
              <TabsTrigger value="signup" className="rounded-lg">
                Create account
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form
                onSubmit={startLogin}
                className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-soft"
              >
                <div>
                  <Label>Email</Label>
                  <Input
                    required
                    type="email"
                    value={loginForm.email}
                    onChange={(e) =>
                      setLoginForm({ ...loginForm, email: e.target.value })
                    }
                    className="mt-1.5"
                    placeholder="you@example.com"
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center">
                    <Label>Password</Label>
                    <button
                      type="button"
                      onClick={() => setForgotOpen(true)}
                      className="text-xs text-primary hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative mt-1.5">
                    <Input
                      required
                      type={showPwd ? "text" : "password"}
                      value={loginForm.password}
                      onChange={(e) =>
                        setLoginForm({ ...loginForm, password: e.target.value })
                      }
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwd(!showPwd)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPwd ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
                <Button
                  type="submit"
                  variant="hero"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <KeyRound className="h-4 w-4 mr-2" />
                  )}
                  Sign in
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form
                onSubmit={startSignup}
                className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-soft"
              >
                <div>
                  <Label>Full name</Label>
                  <Input
                    required
                    value={signupForm.name}
                    onChange={(e) =>
                      setSignupForm({ ...signupForm, name: e.target.value })
                    }
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    required
                    type="email"
                    value={signupForm.email}
                    onChange={(e) =>
                      setSignupForm({ ...signupForm, email: e.target.value })
                    }
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label>Password</Label>
                  <Input
                    required
                    type="password"
                    value={signupForm.password}
                    onChange={(e) =>
                      setSignupForm({ ...signupForm, password: e.target.value })
                    }
                    className="mt-1.5"
                    placeholder="Min 6 characters"
                  />
                </div>
                <div>
                  <Label>Account type</Label>
                  <select
                    className="w-full mt-1.5 rounded-lg border border-input bg-background h-10 px-3 text-sm"
                    value={signupForm.role}
                    onChange={(e) =>
                      setSignupForm({
                        ...signupForm,
                        role: e.target.value as Role,
                      })
                    }
                  >
                    <option value="customer">Customer</option>
                    <option value="vendor">Vendor</option>
                  </select>
                </div>
                {signupForm.role === "vendor" && (
                  <div>
                    <Label>Store name</Label>
                    <Input
                      value={signupForm.storeName}
                      onChange={(e) =>
                        setSignupForm({
                          ...signupForm,
                          storeName: e.target.value,
                        })
                      }
                      className="mt-1.5"
                    />
                  </div>
                )}
                <Button
                  type="submit"
                  variant="hero"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading && (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  )}
                  Create account
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>

        <aside className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <p className="text-xs uppercase tracking-wider font-semibold text-primary mb-3">
            Quick Login
          </p>
          <div className="space-y-2">
            {DEMO_CREDS.map((c) => (
              <button
                key={c.email}
                onClick={() => {
                  setMode("login");
                  setLoginForm({ email: c.email, password: c.password });
                }}
                className="w-full text-left rounded-lg border border-border bg-background hover:bg-primary-soft hover:border-primary/30 p-3 transition-smooth"
              >
                <div className="flex justify-between items-center">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-primary">
                    {c.role}
                  </span>
                </div>
                <p className="text-sm font-mono mt-1 truncate">{c.email}</p>
              </button>
            ))}
          </div>
        </aside>
      </div>

      {/* Verification Modal */}
      <Dialog
        open={!!pending && !resetOpen}
        onOpenChange={(o) => !o && setPending(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" /> Verify Email
            </DialogTitle>
            <DialogDescription>
              Enter the 6-digit code sent to your email.
            </DialogDescription>
          </DialogHeader>
          <div>
            <Input
              value={otpInput}
              onChange={(e) =>
                setOtpInput(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              className="mt-1.5 text-center text-xl font-mono tracking-[0.3em]"
              maxLength={6}
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setPending(null)}>
              Cancel
            </Button>
            <Button variant="hero" onClick={confirmOtp}>
              Verify
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Forgot Password Modal */}
      <Dialog open={forgotOpen} onOpenChange={setForgotOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Enter your email to receive a code.
            </DialogDescription>
          </DialogHeader>
          <Input
            type="email"
            value={forgotEmail}
            onChange={(e) => setForgotEmail(e.target.value)}
            className="mt-1.5"
          />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setForgotOpen(false)}>
              Cancel
            </Button>
            <Button variant="hero" onClick={startForgot} disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Send Code"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Set New Password Modal */}
      <Dialog
        open={resetOpen}
        onOpenChange={(o) => {
          setResetOpen(o);
          if (!o) setPending(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Password</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              type="password"
              placeholder="New Password"
              value={newPwd.p1}
              onChange={(e) => setNewPwd({ ...newPwd, p1: e.target.value })}
            />
            <Input
              type="password"
              placeholder="Confirm Password"
              value={newPwd.p2}
              onChange={(e) => setNewPwd({ ...newPwd, p2: e.target.value })}
            />
          </div>
          <DialogFooter>
            <Button variant="hero" onClick={submitNewPwd}>
              Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Shell>
  );
}
