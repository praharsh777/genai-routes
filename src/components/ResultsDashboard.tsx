import { TrendingDown, Clock, Fuel, DollarSign, Route, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Vehicle {
  id: number;
  stops: any[];
  route?: {
    routes?: { summary?: { distance?: number; duration?: number } }[];
  };
}

interface BaselineMetrics {
  distance: number; // in meters
  duration: number; // in seconds
}

interface ResultsDashboardProps {
  vehicles?: Vehicle[];
  baseline?: BaselineMetrics;
}

const ResultsDashboard = ({ vehicles = [], baseline }: ResultsDashboardProps) => {
  // Compute optimized totals
  const totalDistance = vehicles.reduce(
    (sum, v) => sum + (v.route?.routes?.[0]?.summary?.distance || 0),
    0
  );
  const totalTime = vehicles.reduce(
    (sum, v) => sum + (v.route?.routes?.[0]?.summary?.duration || 0),
    0
  );

  // Compute savings percentages (if baseline is provided)
  const distanceSavings = baseline
    ? Math.max(0, Math.round((1 - totalDistance / baseline.distance) * 100))
    : 0;
  const timeSavings = baseline
    ? Math.max(0, Math.round((1 - totalTime / baseline.duration) * 100))
    : 0;

  const metrics = [
    {
      label: "Total Distance",
      before: baseline ? `${(baseline.distance / 1000).toFixed(2)} km` : "N/A",
      after: `${(totalDistance / 1000).toFixed(2)} km`,
      savings: `${distanceSavings}%`,
      icon: Route,
      color: "text-blue-600",
    },
    {
      label: "Travel Time",
      before: baseline ? `${(baseline.duration / 3600).toFixed(2)} hrs` : "N/A",
      after: `${(totalTime / 3600).toFixed(2)} hrs`,
      savings: `${timeSavings}%`,
      icon: Clock,
      color: "text-purple-600",
    },
    {
      label: "Fuel Cost",
      before: baseline ? `₹${((baseline.distance / 1000) * 10).toFixed(0)}` : "N/A",
      after: `₹${((totalDistance / 1000) * 10).toFixed(0)}`,
      savings: `${distanceSavings}%`,
      icon: Fuel,
      color: "text-orange-600",
    },
    {
      label: "Total Cost",
      before: baseline ? `₹${((baseline.distance / 1000) * 13).toFixed(0)}` : "N/A",
      after: `₹${((totalDistance / 1000) * 13).toFixed(0)}`,
      savings: `${distanceSavings}%`,
      icon: DollarSign,
      color: "text-green-600",
    },
  ];

  const routes = vehicles.map((v, idx) => ({
    vehicle: `Truck ${v.id}`,
    stops: v.stops.length,
    route:
      v.stops.map((s, i) => s.name || `Stop ${i + 1}`).join(" → ") || "No stops",
    distance: `${((v.route?.routes?.[0]?.summary?.distance || 0) / 1000).toFixed(2)} km`,
    color: ["bg-blue-100 text-blue-800","bg-green-100 text-green-800","bg-purple-100 text-purple-800"][idx % 3],
  }));

  return (
    <section id="optimization" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Optimization Results
            </h2>
            <p className="text-xl text-muted-foreground ma
            x-w-2xl mx-auto">
              See the dramatic improvements our AI optimization delivers for your logistics operations.
            </p>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {metrics.map((metric, index) => (
              <div key={index} className="metric-card">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg bg-background ${metric.color}`}>
                    <metric.icon className="w-6 h-6" />
                  </div>
                  <Badge className="btn-success text-xs font-semibold">
                    -{metric.savings}
                    <TrendingDown className="w-3 h-3 ml-1" />
                  </Badge>
                </div>
                <h3 className="font-semibold text-foreground mb-2">{metric.label}</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Before:</span>
                    <span className="text-sm font-medium line-through text-muted-foreground">
                      {metric.before}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">After:</span>
                    <span className="text-lg font-bold text-success">
                      {metric.after}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Routes Table */}
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="saas-card-lg">
                <div className="p-6 border-b border-border">
                  <h3 className="text-xl font-semibold flex items-center">
                    <Route className="w-5 h-5 mr-2 text-primary" />
                    Optimized Routes
                  </h3>
                  <p className="text-muted-foreground mt-1">
                    Vehicle assignments and route sequences
                  </p>
                </div>
                <div className="p-6 space-y-4">
                  {routes.length > 0 ? routes.map((route, index) => (
                    <div
                      key={index}
                      className="border border-border rounded-lg p-4 hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <Badge className={route.color}>{route.vehicle}</Badge>
                          <div className="text-sm text-muted-foreground">
                            {route.stops} stops • {route.distance}
                          </div>
                        </div>
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div className="text-sm font-mono text-foreground bg-muted/50 p-3 rounded border">
                        {route.route}
                      </div>
                    </div>
                  )) : (
                    <p className="text-muted-foreground">No routes calculated yet waittttt.</p>
                  )}
                </div>
              </div>
            </div>

            {/* AI Explanation Panel */}
            <div className="saas-card-lg">
              <div className="p-6 border-b border-border">
                <h3 className="text-xl font-semibold">AI Insights</h3>
                <p className="text-muted-foreground mt-1">Driver-friendly explanations</p>
              </div>
              <div className="p-6 space-y-4">
                {vehicles.length > 0 ? vehicles.map((v, idx) => (
                  <div key={v.id} className={`border rounded-lg p-4 ${idx % 3 === 0 ? "bg-primary/5 border-primary/20" : idx % 3 === 1 ? "bg-success/5 border-success/20" : "bg-purple-50 border-purple-200"}`}>
                    <h4 className={`font-medium mb-2 ${idx % 3 === 0 ? "text-primary" : idx % 3 === 1 ? "text-success" : "text-purple-600"}`}>
                      🚛 Truck {v.id} Route
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {v.stops.map((s, i) => s.name || `Stop ${i + 1}`).join(", ")}
                    </p>
                  </div>
                )) : (
                  <p className="text-muted-foreground">Insights will update once optimization is complete.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ResultsDashboard;
