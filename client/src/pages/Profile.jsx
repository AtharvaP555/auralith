import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Package, User } from "lucide-react";
import { getMe } from "../api/auth";
import useAuthStore from "../store/authStore";

const Profile = () => {
  const { user: storeUser } = useAuthStore();

  const { data, isLoading } = useQuery({
    queryKey: ["me"],
    queryFn: getMe,
  });

  const user = data?.data?.user || storeUser;

  if (isLoading) {
    return (
      <div className="max-w-lg mx-auto animate-pulse space-y-4">
        <div className="h-24 bg-gray-100 rounded-2xl" />
        <div className="h-32 bg-gray-100 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Profile</h1>

      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-4">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-full bg-gray-900 flex items-center justify-center">
            <span className="text-white text-lg font-semibold">
              {user?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="text-base font-semibold text-gray-900">
              {user?.name}
            </p>
            <p className="text-sm text-gray-500">{user?.email}</p>
          </div>
        </div>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-500">Role</span>
            <span className="font-medium text-gray-900 capitalize">
              {user?.role?.toLowerCase()}
            </span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-gray-500">Member since</span>
            <span className="font-medium text-gray-900">
              {user?.createdAt
                ? new Date(user.createdAt).toLocaleDateString("en-IN", {
                    month: "long",
                    year: "numeric",
                  })
                : "—"}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 divide-y divide-gray-100">
        <Link
          to="/orders"
          className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Package size={18} className="text-gray-400" />
            <span className="text-sm font-medium text-gray-900">My orders</span>
          </div>
          <span className="text-gray-400">›</span>
        </Link>
      </div>
    </div>
  );
};

export default Profile;
