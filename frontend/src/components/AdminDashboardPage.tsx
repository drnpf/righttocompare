import { useState } from "react";
import { LayoutDashboard, FileEdit, Globe, Upload, Plus, Trash2, Save, Play, Clock, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner@2.0.3";

type AdminView = "dashboard" | "manual" | "scraping";

interface ScrapingJob {
  id: string;
  source: string;
  status: "running" | "completed" | "failed";
  phonesFound: number;
  timestamp: string;
  duration?: string;
}

interface PhoneSpecForm {
  name: string;
  brand: string;
  image: string;
  releaseDate: string;
  price: string;
  // Display
  screenSize: string;
  resolution: string;
  refreshRate: string;
  displayType: string;
  // Performance
  processor: string;
  ram: string;
  storage: string;
  // Camera
  mainCamera: string;
  frontCamera: string;
  videoRecording: string;
  // Battery
  batteryCapacity: string;
  chargingSpeed: string;
  wirelessCharging: string;
  // Design
  dimensions: string;
  weight: string;
  colors: string;
  materials: string;
}

const emptyForm: PhoneSpecForm = {
  name: "",
  brand: "",
  image: "",
  releaseDate: "",
  price: "",
  screenSize: "",
  resolution: "",
  refreshRate: "",
  displayType: "",
  processor: "",
  ram: "",
  storage: "",
  mainCamera: "",
  frontCamera: "",
  videoRecording: "",
  batteryCapacity: "",
  chargingSpeed: "",
  wirelessCharging: "",
  dimensions: "",
  weight: "",
  colors: "",
  materials: ""
};

export default function AdminDashboardPage() {
  const [currentView, setCurrentView] = useState<AdminView>("dashboard");
  const [formData, setFormData] = useState<PhoneSpecForm>(emptyForm);
  const [scrapingJobs, setScrapingJobs] = useState<ScrapingJob[]>([
    {
      id: "1",
      source: "GSMArena",
      status: "completed",
      phonesFound: 12,
      timestamp: "2025-11-02 14:23",
      duration: "2m 34s"
    },
    {
      id: "2",
      source: "PhoneArena",
      status: "completed",
      phonesFound: 8,
      timestamp: "2025-11-02 10:15",
      duration: "1m 52s"
    },
    {
      id: "3",
      source: "TechRadar",
      status: "failed",
      phonesFound: 0,
      timestamp: "2025-11-01 16:40",
      duration: "0m 15s"
    }
  ]);
  const [selectedSource, setSelectedSource] = useState("GSMArena");
  const [isScrapingRunning, setIsScrapingRunning] = useState(false);

  const handleInputChange = (field: keyof PhoneSpecForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveSpecs = () => {
    if (!formData.name || !formData.brand) {
      toast.error("Please fill in at least the phone name and brand");
      return;
    }

    // In a real app, this would save to database
    toast.success(`Specifications for ${formData.name} saved successfully!`);
    setFormData(emptyForm);
  };

  const handleStartScraping = () => {
    setIsScrapingRunning(true);
    toast.info(`Starting web scraping from ${selectedSource}...`);

    // Simulate scraping job
    setTimeout(() => {
      const newJob: ScrapingJob = {
        id: Date.now().toString(),
        source: selectedSource,
        status: "running",
        phonesFound: 0,
        timestamp: new Date().toLocaleString('en-US', { 
          year: 'numeric', 
          month: '2-digit', 
          day: '2-digit', 
          hour: '2-digit', 
          minute: '2-digit' 
        })
      };
      setScrapingJobs(prev => [newJob, ...prev]);

      // Simulate completion
      setTimeout(() => {
        const phonesFound = Math.floor(Math.random() * 15) + 5;
        setScrapingJobs(prev => prev.map(job => 
          job.id === newJob.id 
            ? { ...job, status: "completed", phonesFound, duration: "2m 15s" }
            : job
        ));
        setIsScrapingRunning(false);
        toast.success(`Scraping completed! Found ${phonesFound} new phones.`);
      }, 5000);
    }, 500);
  };

  const renderSidebar = () => (
    <div className="w-64 bg-white border-r border-[#e5e5e5] min-h-screen">
      <div className="p-6 border-b border-[#e5e5e5]">
        <h2 className="text-[#2c3968]">Admin Panel</h2>
      </div>

      <nav className="p-4">
        <button
          onClick={() => setCurrentView("dashboard")}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all mb-2 ${
            currentView === "dashboard"
              ? "bg-gradient-to-r from-[#2c3968] to-[#3d4a7a] text-white shadow-md"
              : "text-[#666] hover:bg-[#f7f7f7] hover:text-[#2c3968]"
          }`}
        >
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </button>

        <button
          onClick={() => setCurrentView("manual")}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all mb-2 ${
            currentView === "manual"
              ? "bg-gradient-to-r from-[#2c3968] to-[#3d4a7a] text-white shadow-md"
              : "text-[#666] hover:bg-[#f7f7f7] hover:text-[#2c3968]"
          }`}
        >
          <FileEdit size={20} />
          <span>Manual Specs</span>
        </button>

        <button
          onClick={() => setCurrentView("scraping")}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
            currentView === "scraping"
              ? "bg-gradient-to-r from-[#2c3968] to-[#3d4a7a] text-white shadow-md"
              : "text-[#666] hover:bg-[#f7f7f7] hover:text-[#2c3968]"
          }`}
        >
          <Globe size={20} />
          <span>Web Scraping</span>
        </button>
      </nav>
    </div>
  );

  const renderDashboard = () => (
    <div>
      <div className="mb-8">
        <h1 className="text-[#2c3968] mb-2">Dashboard Overview</h1>
        <p className="text-[#666]">Monitor and manage phone specifications</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-[#e5e5e5] p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-[#2c3968] to-[#3d4a7a] rounded-lg flex items-center justify-center">
              <FileEdit className="text-white" size={24} />
            </div>
          </div>
          <h3 className="text-[#1e1e1e] mb-1">Total Phones</h3>
          <p className="text-[#666]">125 devices</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-[#e5e5e5] p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-[#4caf50] to-[#66bb6a] rounded-lg flex items-center justify-center">
              <CheckCircle className="text-white" size={24} />
            </div>
          </div>
          <h3 className="text-[#1e1e1e] mb-1">Recent Updates</h3>
          <p className="text-[#666]">18 this week</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-[#e5e5e5] p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-[#ff9800] to-[#ffa726] rounded-lg flex items-center justify-center">
              <Globe className="text-white" size={24} />
            </div>
          </div>
          <h3 className="text-[#1e1e1e] mb-1">Scraping Jobs</h3>
          <p className="text-[#666]">{scrapingJobs.length} total</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-[#e5e5e5] p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-[#f44336] to-[#e57373] rounded-lg flex items-center justify-center">
              <Clock className="text-white" size={24} />
            </div>
          </div>
          <h3 className="text-[#1e1e1e] mb-1">Pending Review</h3>
          <p className="text-[#666]">5 items</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-[#e5e5e5] p-6">
        <h2 className="text-[#2c3968] mb-4">Recent Scraping Jobs</h2>
        <div className="space-y-3">
          {scrapingJobs.slice(0, 5).map((job) => (
            <div key={job.id} className="flex items-center justify-between p-4 bg-[#f7f7f7] rounded-lg">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  job.status === "completed" ? "bg-green-100" :
                  job.status === "running" ? "bg-blue-100" : "bg-red-100"
                }`}>
                  {job.status === "completed" ? <CheckCircle className="text-green-600" size={20} /> :
                   job.status === "running" ? <Clock className="text-blue-600" size={20} /> :
                   <XCircle className="text-red-600" size={20} />}
                </div>
                <div>
                  <p className="text-[#1e1e1e]">{job.source}</p>
                  <p className="text-[#999]">{job.timestamp}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[#1e1e1e]">{job.phonesFound} phones</p>
                <p className="text-[#999]">{job.duration}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderManualSpecs = () => (
    <div>
      <div className="mb-8">
        <h1 className="text-[#2c3968] mb-2">Manual Specification Entry</h1>
        <p className="text-[#666]">Add or edit phone specifications manually</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-[#e5e5e5] p-8">
        <div className="space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-[#2c3968] mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-2 text-[#1e1e1e]">Phone Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="e.g., Galaxy S24 Ultra"
                  className="w-full px-4 py-3 rounded-lg border border-[#d9d9d9] focus:border-[#2c3968] focus:outline-none focus:ring-2 focus:ring-[#2c3968]/20 transition-all"
                />
              </div>
              <div>
                <label className="block mb-2 text-[#1e1e1e]">Brand *</label>
                <input
                  type="text"
                  value={formData.brand}
                  onChange={(e) => handleInputChange("brand", e.target.value)}
                  placeholder="e.g., Samsung"
                  className="w-full px-4 py-3 rounded-lg border border-[#d9d9d9] focus:border-[#2c3968] focus:outline-none focus:ring-2 focus:ring-[#2c3968]/20 transition-all"
                />
              </div>
              <div>
                <label className="block mb-2 text-[#1e1e1e]">Release Date</label>
                <input
                  type="text"
                  value={formData.releaseDate}
                  onChange={(e) => handleInputChange("releaseDate", e.target.value)}
                  placeholder="e.g., January 2024"
                  className="w-full px-4 py-3 rounded-lg border border-[#d9d9d9] focus:border-[#2c3968] focus:outline-none focus:ring-2 focus:ring-[#2c3968]/20 transition-all"
                />
              </div>
              <div>
                <label className="block mb-2 text-[#1e1e1e]">Price</label>
                <input
                  type="text"
                  value={formData.price}
                  onChange={(e) => handleInputChange("price", e.target.value)}
                  placeholder="e.g., $1,199"
                  className="w-full px-4 py-3 rounded-lg border border-[#d9d9d9] focus:border-[#2c3968] focus:outline-none focus:ring-2 focus:ring-[#2c3968]/20 transition-all"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block mb-2 text-[#1e1e1e]">Image URL</label>
                <input
                  type="text"
                  value={formData.image}
                  onChange={(e) => handleInputChange("image", e.target.value)}
                  placeholder="https://..."
                  className="w-full px-4 py-3 rounded-lg border border-[#d9d9d9] focus:border-[#2c3968] focus:outline-none focus:ring-2 focus:ring-[#2c3968]/20 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Display Specifications */}
          <div>
            <h3 className="text-[#2c3968] mb-4">Display</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-2 text-[#1e1e1e]">Screen Size</label>
                <input
                  type="text"
                  value={formData.screenSize}
                  onChange={(e) => handleInputChange("screenSize", e.target.value)}
                  placeholder="e.g., 6.8 inches"
                  className="w-full px-4 py-3 rounded-lg border border-[#d9d9d9] focus:border-[#2c3968] focus:outline-none focus:ring-2 focus:ring-[#2c3968]/20 transition-all"
                />
              </div>
              <div>
                <label className="block mb-2 text-[#1e1e1e]">Resolution</label>
                <input
                  type="text"
                  value={formData.resolution}
                  onChange={(e) => handleInputChange("resolution", e.target.value)}
                  placeholder="e.g., 1440 x 3120"
                  className="w-full px-4 py-3 rounded-lg border border-[#d9d9d9] focus:border-[#2c3968] focus:outline-none focus:ring-2 focus:ring-[#2c3968]/20 transition-all"
                />
              </div>
              <div>
                <label className="block mb-2 text-[#1e1e1e]">Refresh Rate</label>
                <input
                  type="text"
                  value={formData.refreshRate}
                  onChange={(e) => handleInputChange("refreshRate", e.target.value)}
                  placeholder="e.g., 120Hz"
                  className="w-full px-4 py-3 rounded-lg border border-[#d9d9d9] focus:border-[#2c3968] focus:outline-none focus:ring-2 focus:ring-[#2c3968]/20 transition-all"
                />
              </div>
              <div>
                <label className="block mb-2 text-[#1e1e1e]">Display Type</label>
                <input
                  type="text"
                  value={formData.displayType}
                  onChange={(e) => handleInputChange("displayType", e.target.value)}
                  placeholder="e.g., AMOLED"
                  className="w-full px-4 py-3 rounded-lg border border-[#d9d9d9] focus:border-[#2c3968] focus:outline-none focus:ring-2 focus:ring-[#2c3968]/20 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Performance Specifications */}
          <div>
            <h3 className="text-[#2c3968] mb-4">Performance</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-2 text-[#1e1e1e]">Processor</label>
                <input
                  type="text"
                  value={formData.processor}
                  onChange={(e) => handleInputChange("processor", e.target.value)}
                  placeholder="e.g., Snapdragon 8 Gen 3"
                  className="w-full px-4 py-3 rounded-lg border border-[#d9d9d9] focus:border-[#2c3968] focus:outline-none focus:ring-2 focus:ring-[#2c3968]/20 transition-all"
                />
              </div>
              <div>
                <label className="block mb-2 text-[#1e1e1e]">RAM</label>
                <input
                  type="text"
                  value={formData.ram}
                  onChange={(e) => handleInputChange("ram", e.target.value)}
                  placeholder="e.g., 12GB"
                  className="w-full px-4 py-3 rounded-lg border border-[#d9d9d9] focus:border-[#2c3968] focus:outline-none focus:ring-2 focus:ring-[#2c3968]/20 transition-all"
                />
              </div>
              <div>
                <label className="block mb-2 text-[#1e1e1e]">Storage</label>
                <input
                  type="text"
                  value={formData.storage}
                  onChange={(e) => handleInputChange("storage", e.target.value)}
                  placeholder="e.g., 256GB / 512GB / 1TB"
                  className="w-full px-4 py-3 rounded-lg border border-[#d9d9d9] focus:border-[#2c3968] focus:outline-none focus:ring-2 focus:ring-[#2c3968]/20 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Camera Specifications */}
          <div>
            <h3 className="text-[#2c3968] mb-4">Camera</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-2 text-[#1e1e1e]">Main Camera</label>
                <input
                  type="text"
                  value={formData.mainCamera}
                  onChange={(e) => handleInputChange("mainCamera", e.target.value)}
                  placeholder="e.g., 200MP + 50MP + 12MP + 10MP"
                  className="w-full px-4 py-3 rounded-lg border border-[#d9d9d9] focus:border-[#2c3968] focus:outline-none focus:ring-2 focus:ring-[#2c3968]/20 transition-all"
                />
              </div>
              <div>
                <label className="block mb-2 text-[#1e1e1e]">Front Camera</label>
                <input
                  type="text"
                  value={formData.frontCamera}
                  onChange={(e) => handleInputChange("frontCamera", e.target.value)}
                  placeholder="e.g., 12MP"
                  className="w-full px-4 py-3 rounded-lg border border-[#d9d9d9] focus:border-[#2c3968] focus:outline-none focus:ring-2 focus:ring-[#2c3968]/20 transition-all"
                />
              </div>
              <div>
                <label className="block mb-2 text-[#1e1e1e]">Video Recording</label>
                <input
                  type="text"
                  value={formData.videoRecording}
                  onChange={(e) => handleInputChange("videoRecording", e.target.value)}
                  placeholder="e.g., 8K@30fps, 4K@120fps"
                  className="w-full px-4 py-3 rounded-lg border border-[#d9d9d9] focus:border-[#2c3968] focus:outline-none focus:ring-2 focus:ring-[#2c3968]/20 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Battery Specifications */}
          <div>
            <h3 className="text-[#2c3968] mb-4">Battery</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-2 text-[#1e1e1e]">Battery Capacity</label>
                <input
                  type="text"
                  value={formData.batteryCapacity}
                  onChange={(e) => handleInputChange("batteryCapacity", e.target.value)}
                  placeholder="e.g., 5000mAh"
                  className="w-full px-4 py-3 rounded-lg border border-[#d9d9d9] focus:border-[#2c3968] focus:outline-none focus:ring-2 focus:ring-[#2c3968]/20 transition-all"
                />
              </div>
              <div>
                <label className="block mb-2 text-[#1e1e1e]">Charging Speed</label>
                <input
                  type="text"
                  value={formData.chargingSpeed}
                  onChange={(e) => handleInputChange("chargingSpeed", e.target.value)}
                  placeholder="e.g., 45W"
                  className="w-full px-4 py-3 rounded-lg border border-[#d9d9d9] focus:border-[#2c3968] focus:outline-none focus:ring-2 focus:ring-[#2c3968]/20 transition-all"
                />
              </div>
              <div>
                <label className="block mb-2 text-[#1e1e1e]">Wireless Charging</label>
                <input
                  type="text"
                  value={formData.wirelessCharging}
                  onChange={(e) => handleInputChange("wirelessCharging", e.target.value)}
                  placeholder="e.g., 15W"
                  className="w-full px-4 py-3 rounded-lg border border-[#d9d9d9] focus:border-[#2c3968] focus:outline-none focus:ring-2 focus:ring-[#2c3968]/20 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Design Specifications */}
          <div>
            <h3 className="text-[#2c3968] mb-4">Design & Build</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-2 text-[#1e1e1e]">Dimensions</label>
                <input
                  type="text"
                  value={formData.dimensions}
                  onChange={(e) => handleInputChange("dimensions", e.target.value)}
                  placeholder="e.g., 162.3 x 79.0 x 8.6 mm"
                  className="w-full px-4 py-3 rounded-lg border border-[#d9d9d9] focus:border-[#2c3968] focus:outline-none focus:ring-2 focus:ring-[#2c3968]/20 transition-all"
                />
              </div>
              <div>
                <label className="block mb-2 text-[#1e1e1e]">Weight</label>
                <input
                  type="text"
                  value={formData.weight}
                  onChange={(e) => handleInputChange("weight", e.target.value)}
                  placeholder="e.g., 233g"
                  className="w-full px-4 py-3 rounded-lg border border-[#d9d9d9] focus:border-[#2c3968] focus:outline-none focus:ring-2 focus:ring-[#2c3968]/20 transition-all"
                />
              </div>
              <div>
                <label className="block mb-2 text-[#1e1e1e]">Available Colors</label>
                <input
                  type="text"
                  value={formData.colors}
                  onChange={(e) => handleInputChange("colors", e.target.value)}
                  placeholder="e.g., Titanium Black, Titanium Gray"
                  className="w-full px-4 py-3 rounded-lg border border-[#d9d9d9] focus:border-[#2c3968] focus:outline-none focus:ring-2 focus:ring-[#2c3968]/20 transition-all"
                />
              </div>
              <div>
                <label className="block mb-2 text-[#1e1e1e]">Materials</label>
                <input
                  type="text"
                  value={formData.materials}
                  onChange={(e) => handleInputChange("materials", e.target.value)}
                  placeholder="e.g., Titanium frame, Gorilla Glass Victus 2"
                  className="w-full px-4 py-3 rounded-lg border border-[#d9d9d9] focus:border-[#2c3968] focus:outline-none focus:ring-2 focus:ring-[#2c3968]/20 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4 border-t border-[#e5e5e5]">
            <button
              onClick={handleSaveSpecs}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#2c3968] to-[#3d4a7a] text-white rounded-lg hover:shadow-lg transition-all"
            >
              <Save size={20} />
              Save Specifications
            </button>
            <button
              onClick={() => setFormData(emptyForm)}
              className="flex items-center gap-2 px-6 py-3 border border-[#d9d9d9] text-[#666] rounded-lg hover:bg-[#f7f7f7] transition-all"
            >
              <Trash2 size={20} />
              Clear Form
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderWebScraping = () => (
    <div>
      <div className="mb-8">
        <h1 className="text-[#2c3968] mb-2">Web Scraping</h1>
        <p className="text-[#666]">Automate specification data collection from various sources</p>
      </div>

      {/* Scraping Control Panel */}
      <div className="bg-white rounded-xl shadow-sm border border-[#e5e5e5] p-6 mb-6">
        <h3 className="text-[#2c3968] mb-4">Start New Scraping Job</h3>
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block mb-2 text-[#1e1e1e]">Source Website</label>
            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-[#d9d9d9] focus:border-[#2c3968] focus:outline-none focus:ring-2 focus:ring-[#2c3968]/20 transition-all"
              disabled={isScrapingRunning}
            >
              <option value="GSMArena">GSMArena</option>
              <option value="PhoneArena">PhoneArena</option>
              <option value="TechRadar">TechRadar</option>
              <option value="CNET">CNET</option>
              <option value="The Verge">The Verge</option>
            </select>
          </div>
          <button
            onClick={handleStartScraping}
            disabled={isScrapingRunning}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#2c3968] to-[#3d4a7a] text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play size={20} />
            {isScrapingRunning ? "Running..." : "Start Scraping"}
          </button>
        </div>

        {/* Scraping Info */}
        <div className="mt-6 p-4 bg-[#f7f7f7] rounded-lg">
          <p className="text-[#666] mb-2">
            <strong className="text-[#1e1e1e]">Note:</strong> Scraping will automatically collect phone specifications from the selected source and add them to the database.
          </p>
          <p className="text-[#999]">
            • Average scraping time: 2-5 minutes<br />
            • Phones found per job: 5-20 devices<br />
            • Data includes: specs, images, pricing, and reviews
          </p>
        </div>
      </div>

      {/* Scraping History */}
      <div className="bg-white rounded-xl shadow-sm border border-[#e5e5e5] p-6">
        <h3 className="text-[#2c3968] mb-4">Recent Scraping Jobs</h3>
        
        {scrapingJobs.length === 0 ? (
          <div className="text-center py-12 text-[#999]">
            <Globe size={48} className="mx-auto mb-4 opacity-30" />
            <p>No scraping jobs yet. Start your first job above!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {scrapingJobs.map((job) => (
              <div key={job.id} className="flex items-center justify-between p-4 border border-[#e5e5e5] rounded-lg hover:bg-[#f7f7f7] transition-all">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    job.status === "completed" ? "bg-green-100" :
                    job.status === "running" ? "bg-blue-100" : "bg-red-100"
                  }`}>
                    {job.status === "completed" ? <CheckCircle className="text-green-600" size={24} /> :
                     job.status === "running" ? <Clock className="text-blue-600 animate-spin" size={24} /> :
                     <XCircle className="text-red-600" size={24} />}
                  </div>
                  <div>
                    <p className="text-[#1e1e1e] mb-1">{job.source}</p>
                    <div className="flex items-center gap-4 text-[#999]">
                      <span className="flex items-center gap-1">
                        <Clock size={14} />
                        {job.timestamp}
                      </span>
                      {job.duration && (
                        <span>Duration: {job.duration}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`mb-1 ${
                    job.status === "completed" ? "text-green-600" :
                    job.status === "running" ? "text-blue-600" : "text-red-600"
                  }`}>
                    {job.status === "completed" ? "✓ Completed" :
                     job.status === "running" ? "⟳ Running" : "✗ Failed"}
                  </p>
                  <p className="text-[#1e1e1e]">
                    {job.phonesFound} {job.phonesFound === 1 ? "phone" : "phones"} found
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex min-h-[calc(100vh-140px)] bg-[#f7f7f7]">
      {renderSidebar()}
      
      <div className="flex-1 p-8">
        <div className="max-w-[1400px] mx-auto">
          {currentView === "dashboard" && renderDashboard()}
          {currentView === "manual" && renderManualSpecs()}
          {currentView === "scraping" && renderWebScraping()}
        </div>
      </div>
    </div>
  );
}
