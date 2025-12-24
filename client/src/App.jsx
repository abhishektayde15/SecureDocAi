import { useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Navbar from './Navbar.jsx';
import Home from './Home.jsx';
import ViewDoc from './ViewDoc.jsx';
import ShopDashboard from './ShopDashboard.jsx';
import Footer from './Footer.jsx'; // 👈 IMPORT FOOTER
import { SignedIn, SignedOut, SignInButton, useUser } from "./AuthContext";
import { User, Store } from "lucide-react"; 

function App() {
  const { user, isLoaded } = useUser();
  const navigate = useNavigate();

  // 🔥 MAGIC FIX: Login ke baad check karo ki banda Owner banna chahta tha kya?
  useEffect(() => {
    if (isLoaded && user) {
        const intent = localStorage.getItem("userType");
        
        if (intent === "owner") {
            navigate("/shop-dashboard"); // Force redirect to Dashboard
            localStorage.removeItem("userType"); // Clean up
        }
    }
  }, [isLoaded, user, navigate]);

  // Helper function to set memory
  const handleOwnerClick = () => {
      localStorage.setItem("userType", "owner");
  };

  return (
    // 🔥 flex-col zaroori hai taaki footer bottom pe rahe
    <div className="min-h-screen bg-gray-50 flex flex-col"> 
      <Navbar />
      
      {/* 🔥 flex-grow content ko expand karega aur footer ko push karega */}
      <div className="flex-grow"> 
        <Routes>
            {/* Route 1: Home Page (Logic for both User & Guest) */}
            <Route path="/" element={
            <>
                <SignedIn><Home /></SignedIn>
                
                <SignedOut>
                {/* --- LANDING PAGE DESIGN --- */}
                <div className="flex flex-col items-center justify-center min-h-[85vh] p-4 bg-gradient-to-b from-blue-50 to-white">
                    <div className="text-center mb-12">
                        <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mb-4 tracking-tight">
                            SecureDoc AI
                        </h1>
                        <p className="text-xl text-gray-500 max-w-md mx-auto">
                            The safest way to share documents with Cyber Cafes & Print Shops.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 w-full max-w-4xl">
                        
                        {/* OPTION 1: USER CARD */}
                        <div className="bg-white p-8 rounded-2xl shadow-xl border border-blue-50 hover:shadow-2xl transition hover:-translate-y-1 group">
                            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition">
                                <User size={32} className="text-blue-600"/>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">I want to Send Files</h2>
                            <p className="text-gray-500 mb-8 h-12">
                                Upload documents securely and share them via Link or Shop ID.
                            </p>
                            
                            <SignInButton mode="modal">
                                <button className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition shadow-lg shadow-blue-200">
                                    Sign In as User
                                </button>
                            </SignInButton>
                        </div>

                        {/* OPTION 2: SHOP OWNER CARD */}
                        <div className="bg-white p-8 rounded-2xl shadow-xl border border-orange-50 hover:shadow-2xl transition hover:-translate-y-1 group">
                            <div className="bg-black w-16 h-16 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition">
                                <Store size={32} className="text-white"/>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">I am a Shop Owner</h2>
                            <p className="text-gray-500 mb-8 h-12">
                                Receive files directly on your computer. Get your Unique Shop ID.
                            </p>

                            {/* 🔥 Added onClick to save 'owner' intent */}
                            <SignInButton mode="modal">
                                <button 
                                    onClick={handleOwnerClick} 
                                    className="w-full bg-black text-white py-4 rounded-xl font-bold text-lg hover:bg-gray-800 transition shadow-lg shadow-gray-300"
                                >
                                    Sign In as Owner
                                </button>
                            </SignInButton>
                        </div>

                    </div>
                </div>
                </SignedOut>
            </>
            } />

            {/* Other Routes */}
            <Route path="/view/:id" element={<ViewDoc />} />
            <Route path="/shop-dashboard" element={<ShopDashboard />} />
        </Routes>
      </div>

      {/* 🔥 Footer Added Here */}
      <Footer /> 
    </div>
  );
}
export default App;