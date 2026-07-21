import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Link } from "react-router-dom";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [sent, setSent] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try { await base44.auth.resetPasswordRequest(email); } catch { }
        setSent(true);
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-4">
            <img
                src="https://images.unsplash.com/photo-1494412574745-e8de56ad7910?auto=format&fit=crop&w=1600&q=80"
                alt="Mountain highway"
                className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-amber-900/60 to-slate-800/60" />
            <Card className="w-full max-w-md border-0 shadow-2xl relative z-10 backdrop-blur-sm bg-white/95">
                <CardHeader className="text-center">
                    <CardTitle>Reset Password</CardTitle>
                    <CardDescription>{sent ? "Check your email for a reset link" : "Enter your email"}</CardDescription>
                </CardHeader>
                <CardContent>
                    {!sent ? (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label>Email</Label>
                                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                            </div>
                            <Button type="submit" className="w-full" disabled={loading}>Send Reset Link</Button>
                        </form>
                    ) : (
                        <p className="text-center text-sm text-muted-foreground">If an account exists, a reset link was sent.</p>
                    )}
                    <div className="text-center text-sm mt-4">
                        <Link to="/login" className="text-blue-600 hover:underline">Back to login</Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}