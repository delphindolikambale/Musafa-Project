import axios from 'axios';

const API_URL = "http://localhost:8080/api/v1";
const BASE_URL_NO_V1 = "http://localhost:8080/api"; // Pour les modules sans versioning
const INSTALLMENT_API_URL = "http://localhost:8080/api/installments";

/**
 * Service de gestion financière pour l'administration.
 */
const financeAdminService = {
    
    // --- 1. GROUPES DE FRAIS ---
    createGroup: (data) => axios.post(`${API_URL}/fees-groups`, data),
    getGroupsByYear: (yearId) => axios.get(`${API_URL}/fees-groups/academic-year/${yearId}`),
    updateGroup: (id, data) => axios.put(`${API_URL}/fees-groups/${id}`, data),
    deleteGroup: (id) => axios.delete(`${API_URL}/fees-groups/${id}`),
    deactivateGroup: (id) => axios.put(`${API_URL}/fees-groups/${id}/deactivate`),

    // --- 2. ITEMS DE FRAIS ---
    createItem: (data) => axios.post(`${API_URL}/fees-items`, data),
    getItemsByGroup: (groupId) => axios.get(`${API_URL}/fees-items/group/${groupId}`),
    updateItem: (id, data) => axios.put(`${API_URL}/fees-items/${id}`, data),
    deleteItem: (id) => axios.delete(`${API_URL}/fees-items/${id}`),

    // --- 3. BARÈMES ---
    createSchedule: (data) => axios.post(`${API_URL}/schedule-fees`, data),
    getSchedulesByYear: (yearId) => axios.get(`${API_URL}/schedule-fees/academic-year/${yearId}`),
    updateSchedule: (id, data) => axios.put(`${API_URL}/schedule-fees/${id}`, data),
    deleteSchedule: (id) => axios.delete(`${API_URL}/schedule-fees/${id}`),
    deactivateSchedule: (id) => axios.patch(`${API_URL}/schedule-fees/${id}/deactivate`),

    // --- 4. TRANCHES (Installments) ---
    getInstallmentsBySchedule: (scheduleId) => axios.get(`${INSTALLMENT_API_URL}/schedule-fees/${scheduleId}`),
    updateInstallment: (id, data) => axios.put(`${INSTALLMENT_API_URL}/${id}`, data),

    // --- 5. ANNÉES ACADÉMIQUES ---
    getActiveAcademicYear: () => axios.get(`${BASE_URL_NO_V1}/academic-years/active`),

    // --- 6. UTILITAIRES ---
    getSchoolInfo: () => ({
        name: "MUSIFA - COMPLEXE SCOLAIRE DE RÉFÉRENCE",
        address: "Direction Générale - Service de Comptabilité & Finances",
        academicYear: "2025-2026"
    })
};

export default financeAdminService;