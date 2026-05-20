import React, { createContext, useState, useEffect, useContext } from "react";
import schoolConfigService from "../services/admin/schoolConfigService";

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

  const [loading, setLoading] = useState(true);

  const fetchSchoolConfig = async () => {
    try {
      const data = await schoolConfigService.getSchoolConfig();
      if (data) {
        // On s'assure que schoolName n'est jamais undefined pour l'affichage
        setSchoolConfig({
          ...data,
          schoolName: data.schoolName || "Institution",
        });
      }
    } catch (error) {
      console.error("Erreur lors du chargement de la configuration scolaire:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchoolConfig();
  }, []);

  return (
    <SchoolContext.Provider value={{ schoolConfig, updateSchoolConfig: fetchSchoolConfig, loading }}>
      {children}
    </SchoolContext.Provider>
  );
};

export const useSchool = () => useContext(SchoolContext);