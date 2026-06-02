import React, { createContext, useState, useEffect, useContext } from "react";
import schoolConfigService from "../services/admin/schoolConfigService";
import academicYearService from "../services/academicYearService";

const SchoolContext = createContext();

export const SchoolProvider = ({ children }) => {
  const [schoolConfig, setSchoolConfig] = useState({
        schoolName: "",
        slogan: "",
        logoBase64: null,
        address: "",
        phone: "",
        email: "",
        website: "",
        province: "",
        city: "",
        subdivision: "",
        decreeOfCreation: "",
        headmasterName: "",
        academicProviseur: "",
        defaultCashierName: "",
  });

  const [activeYear, setActiveYear] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchSchoolConfig = async () => {
    try {
      const data = await schoolConfigService.getSchoolConfig();
      if (data) {
        setSchoolConfig({
          ...data,
          schoolName: data.schoolName || "Institution",
        });
      }
    } catch (error) {
      console.error("Erreur lors du chargement de la configuration scolaire:", error);
    }
  };

  const fetchActiveYear = async () => {
    try {
      // Utilisation correcte du service importé : academicYearService
      const response = await academicYearService.getActiveYear();
      if (response && response.data) {
        setActiveYear(response.data);
      }
    } catch (error) {
      console.error("Erreur lors du chargement de l'année active:", error);
    }
  };

  useEffect(() => {
    const initData = async () => {
        setLoading(true);
        await Promise.all([fetchSchoolConfig(), fetchActiveYear()]);
        setLoading(false);
    };
    initData();
  }, []);

  return (
    <SchoolContext.Provider value={{ schoolConfig, activeYear, updateSchoolConfig: fetchSchoolConfig, loading }}>
      {children}
    </SchoolContext.Provider>
  );
};

export const useSchool = () => useContext(SchoolContext);