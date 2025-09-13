// VisualizationSection.tsx (replace your current file)
"use client";

import { useEffect, useState } from "react";
import { Map, Navigation, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import polyline from "@mapbox/polyline";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  Tooltip,
  useMap,
} from "react-leaflet";

interface Stop {
  lat: number;
  lon: number;
  name?: string;
  demand?: number;
}

interface ORSRoute {
  routes?: {
    geometry?: string;
    summary?: {
      distance?: number; // meters
      duration?: number; // seconds
    };
  }[];
}

interface Vehicle {
  id: number;
  stops: Stop[];
  route: ORSRoute;
}

interface VisualizationSectionProps {
  routes?: Vehicle[];
  baseline?: { distance: number; duration: number } | null;
}

const colors = ["blue", "green", "purple", "orange", "red", "cyan", "pink", "yellow", "brown"];

const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

const depotIcon = L.icon({
  iconUrl: "/building.png",
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  shadowSize: [41, 41],
  shadowAnchor: [12, 41],
});

function FitMapBounds({ routes }: { routes: Vehicle[] }) {
  const map = useMap();
  useEffect(() => {
    if (!routes.length) return;
    const bounds = L.latLngBounds([]);
    routes.forEach((vehicle) => {
      vehicle.stops.forEach((stop) => bounds.extend([stop.lat, stop.lon]));
      const encoded = vehicle.route?.routes?.[0]?.geometry;
      const coords = encoded ? polyline.decode(encoded) : [];
      coords.forEach(([lat, lon]) => bounds.extend([lat, lon]));
    });
    if (bounds.isValid()) map.fitBounds(bounds, { padding: [30, 30] });
  }, [routes, map]);
  return null;
}

export default function VisualizationSection({ routes = [], baseline = null }: VisualizationSectionProps) {
  const [zoom, setZoom] = useState(12);
  const [selectedTruck, setSelectedTruck] = useState<number | null>(null);

  // Compute depot candidate
  const depotCandidate =
    routes
      .flatMap((r) => r.stops)
      .find((stop) => stop.name?.trim().toLowerCase() === "depot") ||
    (routes[0]?.stops.length ? routes[0].stops[0] : null);

  const depotPos: [number, number] | null = depotCandidate
    ? [Number(depotCandidate.lat), Number(depotCandidate.lon)]
    : null;

  const isSameCoord = (aLat: number, aLon: number, bLat: number, bLon: number) =>
    Math.abs(aLat - bLat) < 1e-5 && Math.abs(aLon - bLon) < 1e-5;

  // Use baseline provided by parent (UploadSection) for BEFORE metrics
  const beforeMetrics = baseline;

  // Aggregate AFTER totals
  const afterDistance = routes.reduce(
    (sum, v) => sum + (v.route?.routes?.[0]?.summary?.distance || 0),
    0
  );
  const afterDuration = routes.reduce(
    (sum, v) => sum + (v.route?.routes?.[0]?.summary?.duration || 0),
    0
  );

  const legendItems = routes.map((vehicle, idx) => {
    const distanceMeters = vehicle.route?.routes?.[0]?.summary?.distance || 0;
    const distanceKm = (distanceMeters / 1000).toFixed(2);
    return {
      color: colors[idx % colors.length],
      label: `Truck ${vehicle.id} Route`,
      stops: vehicle.stops.length,
      distance: distanceKm,
      id: vehicle.id,
    };
  });

  const distanceSavingPct =
    beforeMetrics && beforeMetrics.distance > 0
      ? (((beforeMetrics.distance - afterDistance) / beforeMetrics.distance) * 100).toFixed(1)
      : "0";

  const durationSavingPct =
    beforeMetrics && beforeMetrics.duration > 0
      ? (((beforeMetrics.duration - afterDuration) / beforeMetrics.duration) * 100).toFixed(1)
      : "0";

  return (
    <section id="visualization" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-foreground mb-4">Route Visualization</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Interactive map showing optimized delivery routes and performance metrics.
            </p>
          </div>

          {/* BEFORE vs AFTER metrics */}
          {beforeMetrics && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="p-4 border rounded-lg bg-muted/30 text-center">
                <h4 className="font-semibold text-sm">Total Distance</h4>
                <p className="text-lg font-bold">{(afterDistance / 1000).toFixed(2)} km</p>
                <p className="text-xs text-muted-foreground">Before: {(beforeMetrics.distance / 1000).toFixed(2)} km</p>
                <p className="text-xs text-green-600">Saved {distanceSavingPct}%</p>
              </div>
              <div className="p-4 border rounded-lg bg-muted/30 text-center">
                <h4 className="font-semibold text-sm">Travel Time</h4>
                <p className="text-lg font-bold">{(afterDuration / 3600).toFixed(2)} hrs</p>
                <p className="text-xs text-muted-foreground">Before: {(beforeMetrics.duration / 3600).toFixed(2)} hrs</p>
                <p className="text-xs text-green-600">Saved {durationSavingPct}%</p>
              </div>
            </div>
          )}

          {/* Map + Legend */}
          <div className="grid lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3">
              <div className="saas-card-lg overflow-hidden">
                <div className="p-6 border-b border-border bg-muted/30 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Map className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">Interactive Route Map</h3>
                      <p className="text-sm text-muted-foreground">Real-time optimization visualization</p>
                    </div>
                  </div>
                  <Badge className={`${routes.length > 0 ? "bg-success/10 text-success border-success/20" : "bg-muted/20 text-muted-foreground border-muted/20"}`}>
                    <Zap className="w-3 h-3 mr-1" />
                    {routes.length > 0 ? "Optimized" : "Waiting"}
                  </Badge>
                </div>

                <div className="relative h-96">
                  <MapContainer center={depotPos || [17.385, 78.4867]} zoom={zoom} className="w-full h-full">
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OSM contributors' />
                    <FitMapBounds routes={routes} />
                    {depotPos && (
                      <Marker position={depotPos} icon={depotIcon} zIndexOffset={1000}>
                        <Tooltip sticky>Depot</Tooltip>
                      </Marker>
                    )}
                    {routes.map((vehicle, idx) => {
                      const encoded = vehicle.route?.routes?.[0]?.geometry;
                      const polyCoords = encoded ? polyline.decode(encoded) : [];
                      if (!polyCoords.length) return null;
                      const isSelected = selectedTruck === null || selectedTruck === vehicle.id;
                      return (
                        <Polyline
                          key={`route-${vehicle.id}`}
                          positions={polyCoords.map(([lat, lon]) => [lat, lon])}
                          pathOptions={{ color: colors[idx % colors.length], weight: isSelected ? 6 : 3, opacity: isSelected ? 1 : 0.15 }}
                        />
                      );
                    })}
                    {routes.map((vehicle) =>
                      vehicle.stops.map((stop, i) => {
                        if (depotPos && isSameCoord(stop.lat, stop.lon, depotPos[0], depotPos[1])) return null;
                        const isSelected = selectedTruck === null || selectedTruck === vehicle.id;
                        return (
                          <Marker key={`${vehicle.id}-${i}`} position={[stop.lat, stop.lon]} opacity={isSelected ? 1 : 0.25} eventHandlers={{ click: () => setSelectedTruck(selectedTruck === vehicle.id ? null : vehicle.id) }}>
                            <Tooltip sticky>{stop.name || `Stop ${i + 1}`} (Truck {vehicle.id})</Tooltip>
                          </Marker>
                        );
                      })
                    )}
                  </MapContainer>
                </div>

                <div className="p-4 border-t border-border bg-muted/30 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" onClick={() => setSelectedTruck(null)}>Show All</Button>
                    <Button variant="outline" size="sm" onClick={() => setZoom((z) => (z < 18 ? z + 1 : z))}><Navigation className="w-4 h-4 mr-2" />Zoom In</Button>
                  </div>
                  <div className="text-sm text-muted-foreground">Zoom: {zoom}x | Total Routes: {routes.length}</div>
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="space-y-6">
              {legendItems.length > 0 && (
                <div className="saas-card p-6">
                  <h4 className="font-semibold mb-4 flex items-center">
                    <div className="w-5 h-5 bg-primary/10 rounded mr-2 flex items-center justify-center"><div className="w-2 h-2 bg-primary rounded-full"></div></div>
                    Route Legend
                  </h4>
                  <div className="space-y-3">
                    {legendItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between cursor-pointer" onClick={() => setSelectedTruck(selectedTruck === item.id ? null : item.id)}>
                        <div className="flex items-center space-x-3">
                          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: item.color }}></div>
                          <span className="text-sm font-medium">{item.label}</span>
                        </div>
                        <Badge variant="outline" className="text-xs">{item.stops} {item.stops === 1 ? "stop" : "stops"} • {item.distance} km</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
