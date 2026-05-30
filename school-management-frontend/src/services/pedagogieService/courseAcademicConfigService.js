import axios from "axios";
import { BACKEND_BASE } from '../api';

const API_URL = `${BACKEND_BASE}/api`;

const getHeader = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    return user && user.accessToken ? { Authorization: 'Bearer ' + user.accessToken } : {};
};

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
    // Correction de la route pour correspondre au SchoolConfigController (@RequestMapping("/api/v1/admin/school-config"))
    getInstitutionSettings: () => axios.get(`${API_URL}/v1/admin/school-config`, { headers: getHeader() }),

    // --- STRUCTURE PEDAGOGIQUE (Niveaux, Sections, Options) ---
    getAllLevels: () => axios.get(`${API_URL}/levels`, { headers: getHeader() }),
    getSectionsByLevel: (levelId) => axios.get(`${API_URL}/sections/level/${levelId}`, { headers: getHeader() }),
    getOptionsBySection: (sectionId) => axios.get(`${API_URL}/options/section/${sectionId}`, { headers: getHeader() }),

    // --- RÉFÉRENTIEL DES SPÉCIALITÉS (Compétences des enseignants) ---
    getAllSpecialities: () => axios.get(`${API_URL}/specialities`, { headers: getHeader() }),
    createSpeciality: (data) => axios.post(`${API_URL}/specialities`, data, { headers: getHeader() }),
    deleteSpeciality: (id) => axios.delete(`${API_URL}/specialities/${id}`, { headers: getHeader() }),

    // --- DOMAINES ---
    // Note : Le 'data' envoyé à create/update doit contenir 'requiredSpecialityId' pour le Backend
    getAllDomains: () => axios.get(`${API_URL}/academic/domains`, { headers: getHeader() }),
    getDomainsByClass: (levelId, sectionId, optionId, yearId) => {
        const params = buildClassParams(levelId, sectionId, optionId, yearId);
        return axios.get(`${API_URL}/academic/domains/filter?${params.toString()}`, { headers: getHeader() });
    },
    createDomain: (data) => axios.post(`${API_URL}/academic/domains`, data, { headers: getHeader() }),
    updateDomain: (id, data) => axios.put(`${API_URL}/academic/domains/${id}`, data, { headers: getHeader() }),
    deleteDomain: (id) => axios.delete(`${API_URL}/academic/domains/${id}`, { headers: getHeader() }),

    // --- SOUS-DOMAINES ---
    getAllSubDomains: () => axios.get(`${API_URL}/academic/sub-domains`, { headers: getHeader() }),
    getSubDomainsByClass: (levelId, sectionId, optionId, yearId) => {
        const params = buildClassParams(levelId, sectionId, optionId, yearId);
        return axios.get(`${API_URL}/academic/sub-domains/filter?${params.toString()}`, { headers: getHeader() });
    },
    createSubDomain: (data) => axios.post(`${API_URL}/academic/sub-domains`, data, { headers: getHeader() }),
    updateSubDomain: (id, data) => axios.put(`${API_URL}/academic/sub-domains/${id}`, data, { headers: getHeader() }),
    deleteSubDomain: (id) => axios.delete(`${API_URL}/academic/sub-domains/${id}`, { headers: getHeader() }),

    // --- MATIÈRES (SUBJECTS) ---
    getAllSubjects: () => axios.get(`${API_URL}/academic/subjects`, { headers: getHeader() }),
    getSubjectsByClass: (levelId, sectionId, optionId, yearId) => {
        const params = buildClassParams(levelId, sectionId, optionId, yearId);
        return axios.get(`${API_URL}/academic/subjects/filter?${params.toString()}`, { headers: getHeader() });
    },
    createSubject: (data) => axios.post(`${API_URL}/academic/subjects`, data, { headers: getHeader() }),
    updateSubject: (id, data) => axios.put(`${API_URL}/academic/subjects/${id}`, data, { headers: getHeader() }),
    deleteSubject: (id) => axios.delete(`${API_URL}/academic/subjects/${id}`, { headers: getHeader() }),

    // --- CONFIGURATION DES MAXIMA & AFFECTATIONS ---
    assignCourse: (data) => axios.post(`${API_URL}/config/courses/assign`, data, { headers: getHeader() }),
    updateCourseAssignment: (id, data) => axios.put(`${API_URL}/config/courses/${id}`, data, { headers: getHeader() }),
    deleteCourseAssignment: (id) => axios.delete(`${API_URL}/config/courses/${id}`, { headers: getHeader() }),
    getCourseConfigurationFilter: (levelId, sectionId, optionId, yearId) => {
        const params = buildClassParams(levelId, sectionId, optionId, yearId);
        return axios.get(`${API_URL}/config/courses/filter?${params.toString()}`, { headers: getHeader() });
    },

    /**
     * Clonage de la structure d'une année vers une autre
     */
    importPreviousYearConfig: (data) => axios.post(`${API_URL}/config/courses/import-previous-year`, data, { headers: getHeader() })
};

export default courseAcademicConfigService;