import React, { createContext, useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { SchoolProvider } from "./context/SchoolContext";

// --- VIEWS & AUTH ---
import Landing from "./views/Landing";
import Login from "./views/Login";
import Register from "./views/Register";
import ProtectedRoute from "./components/ProtectedRoute"; 

// --- LAYOUTS ---
import AdminLayout from "./components/layouts/AdminLayout";
import CashierLayout from "./components/layouts/CashierLayout"; 
import RegisterStudents from "./components/layouts/RegisterStudents"; 
import ProviseurLayout from "./components/layouts/ProviseurLayout"; 
import StudentPedagogyLayout from "./components/layouts/StudentPedagogyLayout"; 
import TeacherLayout from "./components/layouts/TeacherLayout";

// --- COMPONENTS ADMIN ---
import DashboardStats from "./components/dashboard/DashboardStats";
import AnneeScolaire from "./components/structure/anneeScolaire";
import NiveauScolaire from "./components/structure/NiveauScolaire";
import SectionsOptions from "./components/structure/SectionsOptions"; 
import RoomManager from "./components/structure/RoomManager";
import ClassroomManager from "./components/structure/ClassroomManager";
import EnrollmentModule from "./components/structure/EnrollmentModule"; 
import StudentManagement from "./components/structure/StudentManagement";
import ArchiveDashboard from "./components/structure/ArchiveDashboard";
import FinanceAdmin from "./components/structure/FinanceAdmin"; 
import SettingsDashboard from "./components/structure/admin/SettingsDashboard";
import RoleAccessManager from "./components/structure/admin/RoleAccessManager"; 

// --- COMPONENTS CAISSIER ---
import CashierDashboard from "./components/dashboard/CashierDashboard";
import PaymentWindow from "./components/structure/PaymentWindow";
import RecouvrementFraisManager from "./components/structure/RecouvrementFraisManager";
import FinancialAccountManager from "./components/structure/FinancialAccountManager";
import ExpenseManager from "./components/structure/ExpenseManager";
import TransactionHistory from "./components/structure/TransactionHistory";
import CashReceipts from "./components/structure/CashReceipts"; 

// --- COMPONENTS PREFET ---
import RegisterStudentsDashboard from "./components/dashboard/RegisterStudentsDashboard";

// --- COMPONENTS PROVISEUR ---
import PedagogieDashboard from "./components/dashboard/pedagogieDashboard/PedagogieDashboard";
import TeacherManagement from "./components/structure/pedagogie/TeacherManagement";
import CourseManagement from "./components/structure/pedagogie/CourseManagement";
import ScheduleManagement from "./components/structure/pedagogie/ScheduleManagement";
import AttendanceManagement from "./components/structure/pedagogie/AttendanceManagement";
import TeacherAssignment from "./components/structure/pedagogie/TeacherAssignment"; 

// --- COMPONENTS ÉLÈVE ---
import StudentPedagogyDashboard from "./components/dashboard/pedagogieDashboard/StudentPedagogyDashboard";

// --- COMPONENTS ENSEIGNANT ---
import TeacherEvaluationDashboard from "./components/dashboard/pedagogieDashboard/TeacherEvaluationDashboard";
// CORRECTION ICI : Pointage vers le bon dossier structure/pedagogie
import TeacherClassesManager from "./components/structure/pedagogie/TeacherClassesManager";

export const ThemeContext = createContext();

function App() {
  const [theme, setTheme] = useState(localStorage.getItem('app-theme') || 'light');

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('app-theme', newTheme);
  };

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <SchoolProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* --- GROUPE ADMIN PROTÉGÉ --- */}
            <Route element={<ProtectedRoute allowedRoles={["ADMIN", "ROLE_ADMIN","ROLE_ADMIN_SYSTEM"]}><AdminLayout /></ProtectedRoute>}>
              <Route path="/dashboard" element={<DashboardStats />} />
              <Route path="/annee-scolaire" element={<AnneeScolaire />} />
              <Route path="/niveaux" element={<NiveauScolaire />} />
              <Route path="/sections-options" element={<SectionsOptions />} />
              <Route path="/classes" element={<ClassroomManager />} />
              <Route path="/salles" element={<RoomManager />} />
              <Route path="/registre" element={<StudentManagement />} />
              <Route path="/inscriptions" element={<EnrollmentModule />} />
              <Route path="/archives" element={<ArchiveDashboard />} />
              <Route path="/finances" element={<FinanceAdmin />} />
              <Route path="/roles" element={<RoleAccessManager />} /> 
              <Route path="/parametres" element={<SettingsDashboard />} />
            </Route>

            {/* --- GROUPE CAISSIER PROTÉGÉ --- */}
            <Route element={<ProtectedRoute allowedRoles={["CAISSIER", "ROLE_CAISSIER", "ADMIN", "ROLE_ADMIN"]}><CashierLayout /></ProtectedRoute>}>
              <Route path="/caissier/dashboard" element={<CashierDashboard />} />
              <Route path="/caissier/paiements" element={<PaymentWindow />} />
              <Route path="/caissier/recouvrement" element={<RecouvrementFraisManager />} />
              <Route path="/caissier/comptes" element={<FinancialAccountManager />} />
              <Route path="/caissier/entrees-caisse" element={<CashReceipts />} />
              <Route path="/caissier/depenses" element={<ExpenseManager />} />
              <Route path="/caissier/historique" element={<TransactionHistory />} />
            </Route>

            {/* --- GROUPE PRÉFET PROTÉGÉ --- */}
            <Route path="/prefet" element={<ProtectedRoute allowedRoles={["PREFET", "ROLE_PREFET", "ADMIN", "ROLE_ADMIN"]}><RegisterStudents /></ProtectedRoute>}>
              <Route path="dashboard" element={<RegisterStudentsDashboard />} />
              <Route path="eleves" element={<StudentManagement />} />
              <Route path="inscriptions" element={<EnrollmentModule />} />
              <Route path="cours" element={<SectionsOptions />} />
              <Route index element={<Navigate to="dashboard" />} />
            </Route>

            {/* --- GROUPE PROVISEUR PROTÉGÉ --- */}
            <Route path="/proviseur" element={<ProtectedRoute allowedRoles={["PROVISEUR", "ROLE_PROVISEUR", "ADMIN", "ROLE_ADMIN"]}><ProviseurLayout /></ProtectedRoute>}>
              <Route path="dashboard" element={<PedagogieDashboard />} />
              <Route path="enseignants" element={<TeacherManagement />} />
              <Route path="unites-cours" element={<CourseManagement />} />
              <Route path="affectations" element={<TeacherAssignment />} />
              <Route path="horaires" element={<ScheduleManagement />} />
              <Route path="presences" element={<AttendanceManagement />} />
              <Route index element={<Navigate to="dashboard" />} />
            </Route>

            {/* --- GROUPE ENSEIGNANT PROTÉGÉ --- */}
            <Route path="/enseignant" element={<ProtectedRoute allowedRoles={["ENSEIGNANT", "ROLE_ENSEIGNANT", "ADMIN", "ROLE_ADMIN"]}><TeacherLayout /></ProtectedRoute>}>
              <Route path="dashboard" element={<TeacherEvaluationDashboard />} />
              <Route path="classes" element={<TeacherClassesManager />} />
              <Route index element={<Navigate to="dashboard" />} />
            </Route>

            {/* --- GROUPE ÉLÈVE PROTÉGÉ --- */}
            <Route path="/student" element={<ProtectedRoute allowedRoles={["ELEVE", "ROLE_ELEVE", "ADMIN", "ROLE_ADMIN"]}><StudentPedagogyLayout /></ProtectedRoute>}>
              <Route path="dashboard" element={<StudentPedagogyDashboard />} />
              <Route path="results" element={<StudentPedagogyDashboard />} />
              <Route path="schedule" element={<StudentPedagogyDashboard />} />
              <Route index element={<Navigate to="dashboard" />} />
            </Route>

            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Router>
      </SchoolProvider>
    </ThemeContext.Provider>
  );
}

export default App;