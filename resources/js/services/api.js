import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('network_flow_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 && window.location.pathname !== '/login') {
            localStorage.removeItem('network_flow_token');
            window.location.assign('/login');
        }
        return Promise.reject(error);
    },
);

export const endpoints = {
    login: (payload) => api.post('/login', payload),
    logout: () => api.post('/logout'),
    user: () => api.get('/user'),
    customers: () => api.get('/customers'),
    customer: (id) => api.get(`/customers/${id}`),
    createCustomer: (payload) => api.post('/customers', payload),
    updateCustomer: (id, payload) => api.put(`/customers/${id}`, payload),
    deleteCustomer: (id) => api.delete(`/customers/${id}`),
    packages: () => api.get('/packages'),
    createPackage: (payload) => api.post('/packages', payload),
    updatePackage: (id, payload) => api.put(`/packages/${id}`, payload),
    billing: () => api.get('/billing'),
    createInvoice: (payload) => api.post('/billing', payload),
    complaints: () => api.get('/complaints'),
    updateComplaint: (id, payload) => api.put(`/complaints/${id}`, payload),
    reports: () => api.get('/reports'),
};

export default api;
