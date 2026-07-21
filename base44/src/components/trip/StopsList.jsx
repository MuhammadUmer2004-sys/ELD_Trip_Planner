import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ListChecks } from "lucide-react";

const stopStyles = {
    start: { bg: "bg-blue-50", text: "text-blue-700", badge: "bg-blue-100 text-blue-800" },
    pickup: { bg: "bg-emerald-50", text: "text-emerald-700", badge: "bg-emerald-100 text-emerald-800" },
    dropoff: { bg: "bg-red-50", text: "text-red-700", badge: "bg-red-100 text-red-800" },
    rest: { bg: "bg-purple-50", text: "text-purple-700", badge: "bg-purple-100 text-purple-800" },
    break: { bg: "bg-amber-50", text: "text-amber-700", badge: "bg-amber-100 text-amber-800" },
    fuel: { bg: "bg-orange-50", text: "text-orange-700", badge: "bg-orange-100 text-orange-800" },
    end: { bg: "bg-indigo-50", text: "text-indigo-700", badge: "bg-indigo-100 text-indigo-800" },
};

function formatTime(hours) {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    const day = Math.floor(hours / 24) + 1;
    const hourOfDay = h % 24;
    const ampm = hourOfDay >= 12 ? "PM" : "AM";
    const displayHour = hourOfDay === 0 ? 12 : hourOfDay > 12 ? hourOfDay - 12 : hourOfDay;
    return { timeStr: `${displayHour}:${m.toString().padStart(2, "0")} ${ampm}`, dayStr: `Day ${day}` };
}

export default function StopsList({ stops }) {
    if (!stops || stops.length === 0) return null;

    return (
        <Card className="border-0 shadow-lg bg-white">
            <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center">
                        <ListChecks className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <CardTitle className="text-xl font-heading">Route Stops</CardTitle>
                        <p className="text-sm text-muted-foreground mt-0.5">{stops.length} planned stops</p>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="relative">
                    {/* Timeline line */}
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-200" />

                    <div className="space-y-1">
                        {stops.map((stop, idx) => {
                            const style = stopStyles[stop.type] || stopStyles.rest;
                            const time = formatTime(stop.time);
                            return (
                                <div key={idx} className="relative flex items-start gap-4 pl-10 py-2">
                                    {/* Timeline dot */}
                                    <div className={`absolute left-2.5 top-3 w-3 h-3 rounded-full border-2 border-white shadow-sm ${style.badge}`} />

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <Badge variant="secondary" className={`text-xs ${style.badge} border-0`}>
                                                {stop.type.replace("_", " ").toUpperCase()}
                                            </Badge>
                                            <span className="text-xs text-muted-foreground">{time.dayStr} • {time.timeStr}</span>
                                        </div>
                                        <p className="text-sm text-slate-700 mt-0.5">{stop.reason}</p>
                                        <div className="flex gap-3 mt-0.5 text-xs text-muted-foreground">
                                            {stop.duration > 0 && (
                                                <span>
                                                    {stop.duration >= 1 ? `${stop.duration}hr` : `${Math.round(stop.duration * 60)}min`}
                                                </span>
                                            )}
                                            <span>Mile {Math.round(stop.mileMarker)}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}