import React, { useState, useEffect } from 'react';
import { fuelService, vehicleService, driverService } from '../services/api';
import toast from 'react-hot-toast';

const FuelRecords = () => {
    const [records, setRecords] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [summary, setSummary] = useState({});
    const [filters, setFilters] = useState({
        startDate: '',
        endDate: '',
        vehicle: ''
    });

    const [formData, setFormData] = useState({
        vehicle: '',
        driver: '',
        fuelDate: new Date().toISOString().split('T')[0],
        quantity: '',
        costPerLiter: '',
        mileageAtRefuel: '',
        fuelType: 'diesel',
        station: '',
        receiptNumber: ''
    });

    useEffect(() => {
        fetchData();
    }, [filters]);

    const fetchData = async () => {
        try {
            const params = {};
            if (filters.vehicle) params.vehicle = filters.vehicle;
            if (filters.startDate) params.startDate = filters.startDate;
            if (filters.endDate) params.endDate = filters.endDate;

            const [recordsRes, vehiclesRes, driversRes] = await Promise.all([
                fuelService.getAll(params),
                vehicleService.getAll(),
                driverService.getAll({ status: 'active' })
            ]);
            setRecords(recordsRes.data.fuelRecords);
            setSummary(recordsRes.data.summary);
            setVehicles(vehiclesRes.data.vehicles);
            setDrivers(driversRes.data.drivers);
        } catch (error) {
            toast.error('Failed to fetch fuel records');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await fuelService.record(formData);
            toast.success('Fuel record added successfully');
            setShowForm(false);
            resetForm();
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to record fuel');
        }
    };

    const resetForm = () => {
        setFormData({
            vehicle: '',
            driver: '',
            fuelDate: new Date().toISOString().split('T')[0],
            quantity: '',
            costPerLiter: '',
            mileageAtRefuel: '',
            fuelType: 'diesel',
            station: '',
            receiptNumber: ''
        });
    };

    const totalCost = formData.quantity && formData.costPerLiter
        ? (formData.quantity * formData.costPerLiter).toFixed(2)
        : 0;

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
    );

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Fuel Management</h1>
                <button onClick={() => setShowForm(!showForm)} className="btn-primary">
                    {showForm ? 'Cancel' : 'Record Fuel'}
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="stat-card border-blue-500">
                    <p className="text-sm text-gray-600">Total Fuel Consumed</p>
                    <p className="text-3xl font-bold">{summary.totalQuantity || 0} L</p>
                </div>
                <div className="stat-card border-green-500">
                    <p className="text-sm text-gray-600">Total Cost</p>
                    <p className="text-3xl font-bold">RWF {summary.totalCost?.toLocaleString() || 0}</p>
                </div>
                <div className="stat-card border-yellow-500">
                    <p className="text-sm text-gray-600">Avg. Cost/Liter</p>
                    <p className="text-3xl font-bold">RWF {summary.averageCostPerLiter || 0}</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-4 mb-6 flex-wrap">
                <input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => setFilters({...filters, startDate: e.target.value})}
                    className="input-field max-w-xs"
                    placeholder="Start Date"
                />
                <input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => setFilters({...filters, endDate: e.target.value})}
                    className="input-field max-w-xs"
                    placeholder="End Date"
                />
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

            {/* Record Form */}
            {showForm && (
                <div className="card mb-6">
                    <h2 className="text-lg font-semibold mb-4">Record Fuel Usage</h2>
                    <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Vehicle *</label>
                            <select
                                value={formData.vehicle}
                                onChange={(e) => setFormData({...formData, vehicle: e.target.value})}
                                className="input-field"
                                required
                            >
                                <option value="">Select Vehicle</option>
                                {vehicles.map(v => (
                                    <option key={v._id} value={v._id}>{v.registrationNumber} - {v.brand}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Driver *</label>
                            <select
                                value={formData.driver}
                                onChange={(e) => setFormData({...formData, driver: e.target.value})}
                                className="input-field"
                                required
                            >
                                <option value="">Select Driver</option>
                                {drivers.map(d => (
                                    <option key={d._id} value={d._id}>
                                        {d.userId?.firstName} {d.userId?.lastName}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Date *</label>
                            <input
                                type="date"
                                value={formData.fuelDate}
                                onChange={(e) => setFormData({...formData, fuelDate: e.target.value})}
                                className="input-field"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Fuel Type *</label>
                            <select
                                value={formData.fuelType}
                                onChange={(e) => setFormData({...formData, fuelType: e.target.value})}
                                className="input-field"
                                required
                            >
                                <option value="diesel">Diesel</option>
                                <option value="petrol">Petrol</option>
                                <option value="cng">CNG</option>
                                <option value="electric">Electric</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Quantity (Liters) *</label>
                            <input
                                type="number"
                                value={formData.quantity}
                                onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                                className="input-field"
                                required
                                step="0.01"
                                min="0"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Cost per Liter (RWF) *</label>
                            <input
                                type="number"
                                value={formData.costPerLiter}
                                onChange={(e) => setFormData({...formData, costPerLiter: e.target.value})}
                                className="input-field"
                                required
                                step="0.01"
                                min="0"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Mileage at Refuel *</label>
                            <input
                                type="number"
                                value={formData.mileageAtRefuel}
                                onChange={(e) => setFormData({...formData, mileageAtRefuel: e.target.value})}
                                className="input-field"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Station</label>
                            <input
                                type="text"
                                value={formData.station}
                                onChange={(e) => setFormData({...formData, station: e.target.value})}
                                className="input-field"
                                placeholder="Fuel station name"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Receipt Number</label>
                            <input
                                type="text"
                                value={formData.receiptNumber}
                                onChange={(e) => setFormData({...formData, receiptNumber: e.target.value})}
                                className="input-field"
                            />
                        </div>
                        <div className="col-span-2">
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-600">Total Cost:</p>
                                <p className="text-2xl font-bold text-primary-600">RWF {totalCost}</p>
                            </div>
                        </div>
                        <div className="col-span-2 flex gap-4">
                            <button type="submit" className="btn-primary">Record Fuel</button>
                            <button type="button" onClick={() => { setShowForm(false); resetForm(); }} className="btn-secondary">
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Records Table */}
            <div className="card overflow-x-auto">
                <table className="min-w-full">
                    <thead>
                    <tr className="border-b">
                        <th className="text-left py-3 px-4">Date</th>
                        <th className="text-left py-3 px-4">Vehicle</th>
                        <th className="text-left py-3 px-4">Driver</th>
                        <th className="text-left py-3 px-4">Quantity</th>
                        <th className="text-left py-3 px-4">Cost/Liter</th>
                        <th className="text-left py-3 px-4">Total Cost</th>
                        <th className="text-left py-3 px-4">Mileage</th>
                        <th className="text-left py-3 px-4">Station</th>
                    </tr>
                    </thead>
                    <tbody>
                    {records.map((record) => (
                        <tr key={record._id} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4">{new Date(record.fuelDate).toLocaleDateString()}</td>
                            <td className="py-3 px-4 font-medium">{record.vehicle?.registrationNumber}</td>
                            <td className="py-3 px-4">
                                {record.driver?.userId?.firstName} {record.driver?.userId?.lastName}
                            </td>
                            <td className="py-3 px-4">{record.quantity} L</td>
                            <td className="py-3 px-4">RWF {record.costPerLiter}</td>
                            <td className="py-3 px-4 font-semibold">RWF {record.totalCost?.toLocaleString()}</td>
                            <td className="py-3 px-4">{record.mileageAtRefuel?.toLocaleString()} km</td>
                            <td className="py-3 px-4">{record.station || '-'}</td>
                        </tr>
                    ))}
                    {records.length === 0 && (
                        <tr>
                            <td colSpan="8" className="py-8 text-center text-gray-500">
                                No fuel records found
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default FuelRecords;