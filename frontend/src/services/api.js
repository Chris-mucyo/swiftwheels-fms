import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add token to requests
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Handle response errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth Services
export const authService = {
    login: (data) => api.post('/auth/login', data),
    register: (data) => api.post('/auth/register', data),
    getMe: () => api.get('/auth/me'),
    getUsers: () => api.get('/auth/users'),
    updateUser: (id, data) => api.put(`/auth/users/${id}`, data)
};

// Vehicle Services
export const vehicleService = {
    getAll: (params) => api.get('/vehicles', { params }),
    getOne: (id) => api.get(`/vehicles/${id}`),
    create: (data) => api.post('/vehicles', data),
    update: (id, data) => api.put(`/vehicles/${id}`, data),
    delete: (id) => api.delete(`/vehicles/${id}`)
};

// Driver Services
export const driverService = {
    getAll: (params) => api.get('/drivers', { params }),
    getOne: (id) => api.get(`/drivers/${id}`),
    create: (data) => api.post('/drivers', data),
    update: (id, data) => api.put(`/drivers/${id}`, data),
    assignVehicle: (id, vehicleId) => api.put(`/drivers/${id}/assign-vehicle`, { vehicleId })
};

// Trip Services
export const tripService = {
    getAll: (params) => api.get('/trips', { params }),
    create: (data) => api.post('/trips', data),
    update: (id, data) => api.put(`/trips/${id}`, data)
};

// Fuel Services
export const fuelService = {
    getAll: (params) => api.get('/fuel', { params }),
    record: (data) => api.post('/fuel', data),
    getReport: (params) => api.get('/fuel/report', { params })
};

// Maintenance Services
export const maintenanceService = {
    getAll: (params) => api.get('/maintenance', { params }),
    schedule: (data) => api.post('/maintenance', data),
    update: (id, data) => api.put(`/maintenance/${id}`, data)
};

export default api;