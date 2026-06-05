import React, { createContext, useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { SchoolProvider } from "./context/SchoolContext";

// --- VIEWS & AUTH ---
import Welcome from "./views/Welcome"; 
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
import GradeSheetReception from "./components/structure/pedagogie/GradeSheetReception";
import GradeSheetValidation from "./components/structure/pedagogie/GradeSheetValidation";

// --- COMPONENTS ÉLÈVE ---
// CORRECTION : Le chemin pointe maintenant vers le dossier structure où se trouvent les autres composants élèves
import StudentLinkAccount from "./components/structure/student/StudentLinkAccount";
import StudentPedagogyDashboard from "./components/dashboard/pedagogieDashboard/StudentPedagogyDashboard";
import StudentCourses from "./components/structure/student/StudentCourses";
import StudentLibrary from "./components/structure/student/StudentLibrary";
import StudentSchedule from "./components/structure/student/StudentSchedule";
import StudentAttendance from "./components/structure/student/StudentAttendance";
import StudentFinance from "./components/structure/student/StudentFinance";
import StudentSettings from "./components/structure/student/StudentSettings";

// --- COMPONENTS ENSEIGNANT ---
import TeacherEvaluationDashboard from "./components/dashboard/pedagogieDashboard/TeacherEvaluationDashboard";
import TeacherClassesManager from "./components/structure/pedagogie/TeacherClassesManager";
import TitulaireDashboard from "./components/structure/pedagogie/TitulaireDashboard";
import TitulaireGradeSheetValidation from "./components/structure/pedagogie/TitulaireGradeSheetValidation"; // NOUVEL IMPORT

// --- IMPORT DU SERVICE POUR LA VÉRIFICATION DE SÉCURITÉ DU TITULAIRE ---
import titulaireService from "./services/pedagogieService/titulaireService";

export const ThemeContext = createContext();
export const LanguageContext = createContext();

// --- COMPOSANT DE GARDE INTERNE POUR LA ROUTE DE TITULARISATION ---
const TitulaireRoute = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const user = JSON.parse(localStorage.getItem('user')) || {};

  useEffect(() => {
    const verifyTitulaireAccess = async () => {
      const teacherId = user.teacherId || user.id;
      const academicYearId = user.academicYearId || user.currentAcademicYearId || localStorage.getItem('academicYearId') || localStorage.getItem('currentAcademicYearId') || null;

      if (teacherId) {
        try {
          const classrooms = await titulaireService.getMyClassrooms(teacherId, academicYearId);
          if (classrooms && classrooms.length > 0) {
            setHasAccess(true);
          }
        } catch (error) {
          console.error("Erreur lors de la validation d'accès de la route titulaire:", error);
        }
      }
      setIsLoading(false);
    };

    verifyTitulaireAccess();
  }, [user.id, user.teacherId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50 dark:bg-slate-950">
        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return hasAccess ? children : <Navigate to="/enseignant/dashboard" replace />;
};

function App() {
  const [theme, setTheme] = useState(localStorage.getItem('app-theme') || 'light');
  const [language, setLanguage] = useState(localStorage.getItem('app-lang') || 'FR');

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('app-theme', newTheme);
  };

  const toggleLanguage = () => {
    const newLang = language === 'FR' ? 'EN' : 'FR';
    setLanguage(newLang);
    localStorage.setItem('app-lang', newLang);
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
      <LanguageContext.Provider value={{ language, toggleLanguage }}>
        <SchoolProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Welcome />} />
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
                <Route path="reception-fiches" element={<GradeSheetReception />} />
                <Route path="validation-fiche/:assignmentId/:period" element={<GradeSheetValidation />} />
                <Route index element={<Navigate to="dashboard" />} />
              </Route>

              {/* --- GROUPE ENSEIGNANT PROTÉGÉ --- */}
              <Route path="/enseignant" element={<ProtectedRoute allowedRoles={["ENSEIGNANT", "ROLE_ENSEIGNANT", "ADMIN", "ROLE_ADMIN"]}><TeacherLayout /></ProtectedRoute>}>
                <Route path="dashboard" element={<TeacherEvaluationDashboard />} />
                <Route path="classes" element={<TeacherClassesManager />} />
                <Route path="titulaire" element={<TitulaireRoute><TitulaireDashboard /></TitulaireRoute>} />
                {/* NOUVELLE ROUTE POUR LA VALIDATION DES FICHES PAR LE TITULAIRE */}
                <Route path="titulaire/validation-fiche/:assignmentId/:period" element={<TitulaireRoute><TitulaireGradeSheetValidation /></TitulaireRoute>} />
                <Route index element={<Navigate to="dashboard" />} />
              </Route>

              {/* --- GROUPE ÉLÈVE PROTÉGÉ --- */}
              <Route path="/student" element={<ProtectedRoute allowedRoles={["ELEVE", "ROLE_ELEVE", "ADMIN", "ROLE_ADMIN"]}><StudentPedagogyLayout /></ProtectedRoute>}>
                <Route path="link-account" element={<StudentLinkAccount />} />
                <Route path="dashboard" element={<StudentPedagogyDashboard />} />
                <Route path="courses" element={<StudentCourses />} />
                <Route path="library" element={<StudentLibrary />} />
                <Route path="schedule" element={<StudentSchedule />} />
                <Route path="attendance" element={<StudentAttendance />} />
                <Route path="finance" element={<StudentFinance />} />
                <Route path="settings" element={<StudentSettings />} />
                <Route index element={<Navigate to="dashboard" />} />
              </Route>

              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </Router>
        </SchoolProvider>
      </LanguageContext.Provider>
    </ThemeContext.Provider>
  );
}

export default App;