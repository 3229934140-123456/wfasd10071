import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import Login from "@/pages/auth/Login";
import Dashboard from "@/pages/dashboard/Dashboard";
import PetList from "@/pages/pets/PetList";
import PetDetail from "@/pages/pets/PetDetail";
import PetForm from "@/pages/pets/PetForm";
import MedicalList from "@/pages/medical/MedicalList";
import MedicalDetail from "@/pages/medical/MedicalDetail";
import MedicalForm from "@/pages/medical/MedicalForm";
import VaccineList from "@/pages/vaccine/VaccineList";
import HospitalizationList from "@/pages/hospitalization/HospitalizationList";
import HospitalizationDetail from "@/pages/hospitalization/HospitalizationDetail";
import MedicineList from "@/pages/pharmacy/MedicineList";
import Statistics from "@/pages/statistics/Statistics";
import { useAuthStore } from "@/store/authStore";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user, setUser } = useAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token && !user) {
      const mockUser = {
        id: 1,
        username: "admin",
        name: "张管理员",
        role: "admin" as const,
        phone: "13800138000",
      };
      setUser(mockUser);
    }
    setLoading(false);
  }, [user, setUser]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="pets" element={<PetList />} />
          <Route path="pets/new" element={<PetForm />} />
          <Route path="pets/:id" element={<PetDetail />} />
          <Route path="pets/:id/edit" element={<PetForm />} />
          <Route path="medical" element={<MedicalList />} />
          <Route path="medical/new" element={<MedicalForm />} />
          <Route path="medical/:id" element={<MedicalDetail />} />
          <Route path="vaccine" element={<VaccineList />} />
          <Route path="hospitalization" element={<HospitalizationList />} />
          <Route path="hospitalization/:id" element={<HospitalizationDetail />} />
          <Route path="pharmacy" element={<MedicineList />} />
          <Route path="statistics" element={<Statistics />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
