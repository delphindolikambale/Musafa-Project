import api from './api';

const V1_URL = "/v1";
const INSTALLMENT_URL = "/installments";

/**
 * Service de gestion financière pour l'administration.
 */
const financeAdminService = {
    
    // --- 1. GROUPES DE FRAIS ---
    createGroup: (data) => api.post(`${V1_URL}/fees-groups`, data),
    getGroupsByYear: (yearId) => api.get(`${V1_URL}/fees-groups/academic-year/${yearId}`),
    updateGroup: (id, data) => api.put(`${V1_URL}/fees-groups/${id}`, data),
    deleteGroup: (id) => api.delete(`${V1_URL}/fees-groups/${id}`),
    deactivateGroup: (id) => api.put(`${V1_URL}/fees-groups/${id}/deactivate`),

    // --- 2. ITEMS DE FRAIS ---
    createItem: (data) => api.post(`${V1_URL}/fees-items`, data),
    getItemsByGroup: (groupId) => api.get(`${V1_URL}/fees-items/group/${groupId}`),
    updateItem: (id, data) => api.put(`${V1_URL}/fees-items/${id}`, data),
    deleteItem: (id) => api.delete(`${V1_URL}/fees-items/${id}`),

    // --- 3. BARÈMES ---
    createSchedule: (data) => api.post(`${V1_URL}/schedule-fees`, data),
    getSchedulesByYear: (yearId) => api.get(`${V1_URL}/schedule-fees/academic-year/${yearId}`),
    updateSchedule: (id, data) => api.put(`${V1_URL}/schedule-fees/${id}`, data),
    deleteSchedule: (id) => api.delete(`${V1_URL}/schedule-fees/${id}`),
    deactivateSchedule: (id) => api.patch(`${V1_URL}/schedule-fees/${id}/deactivate`),

    // --- 4. TRANCHES (Installments) ---
    getInstallmentsBySchedule: (scheduleId) => api.get(`${INSTALLMENT_URL}/schedule-fees/${scheduleId}`),
    updateInstallment: (id, data) => api.put(`${INSTALLMENT_URL}/${id}`, data),

    // --- 5. ANNÉES ACADÉMIQUES ---
    getActiveAcademicYear: () => api.get(`/academic-years/active`),

    // --- 6. UTILITAIRES ---
    getSchoolInfo: () => ({
        name: "MUSIFA - COMPLEXE SCOLAIRE DE RÉFÉRENCE",
        address: "Direction Générale - Service de Comptabilité & Finances",
        academicYear: "2025-2026"
    })
};

export default financeAdminService;