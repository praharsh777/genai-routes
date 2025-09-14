import { useEffect, useState } from "react";
import {
  TrendingDown,
  Clock,
  Fuel,
  DollarSign,
  Route,
  MapPin,
  Send,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Vehicle {
  id: number;
  stops: any[];
  route?: {
    routes?: { summary?: { distance?: number; duration?: number } }[];
  };
}

interface BaselineMetrics {
  distance: number;
  duration: number;
}

interface ResultsDashboardProps {
  vehicles?: Vehicle[];
  baseline?: BaselineMetrics;
}

interface Insight {
  vehicle: string;
  explanation: string;
}

const ResultsDashboard = ({ vehicles = [], baseline }: ResultsDashboardProps) => {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [chatHistory, setChatHistory] = useState<{ role: "user" | "ai"; text: string }[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  const speakText = (text: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    }
  };

  const totalDistance = vehicles.reduce(
    (sum, v) => sum + (v.route?.routes?.[0]?.summary?.distance || 0),
    0
  );
  const totalTime = vehicles.reduce(
    (sum, v) => sum + (v.route?.routes?.[0]?.summary?.duration || 0),
    0
  );

  const distanceSavings = baseline
    ? Math.max(0, Math.round((1 - totalDistance / baseline.distance) * 100))
    : null;
  const timeSavings = baseline
    ? Math.max(0, Math.round((1 - totalTime / baseline.duration) * 100))
    : null;

  const metrics = [
    {
      label: "Total Distance",
      before: baseline ? `${(baseline.distance / 1000).toFixed(2)} km` : "N/A",
      after: `${(totalDistance / 1000).toFixed(2)} km`,
      savings: distanceSavings,
      icon: Route,
      color: "text-blue-600 dark:text-blue-400",
    },
    {
      label: "Travel Time",
      before: baseline ? `${(baseline.duration / 3600).toFixed(2)} hrs` : "N/A",
      after: `${(totalTime / 3600).toFixed(2)} hrs`,
      savings: timeSavings,
      icon: Clock,
      color: "text-purple-600 dark:text-purple-400",
    },
    {
      label: "Fuel Cost",
      before: baseline ? `₹${((baseline.distance / 1000) * 10).toFixed(0)}` : "N/A",
      after: `₹${((totalDistance / 1000) * 10).toFixed(0)}`,
      savings: distanceSavings,
      icon: Fuel,
      color: "text-orange-600 dark:text-orange-400",
    },
    {
      label: "Total Cost",
      before: baseline ? `₹${((baseline.distance / 1000) * 13).toFixed(0)}` : "N/A",
      after: `₹${((totalDistance / 1000) * 13).toFixed(0)}`,
      savings: distanceSavings,
      icon: DollarSign,
      color: "text-green-600 dark:text-green-400",
    },
  ];

  const routes = vehicles.map((v, idx) => {
    const stopNames = v.stops.map((s, i) => s.name || `Stop ${i + 1}`);
    let displayRoute = stopNames.length > 3
      ? `${stopNames[0]} → ... → ${stopNames[stopNames.length - 1]}`
      : stopNames.join(" → ") || "No stops";

    const colors = [
      "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
      "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
      "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100",
    ];

    return {
      vehicle: `Truck ${v.id}`,
      stops: v.stops.length,
      route: displayRoute,
      distance: `${((v.route?.routes?.[0]?.summary?.distance || 0) / 1000).toFixed(2)} km`,
      color: colors[idx % 3],
    };
  });

  useEffect(() => {
    const fetchInsights = async () => {
      if (vehicles.length === 0) return;
      setLoadingInsights(true);
      try {
        const res = await fetch("http://127.0.0.1:5000/api/explain_routes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ vehicles }),
        });
        const data = await res.json();
        setInsights(Array.isArray(data.insights) ? data.insights : []);
      } catch (err) {
        console.error("Failed to fetch insights:", err);
      } finally {
        setLoadingInsights(false);
      }
    };
    fetchInsights();
  }, [vehicles]);

  const sendChat = async () => {
    if (!chatInput.trim()) return;
    const userMsg = { role: "user" as const, text: chatInput };
    setChatHistory((h) => [...h, userMsg]);
    setChatLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:5000/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vehicles, baseline, question: chatInput }),
      });
      const data = await res.json();
      if (data.answer) setChatHistory((h) => [...h, { role: "ai", text: data.answer }]);
    } catch (err) {
      console.error("Chat error:", err);
      setChatHistory((h) => [...h, { role: "ai", text: "⚠️ Failed to get AI response." }]);
    } finally {
      setChatLoading(false);
      setChatInput("");
    }
  };

  return (
    <section id="optimization" className="py-20 bg-muted/30 dark:bg-[#111111]">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-foreground dark:text-white mb-4">Optimization Results</h2>
            <p className="text-xl text-muted-foreground dark:text-gray-300 max-w-2xl mx-auto">
              See the dramatic improvements our AI optimization delivers for your logistics operations.
            </p>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {metrics.map((metric, index) => (
              <div
                key={index}
                className="metric-card p-4 rounded-lg shadow bg-white dark:bg-[#1a1a1a]"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg ${metric.color} bg-opacity-10 dark:bg-opacity-20`}>
                    <metric.icon className="w-6 h-6" />
                  </div>
                  {metric.savings !== null ? (
                    <Badge className="btn-success text-xs font-semibold">
                      -{metric.savings}% <TrendingDown className="w-3 h-3 ml-1" />
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-xs font-semibold">N/A</Badge>
                  )}
                </div>
                <h3 className="font-semibold text-foreground dark:text-white mb-2">{metric.label}</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground dark:text-gray-400">Before:</span>
                    <span className="text-sm font-medium line-through text-muted-foreground dark:text-gray-500">{metric.before}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground dark:text-gray-400">After:</span>
                    <span className="text-lg font-bold text-success dark:text-green-400">{metric.after}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Routes Table + AI Insights */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* AI Insights + Chat */}
            <div className="lg:col-span-2">
              <div className="saas-card-lg bg-white dark:bg-[#1a1a1a] rounded-lg shadow">
                <div className="p-6 border-b border-border dark:border-gray-700">
                  <h3 className="text-xl font-semibold text-foreground dark:text-white">AI Insights</h3>
                  <p className="text-muted-foreground dark:text-gray-300 mt-1">Driver-friendly explanations and chat support</p>
                </div>
                <div className="p-6 space-y-4">
                  {loadingInsights ? (
                    <p className="text-muted-foreground dark:text-gray-400 italic">Generating insights...</p>
                  ) : insights.length > 0 ? (
                    insights.map((insight, idx) => (
                      <div
                        key={idx}
                        className={`border rounded-lg p-4 cursor-pointer ${
                          idx % 3 === 0
                            ? "bg-primary/5 border-primary/20 dark:bg-[#0b1a2b] dark:border-[#117a65]"
                            : idx % 3 === 1
                            ? "bg-success/5 border-success/20 dark:bg-[#0a2e2f] dark:border-[#1f5c4f]"
                            : "bg-purple-50 border-purple-200 dark:bg-[#111111] dark:border-[#444]"
                        }`}
                        onClick={() => speakText(insight.explanation)}
                      >
                        <h4
                          className={`font-medium mb-2 ${
                            idx % 3 === 0
                              ? "text-primary dark:text-primary/80"
                              : idx % 3 === 1
                              ? "text-success dark:text-success/80"
                              : "text-purple-600 dark:text-purple-300"
                          }`}
                        >
                          {insight.vehicle}
                        </h4>
                        <p className="text-sm text-muted-foreground dark:text-gray-300">{insight.explanation}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground dark:text-gray-400">Insights will update once optimization is complete.</p>
                  )}

                  {/* Chat Section */}
                  <div className="border-t border-border dark:border-gray-700 pt-4">
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                      {chatHistory.map((msg, i) => (
                        <div
                          key={i}
                          className={`p-2 rounded-lg text-sm cursor-pointer ${
                            msg.role === "user"
                              ? "bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100 self-end"
                              : "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100"
                          }`}
                          onClick={() => speakText(msg.text)}
                        >
                          <strong>{msg.role === "user" ? "You" : "AI"}:</strong> {msg.text}
                        </div>
                      ))}
                      {chatLoading && <p className="italic text-muted-foreground dark:text-gray-400">AI is typing…</p>}
                    </div>

                    <div className="flex mt-3 gap-2">
                      <Input
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder="Ask about this route..."
                        onKeyDown={(e) => e.key === "Enter" && sendChat()}
                        className="dark:bg-[#111111] dark:text-white"
                      />
                      <Button onClick={sendChat} disabled={chatLoading}>
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Routes Table */}
            <div className="lg:col-span-1">
              <div className="saas-card-lg bg-white dark:bg-[#1a1a1a] rounded-lg shadow">
                <div className="p-6 border-b border-border dark:border-gray-700">
                  <h3 className="text-xl font-semibold flex items-center text-foreground dark:text-white">
                    <Route className="w-5 h-5 mr-2 text-primary dark:text-primary/80" />
                    Optimized Routes
                  </h3>
                  <p className="text-muted-foreground dark:text-gray-300 mt-1">Vehicle assignments and route sequences</p>
                </div>
                <div className="p-6 space-y-4">
                  {routes.length > 0 ? (
                    routes.map((route, index) => (
                      <div
                        key={index}
                        className="border border-border dark:border-gray-700 rounded-lg p-4 hover:bg-accent/50 dark:hover:bg-accent/30 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <Badge className={route.color}>{route.vehicle}</Badge>
                            <div className="text-sm text-muted-foreground dark:text-gray-300">
                              {route.stops} stops • {route.distance}
                            </div>
                          </div>
                          <MapPin className="w-4 h-4 text-muted-foreground dark:text-gray-400" />
                        </div>
                        <div className="text-sm font-mono text-foreground dark:text-white bg-muted/50 dark:bg-[#1a1a1a] p-3 rounded border dark:border-gray-700">
                          {route.route}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground dark:text-gray-400">No routes calculated yet. Please run optimization first.</p>
                  )}
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
