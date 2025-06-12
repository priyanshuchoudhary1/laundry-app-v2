import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "../context/AuthContext";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

// Pages
import Home from "./Home";
import About from "./AboutUs";
import Services from "./Services";
import SignUp from "./SignUp";
import Cart from "./Cart";
import TrackOrder from "./TrackOrder";
import Account from "./Account";
import LoginPage from "./LoginPage";
import Payment from "./Payment";
import BasicPayment from "./BasicPayment";
import OrderConfirmation from "./OrderConfirmation";
import QualityCleaning from "./QualityCleaning";
import FastDelivery from "./FastDelivery";
import AdminDashboard from "./AdminDashboard";

// Protected Route component
const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && user.role !== 'admin') {
    return <Navigate to="/account" replace />;
  }

  return children;
};

// Public routes that don't require authentication
const publicRoutes = [
  { path: "/", element: <Home /> },
  { path: "/about", element: <About /> },
  { path: "/services", element: <Services /> },
  { path: "/signup", element: <SignUp /> },
  { path: "/login", element: <LoginPage /> },
  { path: "/quality-cleaning", element: <QualityCleaning /> },
  { path: "/fast-delivery", element: <FastDelivery /> },
];

// Protected routes that require authentication
const protectedRoutes = [
  { path: "/cart", element: <Cart /> },
  { path: "/track-order", element: <TrackOrder /> },
  { path: "/account", element: <Account /> },
  { path: "/payment", element: <Payment /> },
  { path: "/basic-payment", element: <BasicPayment /> },
  { path: "/order-confirmation", element: <OrderConfirmation /> },
];

// Admin routes
const adminRoutes = [
  { path: "/admin-dashboard", element: <Navigate to="/admin-dashboard/dashboard" replace /> },
  { path: "/admin-dashboard/dashboard", element: <AdminDashboard /> },
  { path: "/admin-dashboard/users", element: <AdminDashboard /> },
  { path: "/admin-dashboard/orders", element: <AdminDashboard /> },
  { path: "/admin-dashboard/staff", element: <AdminDashboard /> },
  { path: "/admin-dashboard/services", element: <AdminDashboard /> },
  { path: "/admin-dashboard/payments", element: <AdminDashboard /> },
  { path: "/admin-dashboard/settings", element: <AdminDashboard /> },
];

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <div className="app-container">
          <Routes>
            {/* Public Routes */}
            {publicRoutes.map((route) => (
              <Route key={route.path} path={route.path} element={route.element} />
            ))}

            {/* Protected Routes */}
            {protectedRoutes.map((route) => (
              <Route
                key={route.path}
                path={route.path}
                element={<ProtectedRoute>{route.element}</ProtectedRoute>}
              />
            ))}

            {/* Admin Routes */}
            {adminRoutes.map((route) => (
              <Route
                key={route.path}
                path={route.path}
                element={
                  <ProtectedRoute requireAdmin={true}>{route.element}</ProtectedRoute>
                }
              />
            ))}

            {/* Catch all route - redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
