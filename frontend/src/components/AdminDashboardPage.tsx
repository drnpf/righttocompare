import { useState, useEffect } from "react";
import { LayoutDashboard, FileEdit, Globe, Upload, Plus, Trash2, Save, Play, Clock, CheckCircle, XCircle, Pencil, Search, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";

type AdminView = "dashboard" | "manual" | "scraping";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";

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
  peakBrightness: string;
  protection: string;
  // Performance
  processor: string;
  cpu: string;
  gpu: string;
  ram: string;
  storage: string;
  operatingSystem: string;
  // Benchmarks
  geekbenchSingle: string;
  geekbenchMulti: string;
  antutuScore: string;
  // Camera
  mainCamera: string;
  ultrawideMegapixels: string;
  telephotoMegapixels: string;
  frontCamera: string;
  videoRecording: string;
  // Battery
  batteryCapacity: string;
  chargingSpeed: string;
  batteryType: string;
  wirelessCharging: string;
  // Design
  dimensions: string;
  weight: string;
  colors: string;
  materials: string;
  // Connectivity
  has5G: string;
  bluetoothVersion: string;
  hasNfc: string;
  headphoneJack: string;
  // Audio
  speakers: string;
  audioFeatures: string;
  // Sensors
  fingerprint: string;
  faceRecognition: string;
  accelerometer: string;
  gyroscope: string;
  proximity: string;
  compass: string;
  barometer: string;
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
  peakBrightness: "",
  protection: "",
  processor: "",
  cpu: "",
  gpu: "",
  ram: "",
  storage: "",
  operatingSystem: "",
  geekbenchSingle: "",
  geekbenchMulti: "",
  antutuScore: "",
  mainCamera: "",
  ultrawideMegapixels: "",
  telephotoMegapixels: "",
  frontCamera: "",
  videoRecording: "",
  batteryCapacity: "",
  chargingSpeed: "",
  batteryType: "",
  wirelessCharging: "",
  dimensions: "",
  weight: "",
  colors: "",
  materials: "",
  has5G: "Yes",
  bluetoothVersion: "5.3",
  hasNfc: "Yes",
  headphoneJack: "No",
  speakers: "",
  audioFeatures: "",
  fingerprint: "",
  faceRecognition: "No",
  accelerometer: "Yes",
  gyroscope: "Yes",
  proximity: "Yes",
  compass: "Yes",
  barometer: "No"
};

export default function AdminDashboardPage() {
  const { currentUser } = useAuth();
  const [currentView, setCurrentView] = useState<AdminView>("dashboard");
  const [formData, setFormData] = useState<PhoneSpecForm>(emptyForm);
  const [isSaving, setIsSaving] = useState(false);

  // Phone list, editing, and search
  const [phones, setPhones] = useState<any[]>([]);
  const [loadingPhones, setLoadingPhones] = useState(false);
  const [editingPhoneId, setEditingPhoneId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
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

  // Fetch all phones from database 
  const fetchPhones = async () => {
    try {
      setLoadingPhones(true);
      const res = await fetch(`${API_BASE}/api/phones`);
      if (!res.ok) throw new Error("Failed to fetch phones");
      const data = await res.json();
      setPhones(data);
    } catch (err: any) {
      toast.error(err.message || "Failed to load phones");
    } finally {
      setLoadingPhones(false);
    }
  };

  // Load phones when switching to manual tab
  useEffect(() => {
    if (currentView === "manual") {
      fetchPhones();
    }
  }, [currentView]);
  
  const handleInputChange = (field: keyof PhoneSpecForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // handleSaveSpecs calls API
  const handleSaveSpecs = async () => {
    if (!formData.name || !formData.brand) {
      toast.error("Please fill in at least the phone name and brand");
      return;
    }

    if (!currentUser?.firebaseUser) {
      toast.error("You must be signed in to save specifications");
      return;
    }

    try {
      setIsSaving(true);
      const token = await currentUser.firebaseUser.getIdToken();

      // Slug ID from brand + name
      const slug = `${formData.brand}-${formData.name}`
        .trim().toLowerCase()
        .replace(/['"]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 64);

      // Convert the form's string values into the Phone schema format
      const phoneData = {
        id: editingPhoneId || slug,
        name: formData.name,
        brand: formData.brand,
        releaseDate: formData.releaseDate ? new Date(formData.releaseDate) : undefined,
        price: parseFloat(formData.price.replace(/[^0-9.]/g, "")) || 0,
        images: { main: formData.image || "placeholder.com" },
        specs: {
          display: {
            screenSizeInches: parseFloat(formData.screenSize) || 0,
            resolution: formData.resolution,
            technology: formData.displayType,
            refreshRateHz: parseInt(formData.refreshRate) || 60,
            peakBrightnessNits: parseInt(formData.peakBrightness) || undefined,
            protection: formData.protection || undefined,
          },
          performance: {
            processor: formData.processor,
            cpu: formData.cpu || undefined,
            gpu: formData.gpu || undefined,
            ram: { options: formData.ram.split(/[,\/]/).map((s: string) => parseInt(s)).filter((n: number) => !isNaN(n)), technology: "" },
            storageOptions: formData.storage.split(/[,\/]/).map((s: string) => parseInt(s)).filter((n: number) => !isNaN(n)),
            operatingSystem: formData.operatingSystem || undefined,
          },
          benchmarks: {
            geekbenchSingleCore: parseInt(formData.geekbenchSingle) || undefined,
            geekbenchMultiCore: parseInt(formData.geekbenchMulti) || undefined,
            antutuScore: parseInt(formData.antutuScore) || undefined,
          },
          camera: {
            mainMegapixels: parseInt(formData.mainCamera) || 0,
            ultrawideMegapixels: parseInt(formData.ultrawideMegapixels) || undefined,
            telephotoMegapixels: parseInt(formData.telephotoMegapixels) || undefined,
            frontMegapixels: parseInt(formData.frontCamera) || 0,
            features: formData.videoRecording ? formData.videoRecording.split(",").map((s: string) => s.trim()).filter(Boolean) : [],
          },
          battery: {
            capacitymAh: parseInt(formData.batteryCapacity) || 0,
            chargingSpeedW: parseInt(formData.chargingSpeed) || 0,
            batteryType: formData.batteryType || undefined,
            wirelessCharging: formData.wirelessCharging.toLowerCase() !== "" && formData.wirelessCharging.toLowerCase() !== "no",
          },
          design: {
            dimensionsMm: formData.dimensions,
            weightGrams: parseInt(formData.weight) || 0,
            buildMaterials: formData.materials,
            colorsAvailable: formData.colors ? formData.colors.split(",").map((s: string) => s.trim()).filter(Boolean) : [],
          },
          connectivity: {
            has5G: formData.has5G.toLowerCase() !== "no",
            bluetoothVersion: formData.bluetoothVersion || "5.3",
            hasNfc: formData.hasNfc.toLowerCase() !== "no",
            headphoneJack: formData.headphoneJack.toLowerCase() === "yes",
          },
          audio: {
            speakers: formData.speakers || undefined,
            hasHeadphoneJack: formData.headphoneJack.toLowerCase() === "yes",
            audioFeatures: formData.audioFeatures ? formData.audioFeatures.split(",").map((s: string) => s.trim()).filter(Boolean) : [],
          },
          sensors: {
            fingerprint: formData.fingerprint || undefined,
            faceRecognition: formData.faceRecognition.toLowerCase() === "yes",
            accelerometer: formData.accelerometer.toLowerCase() !== "no",
            gyroscope: formData.gyroscope.toLowerCase() !== "no",
            proximity: formData.proximity.toLowerCase() !== "no",
            compass: formData.compass.toLowerCase() !== "no",
            barometer: formData.barometer.toLowerCase() === "yes",
          },
        },
      };

      let res;
      if (editingPhoneId) {
        // UPDATE existing phone
        res = await fetch(`${API_BASE}/api/phones/${editingPhoneId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify(phoneData),
        });
      } else {
        // CREATE new phone
        res = await fetch(`${API_BASE}/api/phones`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify(phoneData),
        });
      }

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to save phone");
      }

      toast.success(editingPhoneId
        ? `${formData.name} updated successfully!`
        : `Specifications for ${formData.name} saved successfully!`
      );
      setFormData(emptyForm);
      setEditingPhoneId(null);
      await fetchPhones(); // Refresh the list
    } catch (error: any) {
      toast.error(error.message || "Failed to save specifications");
    } finally {
      setIsSaving(false);
    }
  };
  
 // Edit phone 
 const handleEditPhone = (phone: any) => {
    setEditingPhoneId(phone.id);
    setFormData({
      name: phone.name || "", brand: phone.brand || "", image: phone.images?.main || "", releaseDate: phone.releaseDate || "",
      price: phone.price ? String(phone.price) : "",
      screenSize: phone.specs?.display?.screenSizeInches ? String(phone.specs.display.screenSizeInches) : "",
      resolution: phone.specs?.display?.resolution || "",
      refreshRate: phone.specs?.display?.refreshRateHz ? String(phone.specs.display.refreshRateHz) : "",
      displayType: phone.specs?.display?.technology || "",
      peakBrightness: phone.specs?.display?.peakBrightnessNits ? String(phone.specs.display.peakBrightnessNits) : "",
      protection: phone.specs?.display?.protection || "",
      processor: phone.specs?.performance?.processor || "",
      cpu: phone.specs?.performance?.cpu || "",
      gpu: phone.specs?.performance?.gpu || "",
      ram: phone.specs?.performance?.ram?.options?.join(", ") || "",
      storage: phone.specs?.performance?.storageOptions?.join(", ") || "",
      operatingSystem: phone.specs?.performance?.operatingSystem || "",
      geekbenchSingle: phone.specs?.benchmarks?.geekbenchSingleCore ? String(phone.specs.benchmarks.geekbenchSingleCore) : "",
      geekbenchMulti: phone.specs?.benchmarks?.geekbenchMultiCore ? String(phone.specs.benchmarks.geekbenchMultiCore) : "",
      antutuScore: phone.specs?.benchmarks?.antutuScore ? String(phone.specs.benchmarks.antutuScore) : "",
      mainCamera: phone.specs?.camera?.mainMegapixels ? String(phone.specs.camera.mainMegapixels) : "",
      ultrawideMegapixels: phone.specs?.camera?.ultrawideMegapixels ? String(phone.specs.camera.ultrawideMegapixels) : "",
      telephotoMegapixels: phone.specs?.camera?.telephotoMegapixels ? String(phone.specs.camera.telephotoMegapixels) : "",
      frontCamera: phone.specs?.camera?.frontMegapixels ? String(phone.specs.camera.frontMegapixels) : "",
      videoRecording: phone.specs?.camera?.features?.join(", ") || "",
      batteryCapacity: phone.specs?.battery?.capacitymAh ? String(phone.specs.battery.capacitymAh) : "",
      chargingSpeed: phone.specs?.battery?.chargingSpeedW ? String(phone.specs.battery.chargingSpeedW) : "",
      batteryType: phone.specs?.battery?.batteryType || "",
      wirelessCharging: phone.specs?.battery?.wirelessCharging ? "Yes" : "No",
      dimensions: phone.specs?.design?.dimensionsMm || "",
      weight: phone.specs?.design?.weightGrams ? String(phone.specs.design.weightGrams) : "",
      colors: phone.specs?.design?.colorsAvailable?.join(", ") || "",
      materials: phone.specs?.design?.buildMaterials || "",
      has5G: phone.specs?.connectivity?.has5G ? "Yes" : "No",
      bluetoothVersion: phone.specs?.connectivity?.bluetoothVersion || "5.3",
      hasNfc: phone.specs?.connectivity?.hasNfc ? "Yes" : "No",
      headphoneJack: phone.specs?.connectivity?.headphoneJack ? "Yes" : "No",
      speakers: phone.specs?.audio?.speakers || "",
      audioFeatures: phone.specs?.audio?.audioFeatures?.join(", ") || "",
      fingerprint: phone.specs?.sensors?.fingerprint || "",
      faceRecognition: phone.specs?.sensors?.faceRecognition ? "Yes" : "No",
      accelerometer: phone.specs?.sensors?.accelerometer ? "Yes" : "No",
      gyroscope: phone.specs?.sensors?.gyroscope ? "Yes" : "No",
      proximity: phone.specs?.sensors?.proximity ? "Yes" : "No",
      compass: phone.specs?.sensors?.compass ? "Yes" : "No",
      barometer: phone.specs?.sensors?.barometer ? "Yes" : "No",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Delete a phone 
  const handleDeletePhone = async (phoneId: string, phoneName: string) => {
    if (!confirm(`Are you sure you want to delete "${phoneName}"?`)) return;

    if (!currentUser?.firebaseUser) {
      toast.error("You must be signed in to delete specifications");
      return;
    }

    try {
      const token = await currentUser.firebaseUser.getIdToken();
      const res = await fetch(`${API_BASE}/api/phones/${phoneId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to delete phone");
      }

      toast.success(`${phoneName} deleted`);
      await fetchPhones(); // Refresh the list

      // Clear form if we were editing the deleted phone
      if (editingPhoneId === phoneId) {
        setFormData(emptyForm);
        setEditingPhoneId(null);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to delete phone");
    }
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

  // Filter phones by search query 
  const filteredPhones = phones.filter((p) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return [p.id, p.name, p.brand].some((v: string) => (v || "").toLowerCase().includes(q));
  });

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

  const inputClass = "w-full px-4 py-3 rounded-lg border border-[#d9d9d9] focus:border-[#2c3968] focus:outline-none focus:ring-2 focus:ring-[#2c3968]/20 transition-all";

  const renderManualSpecs = () => (
    <div>
      <div className="mb-8">
        <h1 className="text-[#2c3968] mb-2">Manual Specification Entry</h1>
        <p className="text-[#666]">Add or edit phone specifications manually</p>
      </div>

      {/*Phone List Table Read */}
      <div className="bg-white rounded-xl shadow-sm border border-[#e5e5e5] p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[#2c3968]">Existing Phones</h3>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[#d9d9d9]">
              <Search size={16} className="text-[#999]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search phones..."
                className="outline-none text-[#1e1e1e] placeholder:text-[#999] bg-transparent"
              />
            </div>
            <button
              onClick={fetchPhones}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#d9d9d9] text-[#666] hover:bg-[#f7f7f7] transition-all"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>
        </div>

        {loadingPhones ? (
          <p className="text-center py-8 text-[#999]">Loading phones...</p>
        ) : filteredPhones.length === 0 ? (
          <p className="text-center py-8 text-[#999]">
            {phones.length === 0 ? "No phones in the database yet. Add one below!" : "No phones match your search."}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#e5e5e5]">
                  <th className="px-4 py-3 text-[#666] font-medium">Brand</th>
                  <th className="px-4 py-3 text-[#666] font-medium">Name</th>
                  <th className="px-4 py-3 text-[#666] font-medium">Price</th>
                  <th className="px-4 py-3 text-[#666] font-medium">ID</th>
                  <th className="px-4 py-3 text-[#666] font-medium w-[140px]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPhones.map((phone: any) => (
                  <tr key={phone.id} className="border-b border-[#f0f0f0] hover:bg-[#f7f7f7] transition-all">
                    <td className="px-4 py-3 text-[#1e1e1e]">{phone.brand}</td>
                    <td className="px-4 py-3 text-[#1e1e1e]">{phone.name}</td>
                    <td className="px-4 py-3 text-[#1e1e1e]">${phone.price?.toLocaleString() || "—"}</td>
                    <td className="px-4 py-3 text-[#999] font-mono text-sm">{phone.id}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditPhone(phone)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#d9d9d9] text-[#2c3968] hover:bg-[#f7f7f7] transition-all text-sm"
                        >
                          <Pencil size={14} />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeletePhone(phone.id, phone.name)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#d9d9d9] text-red-600 hover:bg-red-50 transition-all text-sm"
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="text-[#999] text-sm mt-3">{filteredPhones.length} phone{filteredPhones.length !== 1 ? "s" : ""} found</p>
      </div>
  
      {editingPhoneId && (
        <div className="mb-4 flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
          <p className="text-[#2c3968]">
            Editing: <strong>{formData.brand} {formData.name}</strong>
          </p>
          <button
            onClick={() => { setFormData(emptyForm); setEditingPhoneId(null); }}
            className="text-sm text-[#666] hover:text-[#1e1e1e] transition-all"
          >
            Cancel Edit
          </button>
        </div>
      )}
      
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
          <label className="block mb-2 text-[#1e1e1e]">Peak Brightness (nits)</label>
          <input 
          type="text" 
          value={formData.peakBrightness} 
          onChange={(e) => handleInputChange("peakBrightness", e.target.value)} 
          placeholder="e.g., 2600" 
          className={inputClass} />
          </div>
          <div>
            <label className="block mb-2 text-[#1e1e1e]">Screen Protection</label>
            <input 
            type="text" value={formData.protection} 
            onChange={(e) => handleInputChange("protection", e.target.value)} 
            placeholder="e.g., Gorilla Glass Victus 2" 
            className={inputClass} />
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
                <label className="block mb-2 text-[#1e1e1e]">CPU</label>
                <input 
                type="text" 
                value={formData.cpu} 
                onChange={(e) => handleInputChange("cpu", e.target.value)} placeholder="e.g., Octa-core (1x3.39 GHz)" 
                className={inputClass} />
                </div>
                <div>
                  <label className="block mb-2 text-[#1e1e1e]">GPU</label>
                  <input 
                  type="text" 
                  value={formData.gpu} 
                  onChange={(e) => handleInputChange("gpu", e.target.value)} 
                  placeholder="e.g., Adreno 750" 
                  className={inputClass} 
                  />
                  </div>
                  <div>
                    <label className="block mb-2 text-[#1e1e1e]">Operating System</label>
                    <input 
                    type="text" 
                    value={formData.operatingSystem} 
                    onChange={(e) => handleInputChange("operatingSystem", e.target.value)} 
                    placeholder="e.g., Android 14, One UI 6.1" 
                    className={inputClass} 
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
          {/* Benchmarks Specifications */}
          <div>
            <h3 className="text-[#2c3968] mb-4">Benchmarks</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block mb-2 text-[#1e1e1e]">Geekbench Single-Core</label>
                <input 
                type="text" 
                value={formData.geekbenchSingle} 
                onChange={(e) => handleInputChange("geekbenchSingle", e.target.value)} 
                placeholder="e.g., 2200" 
                className={inputClass} 
                />
                </div>
              <div>
                <label className="block mb-2 text-[#1e1e1e]">Geekbench Multi-Core</label>
                <input 
                type="text" 
                value={formData.geekbenchMulti} 
                onChange={(e) => handleInputChange("geekbenchMulti", e.target.value)} 
                placeholder="e.g., 7100" 
                className={inputClass} 
                />
                </div>
              <div>
                <label className="block mb-2 text-[#1e1e1e]">AnTuTu Score</label>
                <input 
                type="text" value={formData.antutuScore} 
                onChange={(e) => handleInputChange("antutuScore", e.target.value)} 
                placeholder="e.g., 2000000" 
                className={inputClass} 
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
                <label className="block mb-2 text-[#1e1e1e]">Ultrawide Camera (MP)</label>
                <input 
                type="text" 
                value={formData.ultrawideMegapixels} 
                onChange={(e) => handleInputChange("ultrawideMegapixels", e.target.value)} 
                placeholder="e.g., 12" 
                className={inputClass} 
                />
                </div>
                <div>
                  <label className="block mb-2 text-[#1e1e1e]">Telephoto Camera (MP)</label>
                  <input type="text" value={formData.telephotoMegapixels} 
                  onChange={(e) => handleInputChange("telephotoMegapixels", e.target.value)} 
                  placeholder="e.g., 10" 
                  className={inputClass} 
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
                <label className="block mb-2 text-[#1e1e1e]">Battery Type</label>
                <input type="text" 
                value={formData.batteryType} 
                onChange={(e) => handleInputChange("batteryType", e.target.value)} 
                placeholder="e.g., Li-Ion" 
                className={inputClass} 
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

          {/* Connectivity */}
          <div>
            <h3 className="text-[#2c3968] mb-4">Connectivity</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-2 text-[#1e1e1e]">5G Support</label>
                <select 
                value={formData.has5G} 
                onChange={(e) => handleInputChange("has5G", e.target.value)} 
                className={inputClass}>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                  </select>
                  </div>
              <div>
                <label className="block mb-2 text-[#1e1e1e]">Bluetooth Version</label>
                <input 
                type="text" 
                value={formData.bluetoothVersion} 
                onChange={(e) => handleInputChange("bluetoothVersion", e.target.value)} 
                placeholder="e.g., 5.3" 
                className={inputClass} /></div>
              <div>
                <label className="block mb-2 text-[#1e1e1e]">NFC</label>
                <select 
                value={formData.hasNfc} 
                onChange={(e) => handleInputChange("hasNfc", e.target.value)} 
                className={inputClass}>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                  </select>
                  </div>
              <div>
                <label className="block mb-2 text-[#1e1e1e]">Headphone Jack</label>
                <select value={formData.headphoneJack} 
                onChange={(e) => handleInputChange("headphoneJack", e.target.value)} 
                className={inputClass}>
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                  </select>
                  </div>
            </div>
          </div>

           {/* Audio */}
          <div>
            <h3 className="text-[#2c3968] mb-4">Audio</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-2 text-[#1e1e1e]">Speakers</label>
                <input 
                type="text" 
                value={formData.speakers} 
                onChange={(e) => handleInputChange("speakers", e.target.value)} 
                placeholder="e.g., Stereo speakers tuned by AKG" 
                className={inputClass} 
                />
                </div>
              <div>
                <label className="block mb-2 text-[#1e1e1e]">Audio Features</label>
                <input type="text" value={formData.audioFeatures} 
                onChange={(e) => handleInputChange("audioFeatures", e.target.value)} 
                placeholder="e.g., Dolby Atmos, 32-bit/384kHz" 
                className={inputClass} 
                />
                </div>
            </div>
          </div>

          {/* Sensors */}
          <div>
            <h3 className="text-[#2c3968] mb-4">Sensors</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-2 text-[#1e1e1e]">Fingerprint</label>
                <input 
                type="text" 
                value={formData.fingerprint} 
                onChange={(e) => handleInputChange("fingerprint", e.target.value)} 
                placeholder="e.g., Ultrasonic under-display" 
                className={inputClass} 
                />
                </div>
              <div>
                <label className="block mb-2 text-[#1e1e1e]">Face Recognition</label>
                <select value={formData.faceRecognition} 
                onChange={(e) => handleInputChange("faceRecognition", e.target.value)} 
                className={inputClass}>
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                  </select>
                  </div>
              <div>
                <label className="block mb-2 text-[#1e1e1e]">Accelerometer</label>
                <select value={formData.accelerometer} 
                onChange={(e) => handleInputChange("accelerometer", e.target.value)} 
                className={inputClass}>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                  </select>
                  </div>
              <div>
                <label className="block mb-2 text-[#1e1e1e]">Gyroscope</label>
                <select value={formData.gyroscope} 
                onChange={(e) => handleInputChange("gyroscope", e.target.value)} 
                className={inputClass}>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                  </select>
                  </div>
              <div>
                <label className="block mb-2 text-[#1e1e1e]">Proximity</label>
                <select value={formData.proximity} onChange={(e) => handleInputChange("proximity", e.target.value)} 
                className={inputClass}>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                  </select>
                  </div>
              <div>
                <label className="block mb-2 text-[#1e1e1e]">Compass</label>
                <select
                 value={formData.compass} 
                 onChange={(e) => handleInputChange("compass", e.target.value)} 
                 className={inputClass}>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                  </select>
                  </div>
              <div>
                <label className="block mb-2 text-[#1e1e1e]">Barometer</label>
                <select 
                value={formData.barometer} 
                onChange={(e) => handleInputChange("barometer", e.target.value)} 
                className={inputClass}>
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                  </select>
                  </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4 border-t border-[#e5e5e5]">
            <button
              onClick={handleSaveSpecs}
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#2c3968] to-[#3d4a7a] text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
            >
              <Save size={20} />
              {isSaving ? "Saving..." : editingPhoneId ? "Update Specifications" : "Save Specifications"}
            </button>
            <button
              onClick={() => { setFormData(emptyForm); setEditingPhoneId(null); }}
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
