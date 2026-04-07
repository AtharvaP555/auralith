import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import useAuthStore from "../store/authStore";
import toast from "react-hot-toast";

const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setAuth } = useAuthStore();

  useEffect(() => {
    const accessToken = searchParams.get("accessToken");
    const refreshToken = searchParams.get("refreshToken");
    const userId = searchParams.get("userId");
    const name = searchParams.get("name");
    const email = searchParams.get("email");
    const role = searchParams.get("role");
    const error = searchParams.get("error");

    if (error) {
      toast.error("Google sign in failed. Please try again.");
      navigate("/login");
      return;
    }

    if (accessToken && refreshToken) {
      setAuth({ id: userId, name, email, role }, accessToken, refreshToken);
      toast.success("Signed in with Google!");
      navigate("/");
    } else {
      toast.error("Something went wrong. Please try again.");
      navigate("/login");
    }
  }, [navigate, searchParams, setAuth]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-gray-900 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-gray-500">Signing you in...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
