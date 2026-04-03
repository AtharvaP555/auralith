import { Routes, Route, Navigate } from "react-router-dom";
import useAuthStore from "./store/authStore";
import Layout from "./components/layout/Layout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";
import OrderDetail from "./pages/OrderDetail";
import Profile from "./pages/Profile";
import Home from "./pages/Home";
import AdminDashboard from "./pages/admin/AdminDashboard";
import Wishlist from "./pages/Wishlist";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import api from "./api/axios";
import AddressBook from "./pages/AddressBook";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const GuestRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  return !isAuthenticated ? children : <Navigate to="/" replace />;
};

const TokenRefresher = () => {
  useEffect(() => {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) return;

    api
      .post("/auth/refresh", { refreshToken })
      .then((res) => {
        const newToken = res.data.data.accessToken;
        localStorage.setItem("accessToken", newToken);
      })
      .catch(() => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
      });
  }, []);

  return null;
};

const App = () => {
  return (
    <>
      <TokenRefresher />
      <Routes>
        <Route
          path="/login"
          element={
            <GuestRoute>
              <Login />
            </GuestRoute>
          }
        />
        <Route
          path="/register"
          element={
            <GuestRoute>
              <Register />
            </GuestRoute>
          }
        />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout>
                <Home />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/products"
          element={
            <ProtectedRoute>
              <Layout>
                <Products />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/products/:slug"
          element={
            <ProtectedRoute>
              <Layout>
                <ProductDetail />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <Layout>
                <Checkout />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <Layout>
                <Orders />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders/:id"
          element={
            <ProtectedRoute>
              <Layout>
                <OrderDetail />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <Layout>
                <AdminDashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Layout>
                <Profile />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/wishlist"
          element={
            <ProtectedRoute>
              <Layout>
                <Wishlist />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/addresses"
          element={
            <ProtectedRoute>
              <Layout>
                <AddressBook />
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
};

export default App;
