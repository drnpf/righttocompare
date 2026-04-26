import { useState } from "react";
import {
  LayoutDashboard,
  FileEdit,
  Globe,
  Trash2,
  Save,
  Play,
  Clock,
  CheckCircle,
  XCircle,
  MessageSquare,
  DollarSign,
} from "lucide-react";
import { toast } from "sonner@2.0.3";
import AdminChatbotLogsView from "./AdminChatbotLogsView";

type AdminView = "dashboard" | "manual" | "scraping" | "chatbot" | "priceTracking";

interface ScrapingJob {
  id: string;
  source: string;
  status: "running" | "completed" | "failed";
  phonesFound: number;
  timestamp: string;
  duration?: string;
  brand?: string;
  output?: string;
  error?: string;
}

interface PhoneSpecForm {
  name: string;
  brand: string;
  image: string;
  releaseDate: string;
  price: string;
  screenSize: string;
  resolution: string;
  refreshRate: string;
  displayType: string;
  processor: string;
  ram: string;
  storage: string;
  mainCamera: string;
  frontCamera: string;
  videoRecording: string;
  batteryCapacity: string;
  chargingSpeed: string;
  wirelessCharging: string;
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
  materials: "",
};

const API_BASE_URL = "http://localhost:5001/api";

export default function AdminDashboardPage() {
  const [currentView, setCurrentView] = useState<AdminView>("dashboard");
  const [formData, setFormData] = useState<PhoneSpecForm>(emptyForm);

  const [scrapingJobs, setScrapingJobs] = useState<ScrapingJob[]>([]);
  const [selectedSource] = useState("GSMArena");
  const [scrapeBrand, setScrapeBrand] = useState("apple");
  const [scrapeLimit, setScrapeLimit] = useState(5);
  const [isScrapingRunning, setIsScrapingRunning] = useState(false);

  const [pricePhoneId, setPricePhoneId] = useState("");
  const [priceAmount, setPriceAmount] = useState("");
  const [priceCurrency, setPriceCurrency] = useState("USD");
  const [isSubmittingPrice, setIsSubmittingPrice] = useState(false);

  const handleInputChange = (field: keyof PhoneSpecForm, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveSpecs = () => {
    if (!formData.name || !formData.brand) {
      toast.error("Please fill in at least the phone name and brand");
      return;
    }

    toast.success(`Specifications for ${formData.name} saved successfully!`);
    setFormData(emptyForm);
  };

  const handleStartScraping = async () => {
    const cleanedBrand = scrapeBrand.trim().toLowerCase();

    if (!cleanedBrand) {
      toast.error("Please enter a brand to scrape");
      return;
    }

    if (!Number.isFinite(scrapeLimit) || scrapeLimit < 1) {
      toast.error("Please enter a valid limit");
      return;
    }

    setIsScrapingRunning(true);
    toast.info(`Starting GSMArena scrape for ${cleanedBrand}...`);

    const newJob: ScrapingJob = {
      id: Date.now().toString(),
      source: selectedSource,
      status: "running",
      phonesFound: 0,
      brand: cleanedBrand,
      timestamp: new Date().toLocaleString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setScrapingJobs((prev) => [newJob, ...prev]);

    const startedAt = Date.now();

    try {
      const response = await fetch(`${API_BASE_URL}/scraper/run`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          brand: cleanedBrand,
          limit: scrapeLimit,
          maxPages: 3,
          poolMult: 5,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || data.message || "Scraper failed");
      }

      const elapsedMs = Date.now() - startedAt;
      const totalSeconds = Math.max(1, Math.round(elapsedMs / 1000));
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      const duration = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;

      const phonesFound =
        typeof data.totalInserted === "number" ? data.totalInserted : 0;

      setScrapingJobs((prev) =>
        prev.map((job) =>
          job.id === newJob.id
            ? {
              ...job,
              status: "completed",
              phonesFound,
              duration,
              output: data.output || "",
            }
            : job,
        ),
      );

      toast.success(
        `Scraping completed! Inserted ${phonesFound} phone${phonesFound === 1 ? "" : "s"}.`,
      );
    } catch (error: any) {
      const elapsedMs = Date.now() - startedAt;
      const totalSeconds = Math.max(1, Math.round(elapsedMs / 1000));
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      const duration = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;

      setScrapingJobs((prev) =>
        prev.map((job) =>
          job.id === newJob.id
            ? {
              ...job,
              status: "failed",
              duration,
              error: error.message || "Scraper failed",
            }
            : job,
        ),
      );

      toast.error(error.message || "Scraping failed");
    } finally {
      setIsScrapingRunning(false);
    }
  };

  const handleInsertPriceHistory = async () => {
    const trimmedPhoneId = pricePhoneId.trim();
    const numericAmount = Number(priceAmount);

    if (!trimmedPhoneId) {
      toast.error("Please enter a phone ID");
      return;
    }

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      toast.error("Please enter a valid positive price");
      return;
    }

    setIsSubmittingPrice(true);

    try {
      const response = await fetch(`${API_BASE_URL}/phones/${trimmedPhoneId}/price-history`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: numericAmount,
          currency: priceCurrency || "USD",
          source: "admin-manual",
          raw: `$${numericAmount}`,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to insert price history");
      }

      toast.success(`Inserted new price snapshot for ${trimmedPhoneId}`);
      setPricePhoneId("");
      setPriceAmount("");
      setPriceCurrency("USD");
    } catch (error: any) {
      toast.error(error.message || "Failed to insert price history");
    } finally {
      setIsSubmittingPrice(false);
    }
  };

  const renderSidebar = () => (
    <div className="w-64 bg-white border-r border-[#e5e5e5] min-h-screen">
      <div className="p-6 border-b border-[#e5e5e5]">
        <h2 className="text-[#2c3968]">Admin Panel</h2>
      </div>

      <nav className="p-4">
        <button
          onClick={() => setCurrentView("dashboard")}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all mb-2 ${currentView === "dashboard"
              ? "bg-gradient-to-r from-[#2c3968] to-[#3d4a7a] text-white shadow-md"
              : "text-[#666] hover:bg-[#f7f7f7] hover:text-[#2c3968]"
            }`}
        >
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </button>

        <button
          onClick={() => setCurrentView("manual")}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all mb-2 ${currentView === "manual"
              ? "bg-gradient-to-r from-[#2c3968] to-[#3d4a7a] text-white shadow-md"
              : "text-[#666] hover:bg-[#f7f7f7] hover:text-[#2c3968]"
            }`}
        >
          <FileEdit size={20} />
          <span>Manual Specs</span>
        </button>

        <button
          onClick={() => setCurrentView("scraping")}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all mb-2 ${currentView === "scraping"
              ? "bg-gradient-to-r from-[#2c3968] to-[#3d4a7a] text-white shadow-md"
              : "text-[#666] hover:bg-[#f7f7f7] hover:text-[#2c3968]"
            }`}
        >
          <Globe size={20} />
          <span>Web Scraping</span>
        </button>

        <button
          onClick={() => setCurrentView("priceTracking")}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all mb-2 ${currentView === "priceTracking"
              ? "bg-gradient-to-r from-[#2c3968] to-[#3d4a7a] text-white shadow-md"
              : "text-[#666] hover:bg-[#f7f7f7] hover:text-[#2c3968]"
            }`}
        >
          <DollarSign size={20} />
          <span>Price Tracking</span>
        </button>

        <button
          onClick={() => setCurrentView("chatbot")}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${currentView === "chatbot"
              ? "bg-gradient-to-r from-[#2c3968] to-[#3d4a7a] text-white shadow-md"
              : "text-[#666] hover:bg-[#f7f7f7] hover:text-[#2c3968]"
            }`}
        >
          <MessageSquare size={20} />
          <span>Chatbot Logs</span>
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

      <div className="bg-white rounded-xl shadow-sm border border-[#e5e5e5] p-6">
        <h2 className="text-[#2c3968] mb-4">Recent Scraping Jobs</h2>
        <div className="space-y-3">
          {scrapingJobs.slice(0, 5).map((job) => (
            <div
              key={job.id}
              className="flex items-center justify-between p-4 bg-[#f7f7f7] rounded-lg"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${job.status === "completed"
                      ? "bg-green-100"
                      : job.status === "running"
                        ? "bg-blue-100"
                        : "bg-red-100"
                    }`}
                >
                  {job.status === "completed" ? (
                    <CheckCircle className="text-green-600" size={20} />
                  ) : job.status === "running" ? (
                    <Clock className="text-blue-600" size={20} />
                  ) : (
                    <XCircle className="text-red-600" size={20} />
                  )}
                </div>
                <div>
                  <p className="text-[#1e1e1e]">
                    {job.source}
                    {job.brand ? ` • ${job.brand}` : ""}
                  </p>
                  <p className="text-[#999]">{job.timestamp}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[#1e1e1e]">{job.phonesFound} phones</p>
                <p className="text-[#999]">{job.duration}</p>
              </div>
            </div>
          ))}
          {scrapingJobs.length === 0 && (
            <p className="text-[#999]">No scraping jobs yet.</p>
          )}
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
        <p className="text-[#666]">
          Run the GSMArena scraper to update the staging collection with newer phones
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-[#e5e5e5] p-6 mb-6">
        <h3 className="text-[#2c3968] mb-4">Start New Scraping Job</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block mb-2 text-[#1e1e1e]">Source Website</label>
            <input
              type="text"
              value={selectedSource}
              disabled
              className="w-full px-4 py-3 rounded-lg border border-[#d9d9d9] bg-[#f7f7f7] text-[#666]"
            />
          </div>

          <div>
            <label className="block mb-2 text-[#1e1e1e]">Brand</label>
            <input
              type="text"
              value={scrapeBrand}
              onChange={(e) => setScrapeBrand(e.target.value)}
              placeholder="e.g., apple"
              disabled={isScrapingRunning}
              className="w-full px-4 py-3 rounded-lg border border-[#d9d9d9] focus:border-[#2c3968] focus:outline-none focus:ring-2 focus:ring-[#2c3968]/20 transition-all"
            />
          </div>

          <div>
            <label className="block mb-2 text-[#1e1e1e]">Limit</label>
            <input
              type="number"
              min={1}
              max={50}
              value={scrapeLimit}
              onChange={(e) => setScrapeLimit(Number(e.target.value))}
              disabled={isScrapingRunning}
              className="w-full px-4 py-3 rounded-lg border border-[#d9d9d9] focus:border-[#2c3968] focus:outline-none focus:ring-2 focus:ring-[#2c3968]/20 transition-all"
            />
          </div>
        </div>

        <div className="mt-4">
          <button
            onClick={handleStartScraping}
            disabled={isScrapingRunning}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#2c3968] to-[#3d4a7a] text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play size={20} />
            {isScrapingRunning ? "Running..." : "Start Scraping"}
          </button>
        </div>

        <div className="mt-6 p-4 bg-[#f7f7f7] rounded-lg">
          <p className="text-[#666] mb-2">
            <strong className="text-[#1e1e1e]">Note:</strong> This runs your backend GSMArena scraper and upserts results into MongoDB staging.
          </p>
          <p className="text-[#999]">
            • Current destination: <code>test.scrape_output</code>
            <br />
            • Recommended use: scrape newest phones by brand
            <br />
            • Current parameters sent: brand, limit, maxPages=3, poolMult=5
          </p>
        </div>
      </div>

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
              <div
                key={job.id}
                className="p-4 border border-[#e5e5e5] rounded-lg hover:bg-[#f7f7f7] transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-lg flex items-center justify-center ${job.status === "completed"
                          ? "bg-green-100"
                          : job.status === "running"
                            ? "bg-blue-100"
                            : "bg-red-100"
                        }`}
                    >
                      {job.status === "completed" ? (
                        <CheckCircle className="text-green-600" size={24} />
                      ) : job.status === "running" ? (
                        <Clock className="text-blue-600 animate-spin" size={24} />
                      ) : (
                        <XCircle className="text-red-600" size={24} />
                      )}
                    </div>

                    <div>
                      <p className="text-[#1e1e1e] mb-1">
                        {job.source}
                        {job.brand ? ` • ${job.brand}` : ""}
                      </p>
                      <div className="flex items-center gap-4 text-[#999] flex-wrap">
                        <span className="flex items-center gap-1">
                          <Clock size={14} />
                          {job.timestamp}
                        </span>
                        {job.duration && <span>Duration: {job.duration}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <p
                      className={`mb-1 ${job.status === "completed"
                          ? "text-green-600"
                          : job.status === "running"
                            ? "text-blue-600"
                            : "text-red-600"
                        }`}
                    >
                      {job.status === "completed"
                        ? "✓ Completed"
                        : job.status === "running"
                          ? "⟳ Running"
                          : "✗ Failed"}
                    </p>
                    <p className="text-[#1e1e1e]">
                      {job.phonesFound} {job.phonesFound === 1 ? "phone" : "phones"} found
                    </p>
                  </div>
                </div>

                {job.output && (
                  <pre className="mt-4 p-3 bg-[#f7f7f7] rounded-lg text-xs text-[#444] whitespace-pre-wrap overflow-x-auto">
                    {job.output}
                  </pre>
                )}

                {job.error && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                    {job.error}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderPriceTracking = () => (
    <div>
      <div className="mb-8">
        <h1 className="text-[#2c3968] mb-2">Price Tracking</h1>
        <p className="text-[#666]">
          Manually insert a new price snapshot for a phone to test tracking and alerts
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-[#e5e5e5] p-6">
        <h3 className="text-[#2c3968] mb-4">Insert Price Snapshot</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block mb-2 text-[#1e1e1e]">Phone ID</label>
            <input
              type="text"
              value={pricePhoneId}
              onChange={(e) => setPricePhoneId(e.target.value)}
              placeholder="e.g., samsung-x1-pro"
              disabled={isSubmittingPrice}
              className="w-full px-4 py-3 rounded-lg border border-[#d9d9d9] focus:border-[#2c3968] focus:outline-none focus:ring-2 focus:ring-[#2c3968]/20 transition-all"
            />
          </div>

          <div>
            <label className="block mb-2 text-[#1e1e1e]">Price</label>
            <input
              type="number"
              min={1}
              step="0.01"
              value={priceAmount}
              onChange={(e) => setPriceAmount(e.target.value)}
              placeholder="e.g., 749"
              disabled={isSubmittingPrice}
              className="w-full px-4 py-3 rounded-lg border border-[#d9d9d9] focus:border-[#2c3968] focus:outline-none focus:ring-2 focus:ring-[#2c3968]/20 transition-all"
            />
          </div>

          <div>
            <label className="block mb-2 text-[#1e1e1e]">Currency</label>
            <input
              type="text"
              value={priceCurrency}
              onChange={(e) => setPriceCurrency(e.target.value.toUpperCase())}
              placeholder="USD"
              disabled={isSubmittingPrice}
              className="w-full px-4 py-3 rounded-lg border border-[#d9d9d9] focus:border-[#2c3968] focus:outline-none focus:ring-2 focus:ring-[#2c3968]/20 transition-all"
            />
          </div>
        </div>

        <div className="mt-6 flex gap-4">
          <button
            onClick={handleInsertPriceHistory}
            disabled={isSubmittingPrice}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#2c3968] to-[#3d4a7a] text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <DollarSign size={20} />
            {isSubmittingPrice ? "Inserting..." : "Insert Price Snapshot"}
          </button>
        </div>

        <div className="mt-6 p-4 bg-[#f7f7f7] rounded-lg">
          <p className="text-[#666] mb-2">
            <strong className="text-[#1e1e1e]">Use case:</strong> Insert a new manual price point to
            test the phone detail chart, summary cards, and future alert behavior.
          </p>
          <p className="text-[#999]">
            • Endpoint used: <code>POST /api/phones/:id/price-history</code>
            <br />
            • Source recorded: <code>admin-manual</code>
            <br />
            • Best for simulating price drops without rerunning the scraper
          </p>
        </div>
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
          {currentView === "priceTracking" && renderPriceTracking()}
          {currentView === "chatbot" && <AdminChatbotLogsView />}
        </div>
      </div>
    </div>
  );
}