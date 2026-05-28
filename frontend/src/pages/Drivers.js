import React, { useState, useEffect } from 'react';
import { driverService, vehicleService } from '../services/api';
import toast from 'react-hot-toast';

const Drivers = () => {
    const [drivers, setDrivers] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [showAssignVehicle, setShowAssignVehicle] = useState(null);
    const [editingDriver, setEditingDriver] = useState(null);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('');

    const [formData, setFormData] = useState({
        userId: '',
        licenseNumber: '',
        licenseExpiry: '',
        address: '',
        experience: 0,
        status: 'active',
        emergencyContact: {
            name: '',
            phone: '',
            relationship: ''
        }
    });

    useEffect(() => {
        fetchData();
    }, [search, filterStatus]);

    const fetchData = async () => {
        try {
            const params = {};
            if (search) params.search = search;
            if (filterStatus) params.status = filterStatus;

            const [driversRes, vehiclesRes] = await Promise.all([
                driverService.getAll(params),
                vehicleService.getAll({ status: 'available' })
            ]);
            setDrivers(driversRes.data.drivers);
            setVehicles(vehiclesRes.data.vehicles);
        } catch (error) {
            toast.error('Failed to fetch drivers');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingDriver) {
                await driverService.update(editingDriver._id, formData);
                toast.success('Driver updated successfully');
            } else {
                await driverService.create(formData);
                toast.success('Driver registered successfully');
            }
            resetForm();
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Operation failed');
        }
    };

    const handleAssignVehicle = async (driverId, vehicleId) => {
        try {
            await driverService.assignVehicle(driverId, vehicleId);
            toast.success('Vehicle assigned successfully');
            setShowAssignVehicle(null);
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to assign vehicle');
        }
    };

    const handleEdit = (driver) => {
        setEditingDriver(driver);
        setFormData({
            userId: driver.userId?._id || '',
            licenseNumber: driver.licenseNumber,
            licenseExpiry: driver.licenseExpiry?.split('T')[0] || '',
            address: driver.address || '',
            experience: driver.experience || 0,
            status: driver.status,
            emergencyContact: {
                name: driver.emergencyContact?.name || '',
                phone: driver.emergencyContact?.phone || '',
                relationship: driver.emergencyContact?.relationship || ''
            }
        });
        setShowForm(true);
    };

    const resetForm = () => {
        setFormData({
            userId: '',
            licenseNumber: '',
            licenseExpiry: '',
            address: '',
            experience: 0,
            status: 'active',
            emergencyContact: {
                name: '',
                phone: '',
                relationship: ''
            }
        });
        setEditingDriver(null);
        setShowForm(false);
    };

    const getStatusBadge = (status) => {
        const badges = {
            active: 'bg-green-100 text-green-800',
            inactive: 'bg-gray-100 text-gray-800',
            suspended: 'bg-red-100 text-red-800'
        };
        return `px-2 py-1 rounded-full text-xs font-medium ${badges[status] || 'bg-gray-100'}`;
    };

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
    );

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Driver Management</h1>
                <button onClick={() => setShowForm(!showForm)} className="btn-primary">
                    {showForm ? 'Cancel' : 'Register Driver'}
                </button>
            </div>

            {/* Filters */}
            <div className="flex gap-4 mb-6">
                <input
                    type="text"
                    placeholder="Search drivers..."
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
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                </select>
            </div>

            {/* Registration Form */}
            {showForm && (
                <div className="card mb-6">
                    <h2 className="text-lg font-semibold mb-4">
                        {editingDriver ? 'Edit Driver' : 'Register New Driver'}
                    </h2>
                    <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">License Number *</label>
                            <input
                                type="text"
                                value={formData.licenseNumber}
                                onChange={(e) => setFormData({...formData, licenseNumber: e.target.value})}
                                className="input-field"
                                required
                                disabled={!!editingDriver}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">License Expiry *</label>
                            <input
                                type="date"
                                value={formData.licenseExpiry}
                                onChange={(e) => setFormData({...formData, licenseExpiry: e.target.value})}
                                className="input-field"
                                required
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-medium mb-1">Address</label>
                            <input
                                type="text"
                                value={formData.address}
                                onChange={(e) => setFormData({...formData, address: e.target.value})}
                                className="input-field"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Experience (years)</label>
                            <input
                                type="number"
                                value={formData.experience}
                                onChange={(e) => setFormData({...formData, experience: e.target.value})}
                                className="input-field"
                                min="0"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Status</label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({...formData, status: e.target.value})}
                                className="input-field"
                            >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                                <option value="suspended">Suspended</option>
                            </select>
                        </div>

                        <div className="col-span-2">
                            <h3 className="text-md font-semibold mb-2 mt-4">Emergency Contact</h3>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Contact Name</label>
                            <input
                                type="text"
                                value={formData.emergencyContact.name}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    emergencyContact: {...formData.emergencyContact, name: e.target.value}
                                })}
                                className="input-field"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Contact Phone</label>
                            <input
                                type="tel"
                                value={formData.emergencyContact.phone}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    emergencyContact: {...formData.emergencyContact, phone: e.target.value}
                                })}
                                className="input-field"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Relationship</label>
                            <input
                                type="text"
                                value={formData.emergencyContact.relationship}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    emergencyContact: {...formData.emergencyContact, relationship: e.target.value}
                                })}
                                className="input-field"
                            />
                        </div>

                        <div className="col-span-2 flex gap-4">
                            <button type="submit" className="btn-primary">
                                {editingDriver ? 'Update Driver' : 'Register Driver'}
                            </button>
                            <button type="button" onClick={resetForm} className="btn-secondary">
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Drivers Table */}
            <div className="card overflow-x-auto">
                <table className="min-w-full">
                    <thead>
                    <tr className="border-b">
                        <th className="text-left py-3 px-4">Driver</th>
                        <th className="text-left py-3 px-4">License Number</th>
                        <th className="text-left py-3 px-4">License Expiry</th>
                        <th className="text-left py-3 px-4">Experience</th>
                        <th className="text-left py-3 px-4">Assigned Vehicle</th>
                        <th className="text-left py-3 px-4">Status</th>
                        <th className="text-left py-3 px-4">Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {drivers.map((driver) => (
                        <tr key={driver._id} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4">
                                <div>
                                    <p className="font-medium">{driver.userId?.firstName} {driver.userId?.lastName}</p>
                                    <p className="text-sm text-gray-500">{driver.userId?.email}</p>
                                </div>
                            </td>
                            <td className="py-3 px-4 font-mono">{driver.licenseNumber}</td>
                            <td className="py-3 px-4">
                  <span className={new Date(driver.licenseExpiry) < new Date() ? 'text-red-600 font-semibold' : ''}>
                    {new Date(driver.licenseExpiry).toLocaleDateString()}
                  </span>
                            </td>
                            <td className="py-3 px-4">{driver.experience} years</td>
                            <td className="py-3 px-4">
                                {driver.assignedVehicle ? (
                                    <span className="text-sm">
                      {driver.assignedVehicle.registrationNumber}
                                        <br />
                      <span className="text-gray-500">
                        {driver.assignedVehicle.brand} {driver.assignedVehicle.model}
                      </span>
                    </span>
                                ) : (
                                    <span className="text-gray-400 text-sm">Not assigned</span>
                                )}
                            </td>
                            <td className="py-3 px-4">
                  <span className={getStatusBadge(driver.status)}>
                    {driver.status}
                  </span>
                            </td>
                            <td className="py-3 px-4">
                                <div className="flex gap-2 flex-wrap">
                                    <button
                                        onClick={() => handleEdit(driver)}
                                        className="text-blue-600 hover:underline text-sm"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => setShowAssignVehicle(driver._id)}
                                        className="text-green-600 hover:underline text-sm"
                                    >
                                        Assign Vehicle
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    {drivers.length === 0 && (
                        <tr>
                            <td colSpan="7" className="py-8 text-center text-gray-500">
                                No drivers found
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>

            {/* Assign Vehicle Modal */}
            {showAssignVehicle && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold mb-4">Assign Vehicle</h3>
                        <select
                            className="input-field mb-4"
                            onChange={(e) => {
                                if (e.target.value) {
                                    handleAssignVehicle(showAssignVehicle, e.target.value);
                                }
                            }}
                        >
                            <option value="">Select Vehicle</option>
                            {vehicles.map(vehicle => (
                                <option key={vehicle._id} value={vehicle._id}>
                                    {vehicle.registrationNumber} - {vehicle.brand} {vehicle.model}
                                </option>
                            ))}
                        </select>
                        <button
                            onClick={() => setShowAssignVehicle(null)}
                            className="btn-secondary w-full"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Drivers;