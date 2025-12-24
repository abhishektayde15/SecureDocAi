import { useState, useRef, useEffect } from "react";
import { useUser } from "./AuthContext"; 
import { useNavigate } from "react-router-dom"; // 👈 FIX: Import Added
import { LogOut, Settings, HelpCircle, Sparkles, X, Check, Crown, BarChart3, Zap, ShieldCheck } from "lucide-react";
import confetti from "canvas-confetti"; 

const UserButton = () => {
  const { user, logout } = useUser();
  const navigate = useNavigate(); // 👈 FIX: Hook Added
  const [isOpen, setIsOpen] = useState(false);
  const [showPricing, setShowPricing] = useState(false); 
  const [imgError, setImgError] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 🔥 FIX: Logout Logic (Ab ghumega nahi, seedha bahar)
  const handleLogout = async () => {
      await logout();
      navigate("/"); // Home page par bhejo
      window.location.reload(); // Hard Refresh
  };

  if (!user) return null;

  return (
    <>
    <div className="relative" ref={dropdownRef}>
      
      {/* 1. AVATAR BUTTON */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-white shadow-sm hover:shadow-md transition overflow-hidden focus:outline-none ring-offset-2 hover:ring-2 ring-blue-500"
      >
        {(user.imageUrl && !imgError) ? (
            <img 
                src={user.imageUrl} 
                alt="Profile" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
                onError={() => setImgError(true)}
            />
        ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-bold text-sm">
                {user.firstName ? user.firstName[0].toUpperCase() : "U"}
            </div>
        )}
      </button>

      {/* 2. DROPDOWN MENU */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 animate-in fade-in zoom-in-95 duration-200 origin-top-right overflow-hidden">
            
            {/* Header */}
            <div className="p-5 flex flex-col items-center border-b border-gray-100 bg-gray-50/50">
                <div className="w-16 h-16 rounded-full mb-3 shadow-sm border-4 border-white overflow-hidden">
                     {(user.imageUrl && !imgError) ? (
                        <img src={user.imageUrl} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full bg-blue-600 flex items-center justify-center text-white text-2xl font-bold">
                            {user.firstName ? user.firstName[0].toUpperCase() : "U"}
                        </div>
                    )}
                </div>
                <h3 className="text-base font-bold text-gray-900">{user.fullName}</h3>
                <p className="text-xs text-gray-500 mb-3">{user.primaryEmailAddress?.emailAddress}</p>
                
                <button 
                    onClick={() => { setIsOpen(false); setShowPricing(true); }}
                    className="px-4 py-1.5 bg-white border border-gray-300 rounded-full text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
                >
                    Manage Subscription
                </button>
            </div>

            {/* Plan Upgrade Trigger */}
            <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="p-1 bg-blue-100 rounded text-blue-600">
                        <Sparkles size={14} fill="currentColor" />
                    </div>
                    <span className="text-xs font-bold text-blue-800">Free Plan</span>
                </div>
                <button 
                    onClick={() => { setIsOpen(false); setShowPricing(true); }}
                    className="text-xs font-bold text-blue-600 hover:underline"
                >
                    Upgrade
                </button>
            </div>

            {/* Menu Items */}
            <div className="p-2">
                <MenuOption icon={<Settings size={18}/>} text="Settings" onClick={() => alert("Settings panel coming soon!")} />
                <MenuOption icon={<HelpCircle size={18}/>} text="Help & Support" onClick={() => alert("Support: support@securedoc.ai")} />
                
                <div className="h-px bg-gray-100 my-1 mx-2"></div>
                
                {/* 🔥 FIX: Updated Logout Button */}
                <button 
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl flex items-center gap-3 transition"
                >
                    <LogOut size={18} /> 
                    Sign Out
                </button>
            </div>
        </div>
      )}
    </div>

    {/* 3. PRICING MODAL (Shop Pro Version - Secure & Valid) */}
    {showPricing && <PricingModal onClose={() => setShowPricing(false)} />}
    </>
  );
};

// --- SUB COMPONENTS ---

const MenuOption = ({ icon, text, onClick }) => (
    <button onClick={onClick} className="w-full text-left px-4 py-3 text-sm text-gray-700 font-medium hover:bg-gray-100 rounded-xl flex items-center gap-3 transition group">
        <span className="text-gray-400 group-hover:text-gray-600 transition">{icon}</span>
        {text}
    </button>
);

const PricingModal = ({ onClose }) => {
    
    const handleSubscribe = () => {
        confetti({ particleCount: 150, spread: 60 });
        alert("Payment Gateway Integration (Razorpay/Stripe) will appear here in Production.");
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row relative">
                
                <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-gray-100 hover:bg-gray-200 rounded-full z-10">
                    <X size={20} />
                </button>

                {/* Left Side: Pitch */}
                <div className="md:w-1/3 bg-gray-900 p-8 text-white flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-blue-500 rounded-full blur-3xl opacity-20"></div>
                    <div>
                        <h2 className="text-3xl font-bold mb-4">Upgrade to <br/><span className="text-blue-400">Shop Pro</span></h2>
                        <p className="text-gray-400 text-sm leading-relaxed mb-6">
                            Grow your business with trust badges and analytics, without compromising user security.
                        </p>
                        <div className="flex items-center gap-3 text-sm text-gray-300">
                            <ShieldCheck size={16} className="text-green-400" />
                            <span>100% Privacy Compliant</span>
                        </div>
                    </div>
                </div>

                {/* Right Side: Plans */}
                <div className="md:w-2/3 p-8 bg-gray-50">
                    <div className="grid md:grid-cols-2 gap-4 h-full">
                        
                        {/* Free Plan */}
                        <div className="border border-gray-200 bg-white p-6 rounded-2xl flex flex-col">
                            <h3 className="font-bold text-gray-900 text-lg">Standard</h3>
                            <p className="text-2xl font-bold mt-2">₹0 <span className="text-sm text-gray-400 font-normal">/mo</span></p>
                            <p className="text-xs text-gray-500 mt-1 mb-6">For Students & Basic Shops</p>
                            
                            <ul className="space-y-3 mb-6 flex-1">
                                <li className="flex gap-2 text-sm text-gray-600"><Check size={16} className="text-green-500"/> Secure Watermark</li>
                                <li className="flex gap-2 text-sm text-gray-600"><Check size={16} className="text-green-500"/> User-Controlled Deletion</li>
                                <li className="flex gap-2 text-sm text-gray-400"><X size={16} className="text-gray-300"/> No Verified Badge</li>
                                <li className="flex gap-2 text-sm text-gray-400"><X size={16} className="text-gray-300"/> No Business Analytics</li>
                            </ul>
                            
                            <button disabled className="w-full py-2 bg-gray-100 text-gray-400 font-bold rounded-xl cursor-not-allowed">Current Plan</button>
                        </div>

                        {/* PRO Plan */}
                        <div className="border-2 border-blue-600 bg-white p-6 rounded-2xl flex flex-col relative shadow-xl transform md:-translate-y-4">
                            <div className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl rounded-tr-lg">
                                RECOMMENDED
                            </div>
                            <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                                Shop Pro <Sparkles size={16} className="text-blue-600"/>
                            </h3>
                            <p className="text-2xl font-bold mt-2">₹49 <span className="text-sm text-gray-400 font-normal">/mo</span></p>
                            <p className="text-xs text-gray-500 mt-1 mb-6">Boost Trust & Efficiency</p>
                            
                            <ul className="space-y-3 mb-6 flex-1">
                                {/* 🔥 USP Updated: No Watermark Removal (Security First) */}
                                <li className="flex gap-2 text-sm text-gray-800 font-medium"><Check size={16} className="text-blue-600"/> 'Verified Shop' Blue Tick</li>
                                <li className="flex gap-2 text-sm text-gray-800 font-medium"><BarChart3 size={16} className="text-blue-600"/> Daily Earnings Analytics</li>
                                <li className="flex gap-2 text-sm text-gray-800 font-medium"><Check size={16} className="text-blue-600"/> Custom Shop Link</li>
                                <li className="flex gap-2 text-sm text-gray-800 font-medium"><Zap size={16} className="text-blue-600"/> Priority High-Speed DL</li>
                            </ul>
                            
                            <button onClick={handleSubscribe} className="w-full py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-200">
                                Upgrade Now
                            </button>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
};

export default UserButton;