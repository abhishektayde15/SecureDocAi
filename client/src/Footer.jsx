import { Shield, Github, Twitter, Heart } from "lucide-react";

const Footer = () => {
  return (
    // 🔥 BALANCE: 'py-8' (Na bahut bada, na bahut chhota - Perfect size)
    <footer className="bg-white border-t border-gray-100 py-8 no-print mt-auto">
        <div className="max-w-5xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
            
            {/* LEFT: Brand Info */}
            <div className="flex flex-col items-center md:items-start gap-2">
                <div className="flex items-center gap-2 text-sm font-bold text-gray-800">
                    <Shield size={18} className="fill-blue-100 text-blue-600" /> 
                    SecureDoc AI
                </div>
                <p className="text-[11px] text-gray-400">
                    © {new Date().getFullYear()} • Secure. Encrypted. Fast.
                </p>
            </div>

            {/* MIDDLE: Quick Links */}
            <div className="flex gap-6 text-[11px] font-medium text-gray-500">
                <a href="#" className="hover:text-blue-600 transition">Privacy Policy</a>
                <a href="#" className="hover:text-blue-600 transition">Terms of Service</a>
                <a href="#" className="hover:text-blue-600 transition">Help Center</a>
            </div>

            {/* RIGHT: Made with Love */}
            <div className="flex items-center gap-2 text-[11px] text-gray-400 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                <span>Made with</span>
                <Heart size={10} className="text-red-500 fill-red-500"/>
                <span>in India</span>
            </div>

        </div>
    </footer>
  );
};

export default Footer;