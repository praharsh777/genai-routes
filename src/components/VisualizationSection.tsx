import { Map, Layers, Navigation, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const VisualizationSection = () => {
  const legendItems = [
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
                      Optimized
                    </Badge>
                  </div>
                </div>

                {/* Map Placeholder */}
                <div className="relative h-96 bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
                  {/* Simulated Map Background */}
                  <div className="absolute inset-0 opacity-20">
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-success/20"></div>
                    {/* Grid Pattern */}
                    <div 
                      className="absolute inset-0"
                      style={{
                        backgroundImage: "url('data:image/svg+xml;charset=utf-8,%3Csvg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\"%3E%3Cpath d=\"M0 0h100v100H0z\" fill=\"none\" stroke=\"%23cbd5e1\" stroke-width=\".5\"/%3E%3C/svg%3E')",
                        backgroundSize: "20px 20px"
                      }}
                    ></div>
                  </div>

                  {/* Route Lines and Markers */}
                  <div className="relative z-10 w-full h-full p-8">
                    {/* Depot */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <div className="w-6 h-6 bg-red-500 rounded-full border-4 border-white shadow-lg"></div>
                      <div className="text-xs font-medium mt-1 text-center">Depot</div>
                    </div>

                    {/* Route 1 (Blue) */}
                    <div className="absolute top-1/4 left-1/4">
                      <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow"></div>
                    </div>
                    <div className="absolute top-1/3 left-1/5">
                      <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow"></div>
                    </div>

                    {/* Route 2 (Green) */}
                    <div className="absolute top-3/4 right-1/4">
                      <div className="w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow"></div>
                    </div>
                    <div className="absolute top-2/3 right-1/5">
                      <div className="w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow"></div>
                    </div>

                    {/* Route 3 (Purple) */}
                    <div className="absolute bottom-1/4 left-3/4">
                      <div className="w-4 h-4 bg-purple-500 rounded-full border-2 border-white shadow"></div>
                    </div>
                    <div className="absolute bottom-1/3 left-2/3">
                      <div className="w-4 h-4 bg-purple-500 rounded-full border-2 border-white shadow"></div>
                    </div>
                  </div>

                  {/* Map Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/5">
                    <div className="text-center">
                      <Map className="w-12 h-12 text-primary mx-auto mb-3 opacity-60" />
                      <p className="text-foreground font-medium">
                        Interactive Map Loading...
                      </p>
                      <p className="text-muted-foreground text-sm mt-1">
                        React-Leaflet integration ready
                      </p>
                    </div>
                  </div>
                </div>

                {/* Map Controls */}
                <div className="p-4 border-t border-border bg-muted/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        <Layers className="w-4 h-4 mr-2" />
                        Layers
                      </Button>
                      <Button variant="outline" size="sm">
                        <Navigation className="w-4 h-4 mr-2" />
                        Center
                      </Button>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Zoom: 12x | Total Routes: 3 | Coverage: 156 km
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
                        {item.stops} {item.stops === 1 ? 'stop' : 'stops'}
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
                    <span className="font-semibold">21</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Coverage Area</span>
                    <span className="font-semibold">45 km²</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Avg Route Length</span>
                    <span className="font-semibold">52 km</span>
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