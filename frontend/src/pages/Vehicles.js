import React, { useState, useEffect } from 'react';
import { vehicleService } from '../services/api';
import toast from 'react-hot-toast';

const Vehicles = () => {
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingVehicle, setEditingVehicle] = useState(null);
    const [formData, setFormData] = useState({
        registrationNumber: '',
        type: 'car',
        brand: '',
        model: '',
        year: '',
        color: '',
        fuelType: 'diesel',
        capacity: '',
        status: 'available',
        currentMileage: 0
    });
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('');

    useEffect(() => {
        fetchVehicles();
    }, [search, filterStatus]);

    const fetchVehicles = async () => {
        try {
            const params = {};
            if (search) params.search = search;
            if (filterStatus) params.status = filterStatus;

            const response = await vehicleService.getAll(params);
            setVehicles(response.data.vehicles);
        } catch (error) {
            toast.error('Failed to fetch vehicles');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingVehicle) {
                await vehicleService.update(editingVehicle._id, formData);
                toast.success('Vehicle updated successfully');
            } else {
                await vehicleService.create(formData);
                toast.success('Vehicle added successfully');
            }
            resetForm();
            fetchVehicles();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Operation failed');
        }
    };

    const handleEdit = (vehicle) => {
        setEditingVehicle(vehicle);
        setFormData({
            registrationNumber: vehicle.registrationNumber,
            type: vehicle.type,
            brand: vehicle.brand,
            model: vehicle.model,
            year: vehicle.year,
            color: vehicle.color || '',
            fuelType: vehicle.fuelType,
            capacity: vehicle.capacity || '',
            status: vehicle.status,
            currentMileage: vehicle.currentMileage
        });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this vehicle?')) {
            try {
                await vehicleService.delete(id);
                toast.success('Vehicle deleted successfully');
                fetchVehicles();
            } catch (error) {
                toast.error('Failed to delete vehicle');
            }
        }
    };

    const resetForm = () => {
        setFormData({
            registrationNumber: '',
            type: 'car',
            brand: '',
            model: '',
            year: '',
            color: '',
            fuelType: 'diesel',
            capacity: '',
            status: 'available',
            currentMileage: 0
        });
        setEditingVehicle(null);
        setShowForm(false);
    };

    const getStatusBadge = (status) => {
        const badges = {
            available: 'bg-green-100 text-green-800',
            assigned: 'bg-blue-100 text-blue-800',
            maintenance: 'bg-yellow-100 text-yellow-800',
            retired: 'bg-red-100 text-red-800'
        };
        return `px-2 py-1 rounded-full text-xs font-medium ${badges[status] || 'bg-gray-100'}`;
    };

    if (loading) return <div>Loading vehicles...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Vehicle Management</h1>
                <button onClick={() => setShowForm(!showForm)} className="btn-primary">
                    {showForm ? 'Cancel' : 'Add Vehicle'}
                </button>
            </div>

            {/* Filters */}
            <div className="flex gap-4 mb-6">
                <input
                    type="text"
                    placeholder="Search vehicles..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="input-field max-w-xs"
                />
                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="input-field max-w-xs"
                >
                    <option value="">All Status</option>
                    <option value="available">Available</option>
                    <option value="assigned">Assigned</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="retired">Retired</option>
                </select>
            </div>

            {/* Add/Edit Form */}
            {showForm && (
                <div className="card mb-6">
                    <h2 className="text-lg font-semibold mb-4">
                        {editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
                    </h2>
                    <form onSubmit={handleSubmit} className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Registration Number *</label>
                            <input
                                type="text"
                                value={formData.registrationNumber}
                                onChange={(e) => setFormData({...formData, registrationNumber: e.target.value})}
                                className="input-field"
                                required
                                disabled={!!editingVehicle}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Type *</label>
                            <select
                                value={formData.type}
                                onChange={(e) => setFormData({...formData, type: e.target.value})}
                                className="input-field"
                                required
                            >
                                <option value="car">Car</option>
                                <option value="van">Van</option>
                                <option value="truck">Truck</option>
                                <option value="bus">Bus</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Brand *</label>
                            <input
                                type="text"
                                value={formData.brand}
                                onChange={(e) => setFormData({...formData, brand: e.target.value})}
                                className="input-field"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Model *</label>
                            <input
                                type="text"
                                value={formData.model}
                                onChange={(e) => setFormData({...formData, model: e.target.value})}
                                className="input-field"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Year *</label>
                            <input
                                type="number"
                                value={formData.year}
                                onChange={(e) => setFormData({...formData, year: e.target.value})}
                                className="input-field"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Color</label>
                            <input
                                type="text"
                                value={formData.color}
                                onChange={(e) => setFormData({...formData, color: e.target.value})}
                                className="input-field"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Fuel Type</label>
                            <select
                                value={formData.fuelType}
                                onChange={(e) => setFormData({...formData, fuelType: e.target.value})}
                                className="input-field"
                            >
                                <option value="diesel">Diesel</option>
                                <option value="petrol">Petrol</option>
                                <option value="electric">Electric</option>
                                <option value="hybrid">Hybrid</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Mileage</label>
                            <input
                                type="number"
                                value={formData.currentMileage}
                                onChange={(e) => setFormData({...formData, currentMileage: e.target.value})}
                                className="input-field"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Status</label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({...formData, status: e.target.value})}
                                className="input-field"
                            >
                                <option value="available">Available</option>
                                <option value="assigned">Assigned</option>
                                <option value="maintenance">Maintenance</option>
                                <option value="retired">Retired</option>
                            </select>
                        </div>
                        <div className="col-span-2 md:col-span-3 flex gap-4">
                            <button type="submit" className="btn-primary">
                                {editingVehicle ? 'Update Vehicle' : 'Add Vehicle'}
                            </button>
                            <button type="button" onClick={resetForm} className="btn-secondary">
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Vehicles Table */}
            <div className="card overflow-x-auto">
                <table className="min-w-full">
                    <thead>
                    <tr className="border-b">
                        <th className="text-left py-3 px-4">Reg. Number</th>
                        <th className="text-left py-3 px-4">Type</th>
                        <th className="text-left py-3 px-4">Brand/Model</th>
                        <th className="text-left py-3 px-4">Year</th>
                        <th className="text-left py-3 px-4">Fuel</th>
                        <th className="text-left py-3 px-4">Mileage</th>
                        <th className="text-left py-3 px-4">Status</th>
                        <th className="text-left py-3 px-4">Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {vehicles.map((vehicle) => (
                        <tr key={vehicle._id} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4 font-medium">{vehicle.registrationNumber}</td>
                            <td className="py-3 px-4 capitalize">{vehicle.type}</td>
                            <td className="py-3 px-4">{vehicle.brand} {vehicle.model}</td>
                            <td className="py-3 px-4">{vehicle.year}</td>
                            <td className="py-3 px-4 capitalize">{vehicle.fuelType}</td>
                            <td className="py-3 px-4">{vehicle.currentMileage?.toLocaleString()} km</td>
                            <td className="py-3 px-4">
                  <span className={getStatusBadge(vehicle.status)}>
                    {vehicle.status.replace('_', ' ')}
                  </span>
                            </td>
                            <td className="py-3 px-4">
                                <div className="flex gap-2">
                                    <button onClick={() => handleEdit(vehicle)} className="text-blue-600 hover:underline text-sm">
                                        Edit
                                    </button>
                                    <button onClick={() => handleDelete(vehicle._id)} className="text-red-600 hover:underline text-sm">
                                        Delete
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    {vehicles.length === 0 && (
                        <tr>
                            <td colSpan="8" className="py-8 text-center text-gray-500">
                                No vehicles found
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Vehicles;