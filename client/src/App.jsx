import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Home from '@/pages/Home';
import Packages from '@/pages/Packages';
import Events from '@/pages/Events';
import Reviews from '@/pages/Reviews';
import BookAppointment from '@/pages/BookAppointment';
import MyAppointments from '@/pages/MyAppointments';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminRoute from '@/components/AdminRoute';
import AdminPackages     from '@/pages/admin/Packages';
import AdminEvents       from '@/pages/admin/Events';
import AdminAppointments from '@/pages/admin/Appointments';
import { useAppointmentAlert } from '@/hooks/useAppointmentAlert.jsx';
import api from '@/services/api';

// Runs hooks that need Router + Auth context
function AppEffects() {
  useAppointmentAlert();

  // Wake up the Render free-tier server on first load
  useEffect(() => {
    api.get('/health').catch(() => {});
  }, []);

  return null;
}

function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <AppEffects />
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/"                  element={<Home />} />
          <Route path="/packages"          element={<Packages />} />
          <Route path="/events"            element={<Events />} />
          <Route path="/reviews"           element={<Reviews />} />
          <Route path="/book"              element={<BookAppointment />} />
          <Route path="/login"             element={<Login />} />
          <Route path="/register"          element={<Register />} />
          <Route
            path="/my-appointments"
            element={
              <ProtectedRoute>
                <MyAppointments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/packages"
            element={
              <AdminRoute>
                <AdminPackages />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/events"
            element={
              <AdminRoute>
                <AdminEvents />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/appointments"
            element={
              <AdminRoute>
                <AdminAppointments />
              </AdminRoute>
            }
          />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
