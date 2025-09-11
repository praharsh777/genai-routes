import { TrendingDown, Clock, Fuel, DollarSign, Route, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const ResultsDashboard = () => {
  const metrics = [
    {
      label: "Total Distance",
      before: "245 km",
      after: "156 km",
      savings: "36%",
      icon: Route,
      color: "text-blue-600",
    },
    {
      label: "Travel Time",
      before: "8.5 hrs",
      after: "5.2 hrs",
      savings: "39%",
      icon: Clock,
      color: "text-purple-600",
    },
    {
      label: "Fuel Cost",
      before: "₹2,450",
      after: "₹1,560",
      savings: "36%",
      icon: Fuel,
      color: "text-orange-600",
    },
    {
      label: "Total Cost",
      before: "₹3,200",
      after: "₹2,080",
      savings: "35%",
      icon: DollarSign,
      color: "text-green-600",
    },
  ];

  const routes = [
    {
      vehicle: "Truck 1",
      stops: 8,
      route: "Depot → Location A → Location B → Location C → Depot",
      distance: "52 km",
      color: "bg-blue-100 text-blue-800",
    },
    {
      vehicle: "Truck 2",
      stops: 6,
      route: "Depot → Location D → Location E → Location F → Depot",
      distance: "48 km",
      color: "bg-green-100 text-green-800",
    },
    {
      vehicle: "Truck 3",
      stops: 7,
      route: "Depot → Location G → Location H → Location I → Depot",
      distance: "56 km",
      color: "bg-purple-100 text-purple-800",
    },
  ];

  return (
    <section id="optimization" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Optimization Results
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
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
                  {routes.map((route, index) => (
                    <div
                      key={index}
                      className="border border-border rounded-lg p-4 hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <Badge className={route.color}>
                            {route.vehicle}
                          </Badge>
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
                  ))}
                </div>
              </div>
            </div>

            {/* AI Explanation Panel */}
            <div className="saas-card-lg">
              <div className="p-6 border-b border-border">
                <h3 className="text-xl font-semibold">AI Insights</h3>
                <p className="text-muted-foreground mt-1">
                  Driver-friendly explanations
                </p>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                  <h4 className="font-medium text-primary mb-2">🚛 Truck 1 Route</h4>
                  <p className="text-sm text-muted-foreground">
                    Start at the depot and head northeast to serve the cluster of customers 
                    in Zone A. This route minimizes backtracking and takes advantage of 
                    one-way streets for efficiency.
                  </p>
                </div>
                
                <div className="bg-success/5 border border-success/20 rounded-lg p-4">
                  <h4 className="font-medium text-success mb-2">🚛 Truck 2 Route</h4>
                  <p className="text-sm text-muted-foreground">
                    Focus on the western district with time-sensitive deliveries. 
                    Priority customers are served first to meet delivery windows.
                  </p>
                </div>
                
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h4 className="font-medium text-purple-600 mb-2">🚛 Truck 3 Route</h4>
                  <p className="text-sm text-muted-foreground">
                    Handle the southern route with bulk deliveries. The sequence 
                    optimizes for vehicle capacity and reduces total travel time.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ResultsDashboard;