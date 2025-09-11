"use client";

import { useState } from "react";
import { Upload, FileText, Truck, Package, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import VisualizationSection from "./VisualizationSection";

interface Stop {
  lat: number;
  lon: number;
}

interface Vehicle {
  id: number;
  stops: Stop[];
  route: any;
}

const UploadSection = () => {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [vehicles, setVehicles] = useState(3);
  const [capacity, setCapacity] = useState(100);
  const [loading, setLoading] = useState(false);
  const [routes, setRoutes] = useState<Vehicle[]>([]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      alert("Please upload a file before submitting.");
      return;
    }

    try {
      setLoading(true);

      // For now, mock reading depot & customer coordinates
      // Later, parse CSV/XLSX to extract actual lat/lon points
      const depot = { lat: 17.385, lon: 78.4867 }; // Example depot
      const customers: Stop[] = [
        { lat: 17.4458, lon: 78.4121 },
        { lat: 17.400, lon: 78.450 },
      ];

      const response = await fetch("http://localhost:5000/api/optimize_routes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          depot,
          customers,
          numVehicles: vehicles,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to optimize routes");
      }

      const data = await response.json();
      console.log("Optimization result:", data);

      // Store routes to render in VisualizationSection
      setRoutes(data.vehicles || []);
    } catch (error) {
      console.error(error);
      alert("An error occurred while optimizing routes.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <section id="upload" className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Section Header */}
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-foreground mb-4">
                Upload Your Data
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Upload your delivery data and configure your fleet parameters.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* File Upload */}
              <div className="saas-card-lg p-8">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mr-4">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">Data Upload</h3>
                    <p className="text-muted-foreground">CSV or Excel files supported</p>
                  </div>
                </div>

                <div
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
                    dragActive
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50 hover:bg-accent/50"
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    accept=".csv,.xlsx"
                    className="hidden"
                    id="file-upload"
                    onChange={handleFileChange}
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h4 className="text-lg font-medium mb-2">
                      {file ? `Selected: ${file.name}` : "Drop your files here"}
                    </h4>
                    <p className="text-muted-foreground mb-4">
                      or click to browse your files
                    </p>
                    <Button variant="outline" className="font-medium">
                      Browse Files
                    </Button>
                  </label>
                </div>
                <div className="mt-4 text-sm text-muted-foreground">
                  Supported formats: CSV, XLSX. Max size: 10MB
                </div>
              </div>

              {/* Fleet Configuration */}
              <div className="saas-card-lg p-8">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center mr-4">
                    <Truck className="w-6 h-6 text-success" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">Fleet Configuration</h3>
                    <p className="text-muted-foreground">Set your vehicle parameters</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <Label htmlFor="vehicles" className="text-base font-medium">
                      Number of Vehicles
                    </Label>
                    <Input
                      id="vehicles"
                      type="number"
                      value={vehicles}
                      onChange={(e) => setVehicles(Number(e.target.value))}
                      className="w-24 mt-2"
                      min={1}
                    />
                  </div>

                  <div>
                    <Label htmlFor="capacity" className="text-base font-medium">
                      Vehicle Capacity (kg)
                    </Label>
                    <Input
                      id="capacity"
                      type="number"
                      value={capacity}
                      onChange={(e) => setCapacity(Number(e.target.value))}
                      className="w-24 mt-2"
                      min={1}
                    />
                  </div>

                  <Button
                    className="btn-primary w-full mt-8 text-lg py-3"
                    onClick={handleSubmit}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Optimizing...
                      </>
                    ) : (
                      "Submit & Optimize Routes"
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Render Visualization Section after optimization */}
      {routes.length > 0 && <VisualizationSection routes={routes} />}
    </>
  );
};

export default UploadSection;
