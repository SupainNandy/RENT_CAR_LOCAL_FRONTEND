import React, { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";

import UserLayout from "../layout/UserLayout.jsx";
import AdminLayout from "../layout/AdminLayout.jsx";

import AdminProtectedRoute from "../protected/AdminProtectedRoute.jsx";
import UserProtectedRoute from "../protected/UserProtectedRoute.jsx";
import UserChat from "../Component/UserChat.jsx";


// Lazy Loaded Pages
const RegisterUser = lazy(() => import("../pages/RegisterUser"));
const LoginUser = lazy(() => import("../pages/LoginUser"));
const RegisterAdmin = lazy(() => import("../pages/RegisterAdmin"));
const AdminLogin = lazy(() => import("../pages/Adminlogin"));

const Dashboard = lazy(() => import("../pages/Dashboard"));
const BookingPage = lazy(() => import("../pages/Bookingpage"));
const MyBookings = lazy(() => import("../pages/MyBooking"));
const UserProfile = lazy(() => import("../pages/UserProfile"));

const AdminDashboard = lazy(() => import("../pages/Admindashboard"));

const AdminAI = lazy(() => import("../pages/AdminAi"));

const Home = lazy(() => import("../pages/Home"));

const Admin = lazy(() => import("../Component/Admin.jsx"));

const We = lazy(() => import("../pages/We.jsx"));

const Payment = lazy(() => import("../pages/Payment.jsx"));

const MainRoutes = () => {
  return (
    <Suspense fallback={<h2 className="text-center mt-5">Loading...</h2>}>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/dashboard" element={<Dashboard />} /> 

        {/* User Routes */}
        <Route
          path="/user"
          element={
            <UserProtectedRoute>
              <UserLayout />
            </UserProtectedRoute>
          }
        >
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="mybookings" element={<MyBookings />} />
          <Route path="user-profile" element={<UserProfile />} />
          <Route path="booking/:carId" element={<BookingPage />} />
          <Route path="payment" element={<Payment />} />
          {/* <Route path="agent" element={<UserChat/>} /> */}
        </Route>

          
        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <AdminProtectedRoute>
              <AdminLayout />
            </AdminProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />

          <Route
            path="admin-dashboard"
            element={<AdminDashboard />}
          />

          <Route
            path="admin-ai"
            element={<AdminAI />}
          />
        </Route>

        {/* Auth Routes */}
        <Route path="/register-user" element={<RegisterUser />} />
        <Route path="/login-user" element={<LoginUser />} />

          {/* Know Us  */}
          <Route path='/we' element={<We />} />

        <Route path="/register-admin" element={<RegisterAdmin />} />
        <Route path="/login-admin" element={<AdminLogin />} />

        {/* 404 */}
        <Route path="*" element={<h1>404 Not Found</h1>} />
      </Routes>
    </Suspense>
  );
};

export default MainRoutes;