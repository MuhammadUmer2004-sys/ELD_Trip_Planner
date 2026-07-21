import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Truck } from "lucide-react";
import { Link } from "react-router-dom";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

export default function Register() {
    const [step, setStep] = useState("register"); // register | otp
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [otp, setOtp] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleRegister = async (e) => {
        e.preventDefault();
        if (password !== confirm) { setError("Passwords don't match"); return; }
        setLoading(true);
        setError("");
        try {
            await base44.auth.register({ email, password });
            setStep("otp");
        } catch (err) {
            setError(err.message || "Registration failed");
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const { access_token } = await base44.auth.verifyOtp({ email, otpCode: otp });
            base44.auth.setToken(access_token);
            window.location.href = "/";
        } catch (err) {
            setError(err.message || "Verification failed");
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        try { await base44.auth.resendOtp(email); } catch { }
    };

    const handleGoogle = () => {
        base44.auth.loginWithProvider("google", "/");
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-4">
            <img
                src="https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=1600&q=80"
                alt="Semi truck on open road"
                className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-emerald-900/70 to-slate-800/60" />
            <Card className="w-full max-w-md border-0 shadow-2xl relative z-10 backdrop-blur-sm bg-white/95">
                <CardHeader className="text-center">
                    <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center mx-auto mb-2">
                        <Truck className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-2xl font-heading">
                        {step === "register" ? "Create Account" : "Verify Email"}
                    </CardTitle>
                    <CardDescription>
                        {step === "register" ? "Sign up for ELD Trip Planner" : `Enter the code sent to ${email}`}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg mb-4">{error}</div>}
                    {step === "register" ? (
                        <form onSubmit={handleRegister} className="space-y-4">
                            <div className="space-y-2">
                                <Label>Email</Label>
                                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                            </div>
                            <div className="space-y-2">
                                <Label>Password</Label>
                                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                            </div>
                            <div className="space-y-2">
                                <Label>Confirm Password</Label>
                                <Input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
                            </div>
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? "Creating..." : "Create Account"}
                            </Button>
                            <Button type="button" variant="outline" className="w-full" onClick={handleGoogle}>
                                Continue with Google
                            </Button>
                            <div className="text-center text-sm">
                                <Link to="/login" className="text-blue-600 hover:underline">Already have an account? Sign in</Link>
                            </div>
                        </form>
                    ) : (
                        <form onSubmit={handleVerify} className="space-y-4">
                            <div className="flex justify-center">
                                <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                                    <InputOTPGroup>
                                        {[0, 1, 2, 3, 4, 5].map(i => <InputOTPSlot key={i} index={i} />)}
                                    </InputOTPGroup>
                                </InputOTP>
                            </div>
                            <Button type="submit" className="w-full" disabled={loading || otp.length < 6}>
                                {loading ? "Verifying..." : "Verify"}
                            </Button>
                            <Button type="button" variant="ghost" className="w-full" onClick={handleResend}>
                                Resend Code
                            </Button>
                        </form>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}