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
  routes?: { geometry?: string }[];
}

interface Vehicle {
  id: number;
  stops: Stop[];
  route: ORSRoute;
}

interface VisualizationSectionProps {
  routes?: Vehicle[];
}

const colors = [
  "blue",
  "green",
  "purple",
  "orange",
  "red",
  "cyan",
  "pink",
  "yellow",
  "brown",
];

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
  iconUrl: "/building.png", // ✅ fixed path for public folder
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

export default function VisualizationSection({ routes = [] }: VisualizationSectionProps) {
  const [zoom, setZoom] = useState(12);
  const [selectedTruck, setSelectedTruck] = useState<number | null>(null);

  const depotStop = routes
    .flatMap((r) => r.stops)
    .find((stop) => stop.name?.trim().toLowerCase() === "depot");

  const depotPos: [number, number] | null = depotStop
    ? [Number(depotStop.lat), Number(depotStop.lon)]
    : routes.length && routes[0].stops.length
    ? [routes[0].stops[0].lat, routes[0].stops[0].lon]
    : null;

  const isSameCoord = (aLat: number, aLon: number, bLat: number, bLon: number) =>
    Math.abs(aLat - bLat) < 1e-5 && Math.abs(aLon - bLon) < 1e-5;

  const legendItems = routes.map((vehicle, idx) => ({
    color: colors[idx % colors.length],
    label: `Truck ${vehicle.id} Route`,
    stops: vehicle.stops.length,
    id: vehicle.id,
  }));

  return (
    <section id="visualization" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Route Visualization
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Interactive map showing optimized delivery routes with real-time insights and detailed analytics for each vehicle.
            </p>
          </div>

          <div className="grid lg:grid-cols-4 gap-8">
            {/* Map */}
            <div className="lg:col-span-3">
              <div className="saas-card-lg overflow-hidden">
                <div className="p-6 border-b border-border bg-muted/30 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Map className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">Interactive Route Map</h3>
                      <p className="text-sm text-muted-foreground">
                        Real-time optimization visualization
                      </p>
                    </div>
                  </div>
                  <Badge
                    className={`${
                      routes.length > 0
                        ? "bg-success/10 text-success border-success/20"
                        : "bg-muted/20 text-muted-foreground border-muted/20"
                    }`}
                  >
                    <Zap className="w-3 h-3 mr-1" />
                    {routes.length > 0 ? "Optimized" : "Waiting"}
                  </Badge>
                </div>

                {/* ✅ Map is fully absolute positioned to avoid extra container space */}
                <div className="relative h-96">
                  <MapContainer
                    center={depotPos || [17.385, 78.4867]}
                    zoom={zoom}
                    className="absolute top-0 left-0 w-full h-full"
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors'
                    />
                    <FitMapBounds routes={routes} />

                    {depotStop && (
                      <Marker
                        position={[Number(depotStop.lat), Number(depotStop.lon)]}
                        icon={depotIcon}
                        zIndexOffset={1000}
                      >
                        <Tooltip sticky>Depot</Tooltip>
                      </Marker>
                    )}

                    {routes.map((vehicle, idx) => {
                      const encoded = vehicle.route?.routes?.[0]?.geometry;
                      const polyCoords = encoded ? polyline.decode(encoded) : [];
                      if (!polyCoords.length) return null;

                      const isSelected =
                        selectedTruck === null || selectedTruck === vehicle.id;

                      return (
                        <Polyline
                          key={`route-${vehicle.id}`}
                          positions={polyCoords.map(([lat, lon]) => [lat, lon])}
                          pathOptions={{
                            color: colors[idx % colors.length],
                            weight: isSelected ? 6 : 3,
                            opacity: isSelected ? 1 : 0.15,
                          }}
                        />
                      );
                    })}

                    {routes.map((vehicle) =>
                      vehicle.stops.map((stop, i) => {
                        if (
                          depotPos &&
                          isSameCoord(stop.lat, stop.lon, depotPos[0], depotPos[1])
                        )
                          return null;
                        const isSelected =
                          selectedTruck === null || selectedTruck === vehicle.id;
                        return (
                          <Marker
                            key={`${vehicle.id}-${i}`}
                            position={[stop.lat, stop.lon]}
                            opacity={isSelected ? 1 : 0.25}
                            eventHandlers={{
                              click: () =>
                                setSelectedTruck(
                                  selectedTruck === vehicle.id ? null : vehicle.id
                                ),
                            }}
                          >
                            <Tooltip sticky>
                              {stop.name || `Stop ${i + 1}`} (Truck {vehicle.id})
                            </Tooltip>
                          </Marker>
                        );
                      })
                    )}
                  </MapContainer>
                </div>

                <div className="p-4 border-t border-border bg-muted/30 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedTruck(null)}
                    >
                      Show All
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setZoom((z) => (z < 18 ? z + 1 : z))}
                    >
                      <Navigation className="w-4 h-4 mr-2" />
                      Zoom In
                    </Button>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Zoom: {zoom}x | Total Routes: {routes.length}
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {legendItems.length > 0 && (
                <div className="saas-card p-6">
                  <h4 className="font-semibold mb-4 flex items-center">
                    <div className="w-5 h-5 bg-primary/10 rounded mr-2 flex items-center justify-center">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                    </div>
                    Route Legend
                  </h4>

                  <div className="space-y-3">
                    {legendItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between cursor-pointer"
                        onClick={() =>
                          setSelectedTruck(
                            selectedTruck === item.id ? null : item.id
                          )
                        }
                      >
                        <div className="flex items-center space-x-3">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: item.color }}
                          ></div>
                          <span className="text-sm font-medium">{item.label}</span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {item.stops} {item.stops === 1 ? "stop" : "stops"}
                        </Badge>
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
