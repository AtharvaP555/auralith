import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, User, LogOut, Package } from "lucide-react";
import toast from "react-hot-toast";
import useAuthStore from "../../store/authStore";
import useCartStore from "../../store/cartStore";
import { logoutUser } from "../../api/auth";

const Navbar = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { getTotalItems, toggleCart } = useCartStore();

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      await logoutUser(refreshToken);
    } catch {
      // proceed anyway
    }
    logout();
    toast.success("Logged out");
    navigate("/login");
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link
            to="/"
            className="text-xl font-bold text-gray-900 tracking-tight"
          >
            Auralith
          </Link>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <button
                  onClick={toggleCart}
                  className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <ShoppingCart size={20} />
                  {getTotalItems() > 0 && (
                    <span className="absolute -top-1 -right-1 bg-gray-900 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                      {getTotalItems()}
                    </span>
                  )}
                </button>

                {user?.role === "ADMIN" && (
                  <Link
                    to="/admin"
                    className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    <Package size={20} />
                  </Link>
                )}

                <Link
                  to="/profile"
                  className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <User size={20} />
                </Link>

                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <LogOut size={20} />
                </button>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="text-sm bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
