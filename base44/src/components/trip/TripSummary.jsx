import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Route, Clock, Fuel, BedDouble, MapPin } from "lucide-react";

export default function TripSummary({ summary }) {
    if (!summary) return null;

    const stats = [
        { icon: Route, label: "Total Distance", value: `${summary.totalMiles} mi`, color: "bg-blue-50 text-blue-600" },
        { icon: Clock, label: "Total Time", value: `${Math.round(summary.totalTime)} hrs`, color: "bg-emerald-50 text-emerald-600" },
        { icon: MapPin, label: "Days", value: summary.totalDays, color: "bg-purple-50 text-purple-600" },
        { icon: Fuel, label: "Fuel Stops", value: summary.fuelStops, color: "bg-orange-50 text-orange-600" },
        { icon: BedDouble, label: "Rest Stops", value: summary.restStops, color: "bg-indigo-50 text-indigo-600" },
    ];

    return (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {stats.map((stat) => (
                <Card key={stat.label} className="border-0 shadow-md">
                    <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color}`}>
                            <stat.icon className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold font-heading">{stat.value}</p>
                            <p className="text-xs text-muted-foreground">{stat.label}</p>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}