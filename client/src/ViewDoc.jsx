import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Loader, Clock, Ban, ShieldAlert, AlertTriangle, ArrowDown, User, Store, Copy, Check } from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast'; 
import { useUser, SignInButton } from "./AuthContext"; // 👈 Auth Import Zaroori hai

const ViewDoc = () => {
  const { id } = useParams();
  const { user, isSignedIn, isLoaded } = useUser(); // 👈 User Data
  
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(null); 
  
  // 🚨 SECURITY STATES
  const [securityLogs, setSecurityLogs] = useState([]);
  const [isBlocked, setIsBlocked] = useState(false);
  const [aiReason, setAiReason] = useState("");
  
  // ⚠️ WARNING & UX STATES
  const [violationCount, setViolationCount] = useState(0); 
  const [isWarningActive, setIsWarningActive] = useState(false);
  const [showGuide, setShowGuide] = useState(true); 

  // 🏪 GROWTH STATES (New)
  const [showShopPromo, setShowShopPromo] = useState(false);
  const [myShopId, setMyShopId] = useState("");

  const canvasRef = useRef(null);

  // 0. 🚀 GROWTH HACK: Create/Fetch Shop ID on Login
  useEffect(() => {
    if (isLoaded && isSignedIn && user && file) { // 🔥 Added 'file' dependency
        
        // 🛑 FIX: Agar file kisi Shop ID par bheji gayi hai, to Promo MAT dikhao.
        if (file.receiverShopId) {
            return; 
        }

        const checkShop = async () => {
            try {
                // Pehle check karo agar shop hai
                let res = await axios.get(`http://localhost:5000/api/shop/me/${user.id}`);
                
                if (res.data.shop) {
                    setMyShopId(res.data.shop.shopId);
                    if (!sessionStorage.getItem("promoShown")) {
                        setShowShopPromo(true);
                        sessionStorage.setItem("promoShown", "true");
                    }
                } else {
                    // Agar Shop nahi hai -> TOH CREATE KARO (Auto)
                    const autoId = `${user.firstName.toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
                    res = await axios.post("http://localhost:5000/api/shop/create", {
                        ownerId: user.id,
                        shopId: autoId,
                        shopName: user.fullName
                    });
                    setMyShopId(res.data.shop.shopId);
                    setShowShopPromo(true); // Naye user ko pakka dikhao
                    sessionStorage.setItem("promoShown", "true");
                }
            } catch (err) { console.error("Shop Check Failed", err); }
        };
        checkShop();
    }
  }, [isLoaded, isSignedIn, user, file]);

  // 1. Fetch File (Only if Signed In)
  useEffect(() => {
    if (!isSignedIn) return; // 👈 Login nahi to fetch mat karo

    const fetchDoc = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/view/${id}`);
        setFile(res.data.file);
      } catch (err) {
        setError('Link Expired or Invalid');
      }
    };
    fetchDoc();

    const guideTimer = setTimeout(() => setShowGuide(false), 5000);
    return () => clearTimeout(guideTimer);
  }, [id, isSignedIn]);

  // 2. SECURITY LISTENERS
  useEffect(() => {
    if (!file || isBlocked) return;

    const logAction = (action) => {
        console.log(`⚠️ Security Alert: ${action}`); 
        const newLogs = [...securityLogs, action];
        setSecurityLogs(newLogs);
        checkAnomalyWithGemini(newLogs);
    };

    const handleKeyDown = (e) => {
        if (e.key === "PrintScreen") logAction("Pressed PrintScreen (Screenshot Attempt)");
        if ((e.ctrlKey || e.metaKey) && (e.key === 'p' || e.key === 's' || e.key === 'u')) {
            e.preventDefault(); 
            logAction(`Pressed Ctrl+${e.key.toUpperCase()} (Unauthorized Save/Print)`);
        }
    };

    const handleRightClick = (e) => {
        e.preventDefault();
        logAction("Right Click Attempt");
    };

    const handleBlur = () => {
        logAction("Window Focus Lost");
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("contextmenu", handleRightClick);
    window.addEventListener("blur", handleBlur);

    return () => {
        window.removeEventListener("keydown", handleKeyDown);
        window.removeEventListener("contextmenu", handleRightClick);
        window.removeEventListener("blur", handleBlur);
    };
  }, [file, isBlocked, securityLogs]);

  // 3. AI JUDGE
  const checkAnomalyWithGemini = async (currentLogs) => {
    try {
        const newCount = violationCount + 1;
        setViolationCount(newCount);

        const res = await axios.post("http://localhost:5000/api/detect-anomaly", { 
            logs: currentLogs,
            secureId: id,
            violationCount: newCount
        });
        
        if (res.data.verdict === "TERMINATE") {
            setIsBlocked(true);
            setAiReason(res.data.reason || "Suspicious activity detected.");
        } 
        else if (res.data.verdict === "WARNING") {
            const msg = res.data.reason || "Security Warning!";
            
            // 🔥 FIXED: Warning ab SOLID dikhegi aur miss nahi hogi
            toast(msg, {
                icon: '⚠️',
                style: {
                    borderRadius: '10px',
                    background: '#FEF2F2', // Light Red background
                    color: '#991B1B', // Dark Red text
                    border: '2px solid #EF4444',
                    fontWeight: 'bold',
                    padding: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                },
                duration: 5000, // 5 Seconds tak rahega
            });
            
            setIsWarningActive(true);
            setTimeout(() => setIsWarningActive(false), 2000); 
        }
    } catch (err) { console.error("AI Check Failed"); }
  };

  // 4. Render Canvas (🔥 WATERMARK ID FIXED HERE)
  useEffect(() => {
    if (!file || !canvasRef.current || isBlocked) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = file.cloudinaryUrl;
    img.onload = () => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      const maxWidth = 800;
      const scale = Math.min(maxWidth / img.width, 1);
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const type = file.watermarkType || "GHOST"; 
      if (type === "GHOST") {
          // --- GHOST PATTERN ---
          ctx.save();
          ctx.translate(canvas.width / 2, canvas.height / 2);
          ctx.rotate(-45 * Math.PI / 180); 
          ctx.fillStyle = "rgba(0, 0, 0, 0.09)"; 
          ctx.font = "bold 30px Arial";
          ctx.textAlign = "center";
          
          // Line 1: Name
          ctx.fillText((file.senderName || "ANONYMOUS").toUpperCase(), 0, -30);
          
          // 🔥 FIXED: Line 2 - ID Wapas Add Kar Di
          const displayId = file.receiverShopId ? `SHOP: ${file.receiverShopId}` : `ID: ${id.slice(0,6)}`;
          ctx.font = "bold 36px Arial"; 
          ctx.fillText(displayId.toUpperCase(), 0, 30);
          
          ctx.restore();
      } else {
           // --- BOTTOM FOOTER ---
           const shopInfo = file.receiverShopId ? `Shop: ${file.receiverShopId}` : `ID: ${id.slice(0,6)}`;
           const text = `SecureDoc • Sent by: ${file.senderName} • ${shopInfo}`;
           ctx.font = "bold 16px Arial";
           ctx.textAlign = "center";
           ctx.strokeStyle = "white"; ctx.lineWidth = 4;
           ctx.strokeText(text, canvas.width / 2, canvas.height - 20);
           ctx.fillStyle = "black";
           ctx.fillText(text, canvas.width / 2, canvas.height - 20);
      }
    };
  }, [file, id, isBlocked]);

  // 5. Timer
  useEffect(() => {
    if (!file || isBlocked) return;
    const interval = setInterval(() => {
        const diff = Math.floor((new Date(file.expireAt) - new Date()) / 1000);
        if (diff <= 0) { setTimeLeft(0); setError("Session Expired"); setFile(null); clearInterval(interval); } 
        else { setTimeLeft(diff); }
    }, 1000);
    return () => clearInterval(interval);
  }, [file, isBlocked]);

  const formatTime = (s) => `${Math.floor(s/60)}:${s%60<10?'0':''}${s%60}`;

  // ---------------- UI STATES ------------------

  // 🛑 0. LOADING
  if (!isLoaded) return <div className="flex h-screen items-center justify-center"><Loader className="animate-spin text-blue-600"/></div>;

  // 🔐 1. GATEKEEPER (Agar Login nahi hai)
  if (!isSignedIn) {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-blue-100">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                    <ShieldAlert size={32} className="text-blue-600"/>
                </div>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Secure Document Access</h1>
                <p className="text-gray-500 mb-8">
                    This file is protected by AI Security. Please verify your identity to view it.
                </p>
                <SignInButton mode="modal">
                    <button className="w-full bg-black text-white py-4 rounded-xl font-bold text-lg hover:bg-gray-800 transition shadow-lg flex items-center justify-center gap-2">
                        <User size={20}/> Sign In to View
                    </button>
                </SignInButton>
                <p className="mt-4 text-xs text-gray-400">
                    Trusted by Cyber Cafes & Print Shops
                </p>
            </div>
        </div>
    );
  }

  // 🔴 2. LOCKDOWN SCREEN
  if (isBlocked) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-red-50 text-center p-6 animate-in fade-in zoom-in">
            <ShieldAlert size={80} className="text-red-600 mb-4 animate-bounce" />
            <h1 className="text-4xl font-black text-red-700 mb-2">SECURITY LOCKDOWN</h1>
            <p className="text-xl text-gray-700 font-bold mb-4">Terminated by AI Watchdog.</p>
            <div className="bg-white p-6 rounded-xl border-l-8 border-red-500 shadow-lg max-w-md">
                <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">REASON</p>
                <p className="text-2xl font-bold text-red-600">"{aiReason}"</p>
            </div>
            <p className="mt-8 text-sm text-gray-500">File permanently deleted.</p>
        </div>
    );
  }

  // 🚫 3. ERROR SCREEN (RESTORED 🔥)
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-center p-4">
        <Ban size={64} className="text-red-500 mb-4" />
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Access Denied</h1>
        <p className="text-gray-500 text-lg">{error}</p>
        <p className="text-sm text-gray-400 mt-4">Close this window.</p>
      </div>
    );
  }
  
  // Loading File
  if (!file) return <div className="flex justify-center h-screen items-center"><Loader className="animate-spin text-blue-600" /></div>;

  // ✅ 4. MAIN DOCUMENT UI
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center py-8 relative pb-32">
      <Toaster position="top-center" reverseOrder={false} />

      {/* 🏪 PROMO: Only shows if mode=LINK */}
      {showShopPromo && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in zoom-in duration-300">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl relative">
                <button onClick={() => setShowShopPromo(false)} className="absolute top-4 right-4 text-gray-400 hover:text-black">✕</button>
                
                <div className="bg-orange-100 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Store size={28} className="text-orange-600"/>
                </div>
                
                <h2 className="text-xl font-bold text-gray-900 mb-1">Are you a Shop Owner?</h2>
                <p className="text-sm text-gray-500 mb-4">Use this Shop ID to receive files directly next time!</p>
                
                <div className="bg-gray-100 p-3 rounded-lg flex items-center justify-between border border-gray-200 mb-6">
                    <span className="font-mono text-lg font-black text-gray-800 tracking-wider">{myShopId}</span>
                    <button 
                        onClick={() => { navigator.clipboard.writeText(myShopId); toast.success("Copied!"); }}
                        className="text-gray-500 hover:text-blue-600"
                    >
                        <Copy size={18}/>
                    </button>
                </div>

                <button 
                    onClick={() => setShowShopPromo(false)}
                    className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition"
                >
                    Continue to Document
                </button>
            </div>
        </div>
      )}

      {/* UX: BOUNCING GUIDE ARROW */}
      {showGuide && (
        <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-50 flex flex-col items-center animate-bounce pointer-events-none">
            <div className="bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg font-bold mb-2 border-2 border-white">
               👇 Print Button Below
            </div>
            <ArrowDown size={40} className="text-blue-500 drop-shadow-lg" />
        </div>
      )}

      {/* Header */}
      <div className={`fixed top-0 left-0 w-full text-white p-2 text-center font-bold z-50 shadow-md flex justify-center items-center gap-4 transition-colors duration-300 ${isWarningActive ? 'bg-yellow-600' : 'bg-red-600'}`}>
        <span className="flex items-center gap-2">
            <Clock size={18} className="animate-pulse"/>
            {timeLeft !== null ? formatTime(timeLeft) : "..."}
        </span>
        <span className="flex items-center gap-1 text-xs bg-black/20 px-2 py-1 rounded border border-white/20">
            <ShieldAlert size={12}/> AI Active
        </span>
      </div>

      {/* Canvas Display */}
      <div 
        className={`mt-12 bg-white p-2 rounded shadow-2xl transition-all duration-300 ${isWarningActive ? 'border-4 border-yellow-500 scale-105 shadow-yellow-500/50' : 'border border-transparent'}`} 
        onContextMenu={(e) => e.preventDefault()}
      >
        <canvas ref={canvasRef} className="block max-w-full shadow-inner" />
      </div>

      {/* Buttons */}
      <div className="mt-8 flex gap-4">
        <button 
            onClick={() => window.print()} 
            className="bg-white text-black px-8 py-3 rounded-full font-bold hover:bg-gray-200 transition flex items-center gap-2 shadow-lg border-2 border-gray-300"
        >
            🖨️ Print Document
        </button>
      </div>

      <style>{`@media print { body * { visibility: hidden; } canvas { visibility: visible; position: absolute; top: 0; left: 0; } .fixed, button { display: none; } }`}</style>
    </div>
  );
};

export default ViewDoc;