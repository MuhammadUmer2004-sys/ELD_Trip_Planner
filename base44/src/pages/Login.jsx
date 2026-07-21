import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Truck } from "lucide-react";
import { Link } from "react-router-dom";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            await base44.auth.loginViaEmailPassword(email, password);
            window.location.href = "/";
        } catch (err) {
            setError(err.message || "Login failed");
        } finally {
            setLoading(false);
        }
    };

    const handleGoogle = () => {
        base44.auth.loginWithProvider("google", "/");
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-4">
            <img
                src="https://images.unsplash.com/photo-1580614644728-1a4aad8e1bdc?auto=format&fit=crop&w=1600&q=80"
                alt="Truck on highway"
                className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-slate-900/75 to-blue-900/60" />
            <Card className="w-full max-w-md border-0 shadow-2xl relative z-10 backdrop-blur-sm bg-white/95">
                <CardHeader className="text-center">
                    <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center mx-auto mb-2">
                        <Truck className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-2xl font-heading">ELD Trip Planner</CardTitle>
                    <CardDescription>Sign in to your account</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">{error}</div>}
                        <div className="space-y-2">
                            <Label>Email</Label>
                            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                        </div>
                        <div className="space-y-2">
                            <Label>Password</Label>
                            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                        </div>
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? "Signing in..." : "Sign In"}
                        </Button>
                        <Button type="button" variant="outline" className="w-full" onClick={handleGoogle}>
                            Continue with Google
                        </Button>
                        <div className="text-center text-sm space-y-1">
                            <Link to="/forgot-password" className="text-blue-600 hover:underline block">Forgot password?</Link>
                            <Link to="/register" className="text-blue-600 hover:underline block">Create account</Link>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}