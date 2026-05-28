import React, { useState, useEffect } from 'react';
import { maintenanceService, vehicleService } from '../services/api';
import toast from 'react-hot-toast';

const Maintenance = () => {
    const [records, setRecords] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingRecord, setEditingRecord] = useState(null);
    const [filters, setFilters] = useState({
        status: '',
        vehicle: '',
        priority: ''
    });

    const [formData, setFormData] = useState({
        vehicle: '',
        maintenanceType: 'routine_service',
        description: '',
        scheduledDate: '',
        cost: 0,
        serviceProvider: '',
        status: 'scheduled',
        priority: 'medium',
        notes: '',
        nextServiceMileage: '',
        nextServiceDate: ''
    });

    useEffect(() => {
        fetchData();
    }, [filters]);

    const fetchData = async () => {
        try {
            const params = {};
            if (filters.status) params.status = filters.status;
            if (filters.vehicle) params.vehicle = filters.vehicle;
            if (filters.priority) params.priority = filters.priority;

            const [recordsRes, vehiclesRes] = await Promise.all([
                maintenanceService.getAll(params),
                vehicleService.getAll()
            ]);
            setRecords(recordsRes.data.records);
            setVehicles(vehiclesRes.data.vehicles);
        } catch (error) {
            toast.error('Failed to fetch maintenance records');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingRecord) {
                await maintenanceService.update(editingRecord._id, formData);
                toast.success('Maintenance record updated');
            } else {
                await maintenanceService.schedule(formData);
                toast.success('Maintenance scheduled');
            }
            resetForm();
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Operation failed');
        }
    };

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            const updateData = { status: newStatus };
            if (newStatus === 'completed') {
                updateData.completedDate = new Date();
            }
            await maintenanceService.update(id, updateData);
            toast.success('Status updated');
            fetchData();
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const handleEdit = (record) => {
        setEditingRecord(record);
        setFormData({
            vehicle: record.vehicle?._id || '',
            maintenanceType: record.maintenanceType,
            description: record.description,
            scheduledDate: record.scheduledDate?.split('T')[0] || '',
            cost: record.cost || 0,
            serviceProvider: record.serviceProvider || '',
            status: record.status,
            priority: record.priority,
            notes: record.notes || '',
            nextServiceMileage: record.nextServiceMileage || '',
            nextServiceDate: record.nextServiceDate?.split('T')[0] || ''
        });
        setShowForm(true);
    };

    const resetForm = () => {
        setFormData({
            vehicle: '',
            maintenanceType: 'routine_service',
            description: '',
            scheduledDate: '',
            cost: 0,
            serviceProvider: '',
            status: 'scheduled',
            priority: 'medium',
            notes: '',
            nextServiceMileage: '',
            nextServiceDate: ''
        });
        setEditingRecord(null);
        setShowForm(false);
    };

    const getStatusBadge = (status) => {
        const badges = {
            scheduled: 'bg-blue-100 text-blue-800',
            in_progress: 'bg-yellow-100 text-yellow-800',
            completed: 'bg-green-100 text-green-800',
            cancelled: 'bg-red-100 text-red-800'
        };
        return `px-2 py-1 rounded-full text-xs font-medium ${badges[status]}`;
    };

    const getPriorityBadge = (priority) => {
        const badges = {
            low: 'bg-gray-100 text-gray-800',
            medium: 'bg-yellow-100 text-yellow-800',
            high: 'bg-orange-100 text-orange-800',
            urgent: 'bg-red-100 text-red-800'
        };
        return `px-2 py-1 rounded-full text-xs font-medium ${badges[priority]}`;
    };

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
    );

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Maintenance Management</h1>
                <button onClick={() => setShowForm(!showForm)} className="btn-primary">
                    {showForm ? 'Cancel' : 'Schedule Maintenance'}
                </button>
            </div>

            {/* Filters */}
            <div className="flex gap-4 mb-6 flex-wrap">
                <select
                    value={filters.status}
                    onChange={(e) => setFilters({...filters, status: e.target.value})}
                    className="input-field max-w-xs"
                >
                    <option value="">All Status</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                </select>
                <select
                    value={filters.priority}
                    onChange={(e) => setFilters({...filters, priority: e.target.value})}
                    className="input-field max-w-xs"
                >
                    <option value="">All Priorities</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                </select>
                <select
                    value={filters.vehicle}
                    onChange={(e) => setFilters({...filters, vehicle: e.target.value})}
                    className="input-field max-w-xs"
                >
                    <option value="">All Vehicles</option>
                    {vehicles.map(v => (
                        <option key={v._id} value={v._id}>{v.registrationNumber}</option>
                    ))}
                </select>
            </div>

            {/* Schedule Form */}
            {showForm && (
                <div className="card mb-6">
                    <h2 className="text-lg font-semibold mb-4">
                        {editingRecord ? 'Edit Maintenance' : 'Schedule New Maintenance'}
                    </h2>
                    <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Vehicle *</label>
                            <select
                                value={formData.vehicle}
                                onChange={(e) => setFormData({...formData, vehicle: e.target.value})}
                                className="input-field"
                                required
                                disabled={!!editingRecord}
                            >
                                <option value="">Select Vehicle</option>
                                {vehicles.map(v => (
                                    <option key={v._id} value={v._id}>{v.registrationNumber} - {v.brand} {v.model}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Type *</label>
                            <select
                                value={formData.maintenanceType}
                                onChange={(e) => setFormData({...formData, maintenanceType: e.target.value})}
                                className="input-field"
                                required
                            >
                                <option value="routine_service">Routine Service</option>
                                <option value="repair">Repair</option>
                                <option value="inspection">Inspection</option>
                                <option value="tire_change">Tire Change</option>
                                <option value="oil_change">Oil Change</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-medium mb-1">Description *</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                                className="input-field"
                                required
                                rows="3"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Scheduled Date *</label>
                            <input
                                type="date"
                                value={formData.scheduledDate}
                                onChange={(e) => setFormData({...formData, scheduledDate: e.target.value})}
                                className="input-field"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Priority *</label>
                            <select
                                value={formData.priority}
                                onChange={(e) => setFormData({...formData, priority: e.target.value})}
                                className="input-field"
                                required
                            >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                                <option value="urgent">Urgent</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Estimated Cost (RWF)</label>
                            <input
                                type="number"
                                value={formData.cost}
                                onChange={(e) => setFormData({...formData, cost: e.target.value})}
                                className="input-field"
                                min="0"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Service Provider</label>
                            <input
                                type="text"
                                value={formData.serviceProvider}
                                onChange={(e) => setFormData({...formData, serviceProvider: e.target.value})}
                                className="input-field"
                                placeholder="Garage or service center name"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Next Service Mileage</label>
                            <input
                                type="number"
                                value={formData.nextServiceMileage}
                                onChange={(e) => setFormData({...formData, nextServiceMileage: e.target.value})}
                                className="input-field"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Next Service Date</label>
                            <input
                                type="date"
                                value={formData.nextServiceDate}
                                onChange={(e) => setFormData({...formData, nextServiceDate: e.target.value})}
                                className="input-field"
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-medium mb-1">Notes</label>
                            <textarea
                                value={formData.notes}
                                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                                className="input-field"
                                rows="2"
                            />
                        </div>
                        <div className="col-span-2 flex gap-4">
                            <button type="submit" className="btn-primary">
                                {editingRecord ? 'Update' : 'Schedule'}
                            </button>
                            <button type="button" onClick={resetForm} className="btn-secondary">
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Maintenance Records */}
            <div className="card overflow-x-auto">
                <table className="min-w-full">
                    <thead>
                    <tr className="border-b">
                        <th className="text-left py-3 px-4">Vehicle</th>
                        <th className="text-left py-3 px-4">Type</th>
                        <th className="text-left py-3 px-4">Description</th>
                        <th className="text-left py-3 px-4">Scheduled</th>
                        <th className="text-left py-3 px-4">Cost</th>
                        <th className="text-left py-3 px-4">Priority</th>
                        <th className="text-left py-3 px-4">Status</th>
                        <th className="text-left py-3 px-4">Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {records.map((record) => (
                        <tr key={record._id} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4">
                                <span className="font-medium">{record.vehicle?.registrationNumber}</span>
                                <br />
                                <span className="text-sm text-gray-500">{record.vehicle?.brand} {record.vehicle?.model}</span>
                            </td>
                            <td className="py-3 px-4 capitalize">{record.maintenanceType?.replace('_', ' ')}</td>
                            <td className="py-3 px-4 max-w-xs truncate">{record.description}</td>
                            <td className="py-3 px-4">{new Date(record.scheduledDate).toLocaleDateString()}</td>
                            <td className="py-3 px-4">RWF {record.cost?.toLocaleString()}</td>
                            <td className="py-3 px-4">
                                <span className={getPriorityBadge(record.priority)}>{record.priority}</span>
                            </td>
                            <td className="py-3 px-4">
                  <span className={getStatusBadge(record.status)}>
                    {record.status.replace('_', ' ')}
                  </span>
                            </td>
                            <td className="py-3 px-4">
                                <div className="flex gap-2 flex-wrap">
                                    {record.status === 'scheduled' && (
                                        <>
                                            <button
                                                onClick={() => handleStatusUpdate(record._id, 'in_progress')}
                                                className="text-yellow-600 hover:underline text-sm"
                                            >
                                                Start
                                            </button>
                                            <button
                                                onClick={() => handleStatusUpdate(record._id, 'cancelled')}
                                                className="text-red-600 hover:underline text-sm"
                                            >
                                                Cancel
                                            </button>
                                        </>
                                    )}
                                    {record.status === 'in_progress' && (
                                        <button
                                            onClick={() => handleStatusUpdate(record._id, 'completed')}
                                            className="text-green-600 hover:underline text-sm"
                                        >
                                            Complete
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleEdit(record)}
                                        className="text-blue-600 hover:underline text-sm"
                                    >
                                        Edit
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    {records.length === 0 && (
                        <tr>
                            <td colSpan="8" className="py-8 text-center text-gray-500">
                                No maintenance records found
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Maintenance;