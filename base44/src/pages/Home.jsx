import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { History as HistoryIcon, MapPin, Navigation, Package, Clock, ChevronRight, ArrowLeft } from "lucide-react";
import RouteMap from "@/components/trip/RouteMap";
import ELDLogSheet from "@/components/trip/ELDLogSheet";
import TripSummary from "@/components/trip/TripSummary";
import StopsList from "@/components/trip/StopsList";

export default function History() {
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTrip, setSelectedTrip] = useState(null);
    const [viewMode, setViewMode] = useState("list");

    useEffect(() => {
        loadTrips();
    }, []);

    async function loadTrips() {
        setLoading(true);
        try {
            const data = await base44.entities.Trip.list("-created_date", 50);
            setTrips(data || []);
        } catch (err) {
            console.error("Failed to load trips", err);
        } finally {
            setLoading(false);
        }
    }

    function viewTrip(trip) {
        let routeCoords = [];
        let stops = [];
        let dailyLogs = [];
        try { routeCoords = JSON.parse(trip.route_data || "[]"); } catch { }
        try { stops = JSON.parse(trip.stops || "[]"); } catch { }
        try { dailyLogs = JSON.parse(trip.log_sheets || "[]"); } catch { }

        const routeData = routeCoords.length > 0
            ? { coordinates: routeCoords, totalDistance: trip.total_distance_miles }
            : null;

        setSelectedTrip({
            ...trip,
            routeData,
            stops,
            dailyLogs,
            summary: {
                totalMiles: trip.total_distance_miles || 0,
                totalTime: trip.estimated_duration_hours || 0,
                totalDays: dailyLogs.length || 1,
                totalStops: stops.length || 0,
                fuelStops: stops.filter(s => s.type === "fuel").length,
                restStops: stops.filter(s => s.type === "rest").length,
            },
        });
        setViewMode("detail");
    }

    function formatDate(dateStr) {
        if (!dateStr) return "";
        return new Date(dateStr).toLocaleDateString("en-US", {
            month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit"
        });
    }

    if (viewMode === "detail" && selectedTrip) {
        const trip = selectedTrip;
        return (
            <div className="min-h-screen bg-slate-50">
                <header className="sticky top-0 z-50 border-b border-white/10">
                    <div className="relative">
                        <img
                            src="https://images.unsplash.com/photo-1494412574745-e8de56ad7910?auto=format&fit=crop&w=1600&q=80"
                            alt=""
                            className="absolute inset-0 w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/95 to-slate-800/80" />
                        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
                            <Button variant="ghost" size="sm" onClick={() => setViewMode("list")} className="gap-1 text-white hover:bg-white/10">
                                <ArrowLeft className="w-4 h-4" /> Back
                            </Button>
                            <div className="w-9 h-9 rounded-lg bg-white/10 backdrop-blur flex items-center justify-center border border-white/20">
                                <HistoryIcon className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-lg font-bold font-heading tracking-tight text-white">Trip Details</h1>
                                <p className="text-xs text-slate-300">{formatDate(trip.created_date)}</p>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card className="border-0 shadow-md">
                            <CardContent className="p-4 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                                    <Navigation className="w-5 h-5 text-blue-500" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs text-muted-foreground">From</p>
                                    <p className="text-sm font-medium truncate">{trip.current_location}</p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="border-0 shadow-md">
                            <CardContent className="p-4 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                                    <Package className="w-5 h-5 text-emerald-500" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs text-muted-foreground">Pickup</p>
                                    <p className="text-sm font-medium truncate">{trip.pickup_location}</p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="border-0 shadow-md">
                            <CardContent className="p-4 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                                    <MapPin className="w-5 h-5 text-red-500" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs text-muted-foreground">Dropoff</p>
                                    <p className="text-sm font-medium truncate">{trip.dropoff_location}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-amber-500" />
                        <span className="text-muted-foreground">Cycle used at start:</span>
                        <Badge variant="secondary">{trip.current_cycle_used} hrs</Badge>
                    </div>

                    {trip.summary && <TripSummary summary={trip.summary} />}

                    {trip.routeData && <RouteMap routeData={trip.routeData} stops={trip.stops} />}

                    {trip.stops?.length > 0 && <StopsList stops={trip.stops} />}

                    {trip.dailyLogs?.length > 0 && (
                        <Card className="border-0 shadow-lg bg-white">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-xl font-heading">Daily ELD Log Sheets</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {trip.dailyLogs.map((log) => (
                                    <ELDLogSheet
                                        key={log.day}
                                        logData={log}
                                        dayNumber={log.day}
                                        tripDate={formatDate(trip.created_date)}
                                    />
                                ))}
                            </CardContent>
                        </Card>
                    )}
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <header className="sticky top-0 z-50 border-b border-white/10">
                <div className="relative">
                    <img
                        src="https://images.unsplash.com/photo-1471506480208-91b3a4cc78be?auto=format&fit=crop&w=1600&q=80"
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/95 to-slate-800/80" />
                    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-white/10 backdrop-blur flex items-center justify-center border border-white/20">
                            <HistoryIcon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold font-heading tracking-tight text-white">Trip History</h1>
                            <p className="text-xs text-slate-300">View past trips, routes, and log sheets</p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-3">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
                    </div>
                ) : trips.length === 0 ? (
                    <div className="relative rounded-2xl overflow-hidden shadow-lg">
                        <img
                            src="https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=1600&q=80"
                            alt="Empty road"
                            className="w-full h-64 object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/50 to-transparent" />
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
                            <div className="w-14 h-14 rounded-2xl bg-white/90 backdrop-blur flex items-center justify-center mb-3 shadow-lg">
                                <HistoryIcon className="w-7 h-7 text-slate-800" />
                            </div>
                            <h2 className="text-xl font-bold text-white font-heading">No trips yet</h2>
                            <p className="text-sm text-slate-200 mt-2">Plan a trip to see it saved here.</p>
                        </div>
                    </div>
                ) : (
                    trips.map((trip) => (
                        <Card
                            key={trip.id}
                            className="border-0 shadow-md hover:shadow-lg transition-shadow cursor-pointer group"
                            onClick={() => viewTrip(trip)}
                        >
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex-1 min-w-0 space-y-2">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-0">
                                                {trip.total_distance_miles || 0} miles
                                            </Badge>
                                            <Badge variant="secondary" className="bg-purple-100 text-purple-800 border-0">
                                                {trip.estimated_duration_hours || 0} hrs
                                            </Badge>
                                            <Badge variant="secondary" className="bg-amber-100 text-amber-800 border-0">
                                                {trip.current_cycle_used} hrs cycle
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-slate-600">
                                            <Navigation className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                                            <span className="truncate">{trip.current_location}</span>
                                            <span className="text-slate-300">→</span>
                                            <Package className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                                            <span className="truncate">{trip.pickup_location}</span>
                                            <span className="text-slate-300">→</span>
                                            <MapPin className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                                            <span className="truncate">{trip.dropoff_location}</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground">{formatDate(trip.created_date)}</p>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-slate-500 transition-colors flex-shrink-0" />
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </main>
        </div>
    );
}