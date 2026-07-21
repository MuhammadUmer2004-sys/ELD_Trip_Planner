import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ResetPassword() {
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const token = new URLSearchParams(window.location.search).get("token");

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirm) { setError("Passwords don't match"); return; }
        setLoading(true);
        setError("");
        try {
            await base44.auth.resetPassword({ resetToken: token, newPassword: password });
            window.location.href = "/login";
        } catch (err) {
            setError(err.message || "Reset failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-4">
            <img
                src="https://images.unsplash.com/photo-1469474968028-56623f02e852?auto=format&fit=crop&w=1600&q=80"
                alt="Scenic road through forest"
                className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-indigo-900/60 to-slate-800/60" />
            <Card className="w-full max-w-md border-0 shadow-2xl relative z-10 backdrop-blur-sm bg-white/95">
                <CardHeader className="text-center">
                    <CardTitle>Set New Password</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">{error}</div>}
                        <div className="space-y-2">
                            <Label>New Password</Label>
                            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                        </div>
                        <div className="space-y-2">
                            <Label>Confirm Password</Label>
                            <Input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
                        </div>
                        <Button type="submit" className="w-full" disabled={loading}>Reset Password</Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}