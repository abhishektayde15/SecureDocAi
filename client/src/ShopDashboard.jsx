import { useState, useEffect, useRef } from "react";
import { useUser } from "./AuthContext"; 
import axios from "axios";
import { Eye, Clock, Copy, CheckCircle, Loader, Download, User, ChevronRight, ArrowLeft, FileText } from "lucide-react"; // 🔥 New Icons
import confetti from "canvas-confetti"; 

const ShopDashboard = () => {
  const { user, isLoaded } = useUser(); 
  const [shop, setShop] = useState(null);
  const [files, setFiles] = useState([]);
  const [showCongrats, setShowCongrats] = useState(false);
  const [status, setStatus] = useState("loading");
  const [downloadingId, setDownloadingId] = useState(null);
  
  // 🆕 NEW: Selected Sender State (Chat Open karne ke liye)
  const [selectedSender, setSelectedSender] = useState(null);

  const hasCreated = useRef(false);

  // 1. INIT SHOP
  useEffect(() => {
    if (!isLoaded || !user) return; 

    const initShop = async () => {
        try {
            const res = await axios.get(`https://securedoc-api.onrender.com/api/shop/me/${user.id}`);
            
            if (!res.data.shop) {
                throw new Error("Shop not found, create new one");
            }

            setShop(res.data.shop);
            setStatus("ready");
        } catch (err) {
            if (!hasCreated.current) {
                hasCreated.current = true;
                setStatus("creating");
                createAutoShop();
            }
        }
    };
    initShop();
  }, [user, isLoaded]);

  // 2. POLL FILES
  useEffect(() => {
    if (!shop) return;
    const fetchFiles = () => {
        axios.get(`https://securedoc-api.onrender.com/api/shop/files/${shop.shopId}`)
             .then(res => setFiles(res.data.files))
             .catch(console.error);
    };
    fetchFiles();
    const interval = setInterval(fetchFiles, 5000);
    return () => clearInterval(interval);
  }, [shop]);

  // 3. AUTO CREATE
  const createAutoShop = async () => {
    const firstName = user.firstName ? user.firstName.split(" ")[0].toUpperCase() : "SHOP";
    const randomNum = Math.floor(100 + Math.random() * 900); 
    const autoId = `${firstName}-${randomNum}`; 
    
    try {
        const res = await axios.post("https://securedoc-api.onrender.com/api/shop/create", {
            ownerId: user.id,
            shopId: autoId,
            shopName: user.fullName
        });
        setShop(res.data.shop);
        setStatus("ready");
        setShowCongrats(true);
        triggerConfetti();
    } catch (err) { 
        console.error("Creation Failed", err);
        setTimeout(createAutoShop, 1000); 
    }
  };

  const triggerConfetti = () => {
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
  };

  // 4. WATERMARK LOGIC (Preserved 100%)
  const downloadWithWatermark = async (file) => {
    setDownloadingId(file._id);
    try {
        const img = new Image();
        img.crossOrigin = "anonymous"; 
        img.src = file.cloudinaryUrl;

        img.onload = () => {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);

            const type = file.watermarkType || "GHOST"; 
            
            if (type === "GHOST") {
                ctx.save();
                ctx.translate(canvas.width / 2, canvas.height / 2);
                ctx.rotate(-45 * Math.PI / 180);
                
                ctx.fillStyle = "rgba(0, 0, 0, 0.09)"; 
                ctx.font = "bold 80px Arial";
                ctx.textAlign = "center";
                
                ctx.fillText((file.senderName || "ANONYMOUS").toUpperCase(), 0, -50);
                
                const visibleId = file.receiverShopId || shop.shopId || "UNKNOWN";
                ctx.font = "bold 60px Arial";
                ctx.fillText(`SHOP: ${visibleId}`, 0, 50);
                
                ctx.restore();

            } else {
                ctx.font = "bold 24px Arial"; 
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                const dateStr = new Date().toLocaleDateString();

                const visibleId = file.receiverShopId || shop.shopId || "UNKNOWN";
                const text = `SecureDoc • From: ${file.senderName} • Shop: ${visibleId} • ${dateStr}`;
                
                const x = canvas.width / 2;
                const y = canvas.height - 40;

                ctx.strokeStyle = "white"; ctx.lineWidth = 6; ctx.strokeText(text, x, y);
                ctx.fillStyle = "black"; ctx.fillText(text, x, y);
            }

            const link = document.createElement("a");
            link.download = `SecureDoc_${file.originalName}`;
            link.href = canvas.toDataURL("image/jpeg", 0.9);
            link.click();
            setDownloadingId(null);
        };
        img.onerror = () => { alert("Error loading image"); setDownloadingId(null); };
    } catch (err) {
        console.error(err);
        setDownloadingId(null);
    }
  };

  // 🧠 HELPER: GROUP FILES BY SENDER
  const groupedFiles = files.reduce((acc, file) => {
      const name = file.senderName || "Unknown User";
      if (!acc[name]) acc[name] = [];
      acc[name].push(file);
      return acc;
  }, {});

  // --- RENDER UI ---
  if (status === "loading" || status === "creating" || !shop) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh]">
            <LoaderQX /> 
            <h2 className="text-xl font-bold mt-4 text-gray-700">
                {status === "creating" ? "⚙️ Setting up your Shop..." : "Checking Profile..."}
            </h2>
        </div>
    );
  }

  return (
    <div className="p-4 max-w-6xl mx-auto">
        
        {/* 🎉 CONGRATS POPUP */}
        {showCongrats && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in">
                <div className="bg-white p-8 rounded-3xl text-center max-w-md w-full shadow-2xl">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4"/>
                    <h2 className="text-3xl font-extrabold text-gray-800 mb-2">Shop Ready! 🚀</h2>
                    <div className="bg-gray-100 p-4 rounded-xl mb-6 my-4 border border-blue-200">
                        <span className="text-5xl font-black text-blue-600 tracking-tighter">{shop.shopId}</span>
                    </div>
                    <button onClick={() => setShowCongrats(false)} className="w-full bg-black text-white py-3 rounded-xl font-bold">Let's Go</button>
                </div>
            </div>
        )}

        {/* 🏪 TOP BANNER (Hidden in Chat View for Focus) */}
        {!selectedSender && (
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 bg-gradient-to-br from-gray-900 to-black text-white p-8 rounded-3xl shadow-xl relative overflow-hidden transition-all">
                <div className="z-10 text-center md:text-left">
                    <p className="text-blue-200 text-xs font-bold uppercase tracking-widest mb-2">SHOP IDENTIFIER</p>
                    <div className="flex items-center gap-3 justify-center md:justify-start">
                        <h1 className="text-6xl font-black tracking-tighter text-white">{shop?.shopId}</h1>
                        <button onClick={() => navigator.clipboard.writeText(shop.shopId)} className="bg-white/10 p-3 rounded-xl hover:bg-white/20 transition active:scale-90">
                            <Copy size={24} className="text-white"/>
                        </button>
                    </div>
                </div>
                <div className="mt-6 md:mt-0 z-10 bg-white/5 px-6 py-3 rounded-2xl border border-white/10 backdrop-blur-md">
                    <div className="flex items-center gap-2 text-green-400 font-bold mb-1">
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                        </span>
                        LIVE MONITORING
                    </div>
                </div>
            </div>
        )}

        {/* 🔀 DYNAMIC VIEW SWITCHER */}
        
        {/* VIEW 1: SENDER LIST (WhatsApp Chat List Style) */}
        {!selectedSender ? (
            <div className="grid gap-4">
                {files.length === 0 && (
                    <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
                        <p className="text-gray-400 font-medium">No files yet. Waiting for customers...</p>
                    </div>
                )}

                {Object.keys(groupedFiles).map((senderName) => {
                    const senderFiles = groupedFiles[senderName];
                    const latestFile = senderFiles[0]; // For timestamp

                    return (
                        <div 
                            key={senderName}
                            onClick={() => setSelectedSender(senderName)}
                            className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer group flex items-center justify-between"
                        >
                            <div className="flex items-center gap-4">
                                <div className="bg-blue-100 p-3 rounded-full text-blue-600 group-hover:scale-110 transition">
                                    <User size={24} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">{senderName}</h3>
                                    <p className="text-sm text-gray-500 font-medium flex items-center gap-2">
                                        <FileText size={14} className="text-blue-500"/>
                                        {senderFiles.length} {senderFiles.length === 1 ? "File" : "Files"} Received
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-xs text-gray-400 font-medium">
                                    Last: {new Date(latestFile.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </span>
                                <ChevronRight className="text-gray-300" />
                            </div>
                        </div>
                    )
                })}
            </div>
        ) : (
            // VIEW 2: CHAT DETAIL (Specific Sender's Files)
            <div className="animate-in slide-in-from-right duration-300">
                {/* Chat Header */}
                <div className="flex items-center gap-4 mb-6 sticky top-0 bg-gray-50/95 backdrop-blur z-20 py-2 border-b border-gray-200/50">
                    <button 
                        onClick={() => setSelectedSender(null)} 
                        className="bg-white p-2 rounded-full shadow-sm hover:bg-gray-100 transition"
                    >
                        <ArrowLeft size={20} className="text-gray-700"/>
                    </button>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">{selectedSender}</h2>
                        <p className="text-xs text-gray-500 font-medium">{groupedFiles[selectedSender]?.length} Documents Shared</p>
                    </div>
                </div>

                {/* Files List */}
                <div className="grid gap-4">
                    {groupedFiles[selectedSender]?.map((file) => (
                        <div key={file._id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all flex flex-col md:flex-row justify-between items-center gap-6">
                            <div className="flex-1 w-full">
                                <div className="flex items-center gap-3 mb-2">
                                    <h3 className="font-bold text-xl text-gray-900">{file.originalName}</h3>
                                    <span className={`text-[10px] px-2 py-1 rounded font-bold uppercase tracking-wide ${file.allowedAction==='PRINT'?'bg-red-50 text-red-600 border border-red-100':'bg-green-50 text-green-600 border border-green-100'}`}>
                                        {file.allowedAction} Only
                                    </span>
                                </div>
                                <div className="flex items-center gap-6 text-sm text-gray-500">
                                    <span className="flex items-center gap-1 text-orange-600 font-bold"><Clock size={14}/> Expires in {file.expiresIn}m</span>
                                    <span className="bg-gray-100 px-2 rounded text-xs py-0.5 border">
                                        🛡️ {file.watermarkType || "GHOST"}
                                    </span>
                                </div>
                            </div>

                            <div className="flex gap-3 w-full md:w-auto">
                                <button 
                                    onClick={() => window.open(`/view/${file.secureId}`, '_blank')} 
                                    className="flex-1 bg-black text-white px-6 py-3 rounded-xl font-bold hover:bg-gray-800 transition flex items-center justify-center gap-2"
                                >
                                    <Eye size={18}/> View
                                </button>

                                {file.allowedAction === 'DOWNLOAD' && (
                                    <button 
                                        onClick={() => downloadWithWatermark(file)} 
                                        disabled={downloadingId === file._id}
                                        className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition flex items-center justify-center gap-2"
                                    >
                                        {downloadingId === file._id ? <Loader className="animate-spin" size={18}/> : <Download size={18}/>}
                                        {downloadingId === file._id ? "Processing..." : "Download"}
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}
    </div>
  );
};
const LoaderQX = () => (<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>);
export default ShopDashboard;