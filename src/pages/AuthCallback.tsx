import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const success = searchParams.get("success");
        const error = searchParams.get("error");
        const token = searchParams.get("token");

        if (error) {
          toast.error(decodeURIComponent(error));
          navigate("/login");
          return;
        }

        if (success === "true" && token) {
          // Store the access token
          localStorage.setItem("accessToken", token);
          
          // Fetch user data using the token
          try {
            const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            });

            if (response.ok) {
              const userData = await response.json();
              localStorage.setItem("user", JSON.stringify(userData.data.user));
              toast.success("Successfully logged in with Google!");
              navigate("/dashboard");
            } else {
              throw new Error("Failed to fetch user data");
            }
          } catch (fetchError) {
            console.error("Error fetching user data:", fetchError);
            toast.error("Login successful but failed to fetch user data");
            navigate("/dashboard");
          }
        } else {
          toast.error("Authentication failed");
          navigate("/login");
        }
      } catch (error) {
        console.error("Auth callback error:", error);
        toast.error("Authentication failed");
        navigate("/login");
      } finally {
        setIsProcessing(false);
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-slate-900 to-indigo-900 text-white">
      <div className="max-w-md w-full bg-slate-800/50 backdrop-blur-sm p-8 rounded-xl border border-indigo-500/30 text-center">
        <h2 className="text-2xl font-bold mb-4">Processing Authentication</h2>
        {isProcessing ? (
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            <p className="text-gray-300">Please wait while we complete your login...</p>
          </div>
        ) : (
          <p className="text-gray-300">Redirecting...</p>
        )}
      </div>
    </div>
  );
}

export default AuthCallback;
