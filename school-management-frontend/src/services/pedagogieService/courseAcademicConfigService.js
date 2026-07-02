import api from "../api"; // ✅ Ajustement du chemin pour cibler src/services/api.js

/**
 * Garantit que les paramètres sont propres (évite les chaînes "null" ou "undefined")
 */
const buildClassParams = (levelId, sectionId, optionId, yearId) => {
    const params = new URLSearchParams();
    if (levelId) params.append('levelId', levelId);
    if (yearId) params.append('yearId', yearId);
    
    if (sectionId && sectionId !== "null" && sectionId !== "undefined" && sectionId !== "") {
        params.append('sectionId', sectionId);
    }
    if (optionId && optionId !== "null" && optionId !== "undefined" && optionId !== "") {
        params.append('optionId', optionId);
    }
    return params;
};

const courseAcademicConfigService = {
    // --- INFORMATIONS INSTITUTION ---
    getInstitutionSettings: () => api.get("/v1/admin/school-config"),

    // --- STRUCTURE PEDAGOGIQUE (Niveaux, Sections, Options) ---
    getAllLevels: () => api.get("/levels"),
    getSectionsByLevel: (levelId) => api.get(`/sections/level/${levelId}`),
    getOptionsBySection: (sectionId) => api.get(`/options/section/${sectionId}`),
    getAllOptions: () => api.get("/options"),

    // --- RÉFÉRENTIEL DES SPÉCIALITÉS (Compétences des enseignants) ---
    getAllSpecialities: () => api.get("/specialities"),
    createSpeciality: (data) => api.post("/specialities", data),
    deleteSpeciality: (id) => api.delete(`/specialities/${id}`),

    // --- DOMAINES ---
    getAllDomains: () => api.get("/academic/domains"),
    getDomainsByClass: (levelId, sectionId, optionId, yearId) => {
        const params = buildClassParams(levelId, sectionId, optionId, yearId);
        return api.get(`/academic/domains/filter?${params.toString()}`);
    },
    createDomain: (data) => api.post("/academic/domains", data),
    updateDomain: (id, data) => api.put(`/academic/domains/${id}`, data),
    deleteDomain: (id) => api.delete(`/academic/domains/${id}`),

    // --- SOUS-DOMAINES ---
    getAllSubDomains: () => api.get("/academic/sub-domains"),
    getSubDomainsByClass: (levelId, sectionId, optionId, yearId) => {
        const params = buildClassParams(levelId, sectionId, optionId, yearId);
        return api.get(`/academic/sub-domains/filter?${params.toString()}`);
    },
    createSubDomain: (data) => api.post("/academic/sub-domains", data),
    updateSubDomain: (id, data) => api.put(`/academic/sub-domains/${id}`, data),
    deleteSubDomain: (id) => api.delete(`/academic/sub-domains/${id}`),

    // --- MATIÈRES (SUBJECTS) ---
    getAllSubjects: () => api.get("/academic/subjects"),
    getSubjectsByClass: (levelId, sectionId, optionId, yearId) => {
        const params = buildClassParams(levelId, sectionId, optionId, yearId);
        return api.get(`/academic/subjects/filter?${params.toString()}`);
    },
    createSubject: (data) => api.post("/academic/subjects", data),
    updateSubject: (id, data) => api.put(`/academic/subjects/${id}`, data),
    deleteSubject: (id) => api.delete(`/academic/subjects/${id}`),

    // Sauvegarde matricielle en masse
    saveBulkGrid: (data) => api.post("/academic/subjects/bulk-grid", data),

    // --- CONFIGURATION DES MAXIMA & AFFECTATIONS ---
    assignCourse: (data) => api.post("/config/courses/assign", data),
    updateCourseAssignment: (id, data) => api.put(`/config/courses/${id}`, data),
    deleteCourseAssignment: (id) => api.delete(`/config/courses/${id}`),
    getCourseConfigurationFilter: (levelId, sectionId, optionId, yearId) => {
        const params = buildClassParams(levelId, sectionId, optionId, yearId);
        return api.get(`/config/courses/filter?${params.toString()}`);
    },

    importPreviousYearConfig: (data) => api.post("/config/courses/import-previous-year", data)
};

export default courseAcademicConfigService;