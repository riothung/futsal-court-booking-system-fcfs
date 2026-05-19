import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import Booking from "./pages/BookingPage/Booking";
import ManageCourts from "./pages/ManageCourts/ManageCourts";
import ManageBookings from "./pages/ManageBookings/ManageBookings";
import ManageUsers from "./pages/ManageUsers/ManageUsers";
import MyBookings from "./pages/MyBookings/MyBookings";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import ProtectedRoute from "./components/auth/ProtectedRoute";

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Navigate to="/signin" replace />} />

        <Route element={<AppLayout />}>
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manage-courts"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <ManageCourts />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manage-bookings"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <ManageBookings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manage-users"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <ManageUsers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/booking"
            element={
              <ProtectedRoute allowedRoles={["admin", "user"]}>
                <Booking />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-bookings"
            element={
              <ProtectedRoute allowedRoles={["admin", "user"]}>
                <MyBookings />
              </ProtectedRoute>
            }
          />
        </Route>

        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}
