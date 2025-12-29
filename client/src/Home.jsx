import { useState, useEffect } from "react";
import { useUser } from "./AuthContext";
import axios from "axios";
import { Send, Link, Copy, ShieldAlert, AlertTriangle, Eye, RefreshCcw, UserCircle, Calendar, UploadCloud, History, LayoutDashboard } from "lucide-react"; 
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

const Home = () => {
  const { user } = useUser();
  const navigate = useNavigate();

  // --- STATES ---
  const [activeTab, setActiveTab] = useState("SHOP");
  const [files, setFiles] = useState([]);
  const [shopId, setShopId] = useState("");
  const [allowedAction, setAllowedAction] = useState("PRINT");
  const [expiryTime, setExpiryTime] = useState(5);
  const [watermarkType, setWatermarkType] = useState("GHOST"); 
  
  // 📱 NEW: Mobile View State (DEFAULT: 'UPLOAD')
  const [mobileView, setMobileView] = useState("UPLOAD");

  const [loading, setLoading] = useState(false);
  const [resultMsg, setResultMsg] = useState("");
  const [logs, setLogs] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false); 

  // --- UPLOAD LOGIC ---
  const handleUpload = async () => {
    if (files.length === 0) return alert("Please select at least one file!!");
    if (activeTab === "SHOP" && !shopId) return alert("Please enter Shop ID!");

    setLoading(true);
    setResultMsg("");

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
        formData.append("files", files[i]);
    }
    
    formData.append("ownerId", user.id);
    formData.append("ownerEmail", user.primaryEmailAddress.emailAddress);
    formData.append("senderName", user.fullName || "Customer");
    formData.append("allowedAction", allowedAction);
    formData.append("expiresIn", expiryTime);
    formData.append("mode", activeTab);
    formData.append("watermarkType", watermarkType); 
    
    if (activeTab === "SHOP") formData.append("shopId", shopId.toUpperCase());

    try {
      const res = await axios.post("http://localhost:5000/api/upload", formData);
      
      if (activeTab === "LINK") {
        setResultMsg(res.data.link);
        toast.success("Link Created Successfully!");
      } else {
        setResultMsg(`✅ Sent to ${shopId.toUpperCase()}!`);
        toast.success("Sent to Shop!");
      }
      
      setFiles([]); 
      fetchLogs(); 
      // Upload ke baad mobile pe automatically history tab pe bhej do
      if(window.innerWidth < 768) setMobileView("HISTORY");

    } catch (err) {
      alert("Upload Failed! Check Internet.");
      console.error(err);
    }
    setLoading(false);
  };

  const fetchLogs = async () => {
    setIsRefreshing(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/my-logs/${user.id}`);
      setLogs(res.data.files);
    } catch (err) { console.error(err); }
    setIsRefreshing(false);
  };

  useEffect(() => { if(user) fetchLogs(); }, [user]);

  const getReceiverDisplay = (doc) => {
      if (doc.receiverShopId) return doc.receiverName || `Shop ID: ${doc.receiverShopId}`;
      if (doc.accessLogs && doc.accessLogs.length > 0) {
          const lastUser = doc.accessLogs[doc.accessLogs.length - 1].accessedBy;
          if (lastUser === "Security AI") return "Blocked by AI";
          return lastUser;
      }
      return "Waiting for User...";
  };

  const getGroupedLogs = () => {
    const groups = [];
    logs.forEach(doc => {
        const date = new Date(doc.createdAt);
        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        let label = date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
        if (date.toDateString() === today.toDateString()) label = "Today";
        else if (date.toDateString() === yesterday.toDateString()) label = "Yesterday";

        let group = groups.find(g => g.label === label);
        if (!group) { group = { label, docs: [] }; groups.push(group); }
        group.docs.push(doc);
    });
    return groups;
  };

  const groupedLogs = getGroupedLogs();

  return (
    // 🔥 Added padding-bottom for Mobile Navbar space
    <div className="p-4 pb-28 md:pb-4 max-w-5xl mx-auto min-h-screen">
      
      {/* HEADER & SHOP TOGGLE */}
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-xl font-black text-gray-800 flex items-center gap-2">
            <Send className="text-blue-600" /> 
            <span className="hidden sm:inline">Send Files</span>
            <span className="sm:hidden">{mobileView === 'UPLOAD' ? 'Send Files' : 'History'}</span>
        </h1>
        <button 
          onClick={() => navigate('/shop-dashboard')}
          className="bg-indigo-100 text-indigo-700 px-3 py-2 rounded-lg font-bold text-xs hover:bg-indigo-200 transition flex items-center gap-2"
        >
          <LayoutDashboard size={16}/> Shop Owner?
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        
        {/* ---------------- LEFT: UPLOAD FORM ---------------- */}
        {/* 🔥 Mobile Logic: Hide if view is HISTORY, Always show on Desktop (md:block) */}
        <div className={`bg-white rounded-xl shadow-xl overflow-hidden h-fit transition-all duration-300 ${mobileView === 'HISTORY' ? 'hidden md:block' : 'block'}`}>
            
            <div className="flex border-b">
                <button 
                    onClick={() => { setActiveTab("SHOP"); setResultMsg(""); }} 
                    className={`flex-1 p-4 font-bold flex items-center justify-center gap-2 transition ${activeTab==="SHOP"?"bg-blue-50 text-blue-600 border-b-4 border-blue-600":"text-gray-400 hover:bg-gray-50"}`}
                >
                    <Send size={20}/> Send to Shop ID
                </button>
                <button 
                    onClick={() => { setActiveTab("LINK"); setResultMsg(""); }} 
                    className={`flex-1 p-4 font-bold flex items-center justify-center gap-2 transition ${activeTab==="LINK"?"bg-blue-50 text-blue-600 border-b-4 border-blue-600":"text-gray-400 hover:bg-gray-50"}`}
                >
                    <Link size={20}/> Create Link
                </button>
            </div>

            <div className="p-6">
                {activeTab === "SHOP" && (
                    <div className="mb-6">
                        <label className="text-xs font-bold text-gray-500 mb-1 block">ENTER SHOP ID</label>
                        <input 
                            type="text" 
                            placeholder="e.g. HERO-1" 
                            value={shopId}
                            onChange={(e)=>setShopId(e.target.value)}
                            className="w-full p-4 border-2 border-blue-100 rounded-xl text-xl font-bold uppercase tracking-widest text-center focus:border-blue-500 outline-none"
                        />
                    </div>
                )}

                <div className="mb-6">
                    <label className="text-xs font-bold text-gray-500 mb-1 block">SELECT DOCUMENTS</label>
                    <input 
                        type="file" 
                        multiple 
                        onChange={(e) => setFiles(e.target.files)} 
                        className="w-full p-3 border rounded-lg bg-gray-50" 
                    />
                    <p className="text-right text-xs text-gray-400 mt-1">
                        {files.length > 0 ? `${files.length} files selected` : "No files selected"}
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="text-xs font-bold text-gray-500 mb-1 block">PERMISSION</label>
                        <select value={allowedAction} onChange={(e)=>setAllowedAction(e.target.value)} className="w-full p-3 border rounded-lg bg-white">
                            <option value="PRINT">🔒 Print Only</option>
                            <option value="DOWNLOAD">⬇️ Allow Download</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 mb-1 block">AUTO-DELETE</label>
                        <select value={expiryTime} onChange={(e)=>setExpiryTime(e.target.value)} className="w-full p-3 border rounded-lg bg-white">
                            <option value="5">⚡ 5 Mins</option>
                            <option value="15">⏱️ 15 Mins</option>
                            <option value="60">⏳ 1 Hour</option>
                        </select>
                    </div>
                </div>

                {/* WATERMARK SELECTION */}
                <div className="mb-6 bg-orange-50 p-4 rounded-xl border border-orange-100">
                    <label className="text-xs font-bold text-orange-700 mb-2 flex items-center gap-2">
                        <ShieldAlert size={14}/> WATERMARK STYLE (Mandatory)
                    </label>
                    <select 
                        value={watermarkType} 
                        onChange={(e)=>setWatermarkType(e.target.value)} 
                        className="w-full p-3 border border-orange-200 rounded-lg bg-white font-medium text-gray-700"
                    >
                        <option value="GHOST">👻 Ghost Pattern (Invisible Trace ID)</option>
                        <option value="BOTTOM">📑 Footer Strip (Professional Look)</option>
                    </select>
                    <p className="text-[10px] text-orange-600 mt-2 leading-tight">
                        * This is a mandatory security field. It embeds a traceable ID to prevent the shopkeeper from misusing your document.
                    </p>
                </div>

                <button 
                    onClick={handleUpload} 
                    disabled={loading} 
                    className={`w-full py-4 rounded-xl font-bold text-lg text-white shadow-lg transform active:scale-95 transition ${activeTab==="SHOP"?"bg-black hover:bg-gray-800":"bg-blue-600 hover:bg-blue-700"}`}
                >
                    {loading ? "Processing..." : activeTab === "SHOP" ? "SEND NOW 🚀" : "GENERATE LINK 🔗"}
                </button>

                {resultMsg && (
                    <div className={`mt-6 p-4 rounded-xl text-center font-bold break-all ${activeTab==="LINK" ? "bg-green-50 text-green-800 border border-green-200" : "bg-blue-50 text-blue-800"}`}>
                        {activeTab === "LINK" ? (
                             <div className="flex flex-col gap-2">
                                <span className="text-xs text-green-600 uppercase">Share this Link</span>
                                <span className="font-mono text-sm">{resultMsg}</span>
                                <button onClick={() => { navigator.clipboard.writeText(resultMsg); toast.success("Copied!"); }} className="text-green-700 flex items-center justify-center gap-1 mt-2 bg-white py-2 rounded shadow-sm hover:bg-green-100">
                                    <Copy size={16}/> Copy Link
                                </button>
                             </div>
                        ) : (
                            <span>{resultMsg}</span>
                        )}
                    </div>
                )}
            </div>
        </div>

        {/* ---------------- RIGHT: HISTORY LOGS ---------------- */}
        {/* 🔥 Mobile Logic: Hide if view is UPLOAD, Always show on Desktop (md:block) */}
        <div className={`bg-white p-6 rounded-xl shadow-lg h-[600px] flex flex-col transition-all duration-300 ${mobileView === 'UPLOAD' ? 'hidden md:flex' : 'flex'}`}>
          
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">📂 History</h2>
            <button 
                onClick={fetchLogs} 
                disabled={isRefreshing}
                className={`p-2 rounded-full hover:bg-gray-100 transition ${isRefreshing ? "animate-spin text-blue-600" : "text-gray-500"}`}
                title="Refresh History"
            >
                <RefreshCcw size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-6 pr-2 scrollbar-hide">
            {groupedLogs.length === 0 && <p className="text-gray-400 text-center mt-10">No history yet.</p>}
            
            {groupedLogs.map((group, groupIndex) => (
                <div key={groupIndex}>
                    {/* Date Header */}
                    <div className="sticky top-0 bg-white z-10 py-2 mb-2 flex items-center gap-2">
                        <Calendar size={14} className="text-gray-400"/>
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{group.label}</span>
                        <div className="flex-1 h-px bg-gray-100"></div>
                    </div>

                    <div className="space-y-3">
                        {group.docs.map((doc) => (
                            <div key={doc._id} className="border p-4 rounded-xl hover:bg-gray-50 transition relative group shadow-sm hover:shadow-md">
                                
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex flex-col">
                                        <h3 className="font-bold text-gray-800 truncate w-40">{doc.originalName}</h3>
                                        <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1 font-medium">
                                            Sent to: <span className="text-blue-600 font-bold">{getReceiverDisplay(doc)}</span>
                                        </p>
                                    </div>
                                    <span className={`text-[10px] px-2 py-1 rounded font-bold uppercase ${doc.allowedAction==='PRINT'?'bg-purple-100 text-purple-700':'bg-orange-100 text-orange-700'}`}>
                                        {doc.allowedAction}
                                    </span>
                                </div>
                                
                                <div className="mt-2 mb-3">
                                    <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded border border-gray-200">
                                        Mode: {doc.watermarkType || "GHOST"}
                                    </span>
                                </div>

                                {doc.accessLogs.length > 0 && (
                                    <div className="mt-3 pt-3 border-t border-dashed">
                                        <p className="text-[10px] font-bold text-gray-400 mb-2 uppercase tracking-wide">Recent Activity</p>
                                        
                                        {doc.accessLogs.map((log, i) => {
                                            const isBlocked = log.snapshot && log.snapshot.toString().startsWith("BLOCKED");
                                            return (
                                                <div key={i} className={`flex items-start gap-3 mb-2 p-2 rounded-lg transition-all ${isBlocked ? "bg-white border-l-4 border-red-500 shadow-sm" : "hover:bg-gray-50"}`}>
                                                    {isBlocked ? (
                                                        <>
                                                            <div className="mt-0.5"><ShieldAlert size={16} className="text-red-500" /></div>
                                                            <div className="flex flex-col">
                                                                <span className="text-[11px] font-bold text-gray-800 flex items-center gap-2">
                                                                    Terminated <span className="bg-red-50 text-red-600 text-[9px] px-1.5 py-0.5 rounded border border-red-100 uppercase font-extrabold">Blocked</span>
                                                                </span>
                                                                <span className="text-[10px] text-gray-500 leading-tight mt-1">{log.snapshot.replace("BLOCKED:", "").trim()}</span>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <div className="bg-blue-100 p-1 rounded-full text-blue-600"><UserCircle size={14}/></div>
                                                            <div className="flex flex-col justify-center">
                                                                <span className="text-xs font-bold text-gray-700 flex items-center gap-1">{log.accessedBy}</span>
                                                                <span className="text-[10px] text-gray-400">Viewed Document</span>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            ))}
          </div>
        </div>

      </div>

      {/* 🔥 MOBILE BOTTOM NAVIGATION BAR (Sirf Mobile par dikhega) */}
      <div className="md:hidden fixed bottom-0 left-0 w-full bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-50 flex justify-around py-3 pb-safe border-t border-gray-100">
          <button 
            onClick={() => setMobileView("UPLOAD")} 
            className={`flex flex-col items-center gap-1 transition ${mobileView === "UPLOAD" ? "text-blue-600" : "text-gray-400"}`}
          >
              <UploadCloud size={24} strokeWidth={mobileView === "UPLOAD" ? 3 : 2} />
              <span className="text-[10px] font-bold">Send Files</span>
          </button>

          <button 
            onClick={() => setMobileView("HISTORY")} 
            className={`flex flex-col items-center gap-1 transition ${mobileView === "HISTORY" ? "text-blue-600" : "text-gray-400"}`}
          >
              <History size={24} strokeWidth={mobileView === "HISTORY" ? 3 : 2} />
              <span className="text-[10px] font-bold">History</span>
          </button>
      </div>

    </div>
  );
};
export default Home;