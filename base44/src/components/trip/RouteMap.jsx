import React, { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from "react-leaflet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Map } from "lucide-react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix leaflet default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const stopColors = {
    start: "#3b82f6",
    pickup: "#10b981",
    dropoff: "#ef4444",
    rest: "#8b5cf6",
    break: "#f59e0b",
    fuel: "#f97316",
    end: "#6366f1",
};

const stopLabels = {
    start: "🚛 Start",
    pickup: "📦 Pickup",
    dropoff: "📍 Dropoff",
    rest: "🛏️ Rest",
    break: "☕ Break",
    fuel: "⛽ Fuel",
    end: "🏁 End",
};

function createIcon(color) {
    return L.divIcon({
        className: "custom-marker",
        html: `<div style="background:${color};width:24px;height:24px;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);"></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
    });
}

function FitBounds({ coordinates }) {
    const map = useMap();
    useEffect(() => {
        if (coordinates && coordinates.length > 0) {
            const bounds = L.latLngBounds(coordinates.map(c => [c[1], c[0]]));
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [coordinates, map]);
    return null;
}

export default function RouteMap({ routeData, stops }) {
    if (!routeData || !routeData.coordinates || routeData.coordinates.length === 0) {
        return null;
    }

    const polylinePositions = routeData.coordinates.map(c => [c[1], c[0]]);

    // Interpolate stop positions along the route
    const totalRouteDistance = routeData.totalDistance || 1;

    function getPositionAtMile(mileMarker) {
        const fraction = Math.min(mileMarker / totalRouteDistance, 1);
        const index = Math.min(
            Math.floor(fraction * (polylinePositions.length - 1)),
            polylinePositions.length - 1
        );
        return polylinePositions[index];
    }

    return (
        <Card className="border-0 shadow-lg bg-white overflow-hidden">
            <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center">
                        <Map className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <CardTitle className="text-xl font-heading">Route Map</CardTitle>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            {Math.round(totalRouteDistance)} miles total • {stops?.length || 0} stops
                        </p>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <div className="h-[450px] w-full">
                    <MapContainer
                        center={polylinePositions[0] || [39.8283, -98.5795]}
                        zoom={5}
                        className="h-full w-full"
                        scrollWheelZoom={true}
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <FitBounds coordinates={routeData.coordinates} />
                        <Polyline
                            positions={polylinePositions}
                            color="#3b82f6"
                            weight={4}
                            opacity={0.8}
                        />
                        {stops?.map((stop, idx) => {
                            const pos = getPositionAtMile(stop.mileMarker);
                            if (!pos) return null;
                            const color = stopColors[stop.type] || "#6b7280";
                            return (
                                <Marker key={idx} position={pos} icon={createIcon(color)}>
                                    <Popup>
                                        <div className="text-sm">
                                            <strong>{stopLabels[stop.type] || stop.type}</strong>
                                            <br />
                                            {stop.reason}
                                            {stop.duration > 0 && (
                                                <>
                                                    <br />
                                                    Duration: {stop.duration >= 1 ? `${stop.duration}hr` : `${Math.round(stop.duration * 60)}min`}
                                                </>
                                            )}
                                            <br />
                                            Mile: {Math.round(stop.mileMarker)}
                                        </div>
                                    </Popup>
                                </Marker>
                            );
                        })}
                    </MapContainer>
                </div>

                {/* Stop legend */}
                <div className="p-4 border-t bg-slate-50">
                    <div className="flex flex-wrap gap-3">
                        {Object.entries(stopLabels).map(([key, label]) => (
                            <div key={key} className="flex items-center gap-1.5 text-xs">
                                <div
                                    className="w-3 h-3 rounded-full border-2 border-white shadow-sm"
                                    style={{ background: stopColors[key] }}
                                />
                                <span className="text-muted-foreground">{label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}