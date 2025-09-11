import { useState } from "react";
import { Upload, FileText, Truck, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const UploadSection = () => {
  const [dragActive, setDragActive] = useState(false);
  const [vehicles, setVehicles] = useState(3);
  const [capacity, setCapacity] = useState(100);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    // Handle file drop logic here
  };

  return (
    <section id="upload" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Upload Your Data
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Simply upload your delivery data and configure your fleet parameters. 
              Our AI will handle the rest.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* File Upload Card */}
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

              {/* Drag & Drop Area */}
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
                <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h4 className="text-lg font-medium mb-2">Drop your files here</h4>
                <p className="text-muted-foreground mb-4">
                  or click to browse your files
                </p>
                <Button variant="outline" className="font-medium">
                  Browse Files
                </Button>
              </div>

              <div className="mt-4 text-sm text-muted-foreground">
                Supported formats: CSV, XLSX. Maximum file size: 10MB
              </div>
            </div>

            {/* Configuration Card */}
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
                {/* Number of Vehicles */}
                <div>
                  <Label htmlFor="vehicles" className="text-base font-medium">
                    Number of Vehicles
                  </Label>
                  <div className="flex items-center mt-2 space-x-4">
                    <Input
                      id="vehicles"
                      type="number"
                      value={vehicles}
                      onChange={(e) => setVehicles(Number(e.target.value))}
                      className="w-24"
                      min="1"
                    />
                    <div className="flex items-center text-muted-foreground">
                      <Truck className="w-4 h-4 mr-1" />
                      <span>vehicles in fleet</span>
                    </div>
                  </div>
                </div>

                {/* Vehicle Capacity */}
                <div>
                  <Label htmlFor="capacity" className="text-base font-medium">
                    Vehicle Capacity (kg)
                  </Label>
                  <div className="flex items-center mt-2 space-x-4">
                    <Input
                      id="capacity"
                      type="number"
                      value={capacity}
                      onChange={(e) => setCapacity(Number(e.target.value))}
                      className="w-24"
                      min="1"
                    />
                    <div className="flex items-center text-muted-foreground">
                      <Package className="w-4 h-4 mr-1" />
                      <span>kg per vehicle</span>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <Button className="btn-primary w-full mt-8 text-lg py-3">
                  Submit & Optimize Routes
                </Button>
              </div>
            </div>
          </div>

          {/* Sample Data Format */}
          <div className="mt-12 saas-card p-6">
            <h4 className="text-lg font-semibold mb-4">Expected Data Format</h4>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h5 className="font-medium text-muted-foreground mb-2">Required Columns:</h5>
                <ul className="text-sm space-y-1">
                  <li>• Customer ID</li>
                  <li>• Latitude</li>
                  <li>• Longitude</li>
                  <li>• Demand (weight/volume)</li>
                </ul>
              </div>
              <div>
                <h5 className="font-medium text-muted-foreground mb-2">Optional Columns:</h5>
                <ul className="text-sm space-y-1">
                  <li>• Time Windows</li>
                  <li>• Service Time</li>
                  <li>• Priority Level</li>
                  <li>• Address</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default UploadSection;