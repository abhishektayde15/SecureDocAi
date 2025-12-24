import { useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Webcam from "react-webcam";
import axios from "axios";
import { ShieldAlert } from "lucide-react";

const Verify = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const webcamRef = useRef(null);
  const [name, setName] = useState("");
  const [verifying, setVerifying] = useState(false);

  const handleVerify = async () => {
    if (!name) return alert("Please enter Name");
    setVerifying(true);
    const imageSrc = webcamRef.current.getScreenshot();

    try {
      await axios.post("http://localhost:5000/api/verify", {
        secureId: id, name, snapshot: imageSrc
      });
      navigate(`/view/${id}`);
    } catch (err) { alert("Verification Failed or Link Expired"); }
    setVerifying(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4 text-white">
      <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl max-w-md w-full text-center">
        <ShieldAlert className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Identity Verification</h1>
        <p className="text-gray-400 mb-6 text-sm">To access this secure document, please provide your name and face snapshot.</p>
        
        <div className="rounded-lg overflow-hidden border-2 border-blue-500 mb-4 bg-black">
          <Webcam audio={false} ref={webcamRef} screenshotFormat="image/jpeg" width={400} />
        </div>

        <input type="text" placeholder="Enter Your Name (e.g. Ravi Cafe)" 
          value={name} onChange={(e) => setName(e.target.value)}
          className="w-full p-3 rounded bg-gray-700 border border-gray-600 text-white mb-4 focus:ring-2 focus:ring-blue-500 outline-none"
        />

        <button onClick={handleVerify} disabled={verifying} className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-lg font-bold transition">
          {verifying ? "Verifying..." : "Verify & Open Document"}
        </button>
      </div>
    </div>
  );
};
export default Verify;