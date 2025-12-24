import { Link } from "react-router-dom";
import { useUser } from "./AuthContext"; 
import UserButton from "./UserButton"; // 👈 Ye Nayi Line hai (File ka naam check kar lena)
import { Shield } from "lucide-react";

const Navbar = () => {
  const { isSignedIn } = useUser();
  
  return (
    <nav className="flex justify-between items-center p-4 bg-white shadow-md no-print relative z-50">
      <Link to="/" className="flex items-center gap-2 text-xl font-bold text-blue-600 hover:text-blue-700 transition">
        <Shield /> SecureDoc AI
      </Link>
      
      {isSignedIn && <UserButton />}
    </nav>
  );
};

export default Navbar;