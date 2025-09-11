"use client";

import { useState } from "react";
import { Map, Layers, Navigation, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapContainer, TileLayer, Marker, Polyline, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";

interface Stop {
  lat: number;
  lon: number;
}

interface Vehicle {
  id: number;
  stops: Stop[];
  route: any; // ORS response
}

interface VisualizationSectionProps {
  routes?: Vehicle[];
}

const VisualizationSection = ({ routes = [] }: VisualizationSectionProps) => {
  const [zoom, setZoom] = useState(12);

  // Dynamic legend for vehicles
  const legendItems = routes.length > 0
    ? routes.map((vehicle, idx) => ({
        color: ["bg-blue-500", "bg-green-500", "bg-purple-500", "bg-orange-500"][idx % 4],
        label: `Truck ${vehicle.id} Route`,
        stops: vehicle.stops?.length ?? 0,
      }))
    : [
        { color: "bg-blue-500", label: "Truck 1 Route", stops: 8 },
        { color: "bg-green-500", label: "Truck 2 Route", stops: 6 },
        { color: "bg-purple-500", label: "Truck 3 Route", stops: 7 },
        { color: "bg-red-500", label: "Depot", stops: 1 },
      ];

  return (
    <section id="visualization" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Route Visualization
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Interactive map showing optimized delivery routes with real-time insights 
              and detailed analytics for each vehicle.
            </p>
          </div>

          <div className="grid lg:grid-cols-4 gap-8">
            {/* Map Container */}
            <div className="lg:col-span-3">
              <div className="saas-card-lg overflow-hidden">
                {/* Map Header */}
                <div className="p-6 border-b border-border bg-muted/30">
                  <div className="flex items-center justify-between">
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
                    <Badge className="bg-success/10 text-success border-success/20">
                      <Zap className="w-3 h-3 mr-1" />
                      {routes.length > 0 ? "Optimized" : "Waiting"}
                    </Badge>
                  </div>
                </div>

                {/* Map */}
                <div className="relative h-96">
                  <MapContainer
                    center={[17.385, 78.4867]} // default center
                    zoom={zoom}
                    className="w-full h-full"
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors'
                    />

                    {/* Draw vehicle routes */}
                    {routes.map((vehicle, idx) => {
                      const geometry = vehicle.route?.routes?.[0]?.geometry?.coordinates || [];
                      const polyCoords = geometry.map(([lon, lat]: [number, number]) => [lat, lon]);
                      const colors = ["blue", "green", "purple", "orange"];
                      return (
                        <Polyline
                          key={vehicle.id}
                          positions={polyCoords}
                          color={colors[idx % colors.length]}
                        >
                          <Tooltip>Truck {vehicle.id}</Tooltip>
                        </Polyline>
                      );
                    })}

                    {/* Draw depot + stops */}
                    {routes.map((vehicle) =>
                      vehicle.stops?.map((stop: Stop, i: number) => (
                        <Marker key={`${vehicle.id}-${i}`} position={[stop.lat, stop.lon]}>
                          <Tooltip>
                            {i === 0 ? "Depot" : `Stop ${i} (Truck ${vehicle.id})`}
                          </Tooltip>
                        </Marker>
                      ))
                    )}
                  </MapContainer>
                </div>

                {/* Map Controls */}
                <div className="p-4 border-t border-border bg-muted/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        <Layers className="w-4 h-4 mr-2" />
                        Layers
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
            </div>

            {/* Sidebar Legend */}
            <div className="space-y-6">
              {/* Route Legend */}
              <div className="saas-card p-6">
                <h4 className="font-semibold mb-4 flex items-center">
                  <div className="w-5 h-5 bg-primary/10 rounded mr-2 flex items-center justify-center">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                  </div>
                  Route Legend
                </h4>

                <div className="space-y-3">
                  {legendItems.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-4 h-4 ${item.color} rounded-full`}></div>
                        <span className="text-sm font-medium">{item.label}</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {item.stops} {item.stops === 1 ? "stop" : "stops"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              {/* Map Stats */}
              <div className="saas-card p-6">
                <h4 className="font-semibold mb-4">Map Statistics</h4>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Stops</span>
                    <span className="font-semibold">
                      {routes.reduce((acc, v) => acc + (v.stops?.length ?? 0), 0) || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Coverage Area</span>
                    <span className="font-semibold">~45 km²</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Avg Route Length</span>
                    <span className="font-semibold">~52 km</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Efficiency</span>
                    <span className="font-semibold text-success">96%</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="saas-card p-6">
                <h4 className="font-semibold mb-4">Quick Actions</h4>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    Export Routes
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    Share Map
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    Print Directions
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VisualizationSection;
