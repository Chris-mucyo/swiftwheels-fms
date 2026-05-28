import React, { useState, useEffect } from 'react';
import { tripService, vehicleService, driverService } from '../services/api';
import toast from 'react-hot-toast';

const Trips = () => {
    const [trips, setTrips] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        vehicle: '',
        driver: '',
        tripType: 'delivery',
        startLocation: '',
        destination: '',
        startDate: '',
        startMileage: '',
        status: 'scheduled',
        notes: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [tripsRes, vehiclesRes, driversRes] = await Promise.all([
                tripService.getAll(),
                vehicleService.getAll({ status: 'available' }),
                driverService.getAll({ status: 'active' })
            ]);
            setTrips(tripsRes.data.trips);
            setVehicles(vehiclesRes.data.vehicles);
            setDrivers(driversRes.data.drivers);
        } catch (error) {
            toast.error('Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await tripService.create(formData);
            toast.success('Trip created successfully');
            setShowForm(false);
            resetForm();
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create trip');
        }
    };

    const handleStatusUpdate = async (tripId, newStatus, endMileage) => {
        try {
            const updateData = { status: newStatus };
            if (newStatus === 'completed' && endMileage) {
                updateData.endMileage = endMileage;
                updateData.endDate = new Date();
            }
            await tripService.update(tripId, updateData);
            toast.success('Trip status updated');
            fetchData();
        } catch (error) {
            toast.error('Failed to update trip status');
        }
    };

    const resetForm = () => {
        setFormData({
            vehicle: '',
            driver: '',
            tripType: 'delivery',
            startLocation: '',
            destination: '',
            startDate: '',
            startMileage: '',
            status: 'scheduled',
            notes: ''
        });
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

    if (loading) return <div>Loading trips...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Trip Management</h1>
                <button onClick={() => setShowForm(!showForm)} className="btn-primary">
                    {showForm ? 'Cancel' : 'New Trip'}
                </button>
            </div>

            {showForm && (
                <div className="card mb-6">
                    <h2 className="text-lg font-semibold mb-4">Create New Trip</h2>
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
                                    <option key={v._id} value={v._id}>
                                        {v.registrationNumber} - {v.brand} {v.model}
                                    </option>
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
                                        {d.userId?.firstName} {d.userId?.lastName} - {d.licenseNumber}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Trip Type *</label>
                            <select
                                value={formData.tripType}
                                onChange={(e) => setFormData({...formData, tripType: e.target.value})}
                                className="input-field"
                                required
                            >
                                <option value="delivery">Delivery</option>
                                <option value="rental">Rental</option>
                                <option value="passenger_transport">Passenger Transport</option>
                                <option value="goods_transport">Goods Transport</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Start Date *</label>
                            <input
                                type="datetime-local"
                                value={formData.startDate}
                                onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                                className="input-field"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Start Location *</label>
                            <input
                                type="text"
                                value={formData.startLocation}
                                onChange={(e) => setFormData({...formData, startLocation: e.target.value})}
                                className="input-field"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Destination *</label>
                            <input
                                type="text"
                                value={formData.destination}
                                onChange={(e) => setFormData({...formData, destination: e.target.value})}
                                className="input-field"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Start Mileage *</label>
                            <input
                                type="number"
                                value={formData.startMileage}
                                onChange={(e) => setFormData({...formData, startMileage: e.target.value})}
                                className="input-field"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Notes</label>
                            <textarea
                                value={formData.notes}
                                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                                className="input-field"
                                rows="2"
                            />
                        </div>
                        <div className="col-span-2 flex gap-4">
                            <button type="submit" className="btn-primary">Create Trip</button>
                            <button type="button" onClick={() => { setShowForm(false); resetForm(); }} className="btn-secondary">
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="card overflow-x-auto">
                <table className="min-w-full">
                    <thead>
                    <tr className="border-b">
                        <th className="text-left py-3 px-4">Trip #</th>
                        <th className="text-left py-3 px-4">Vehicle</th>
                        <th className="text-left py-3 px-4">Driver</th>
                        <th className="text-left py-3 px-4">Route</th>
                        <th className="text-left py-3 px-4">Type</th>
                        <th className="text-left py-3 px-4">Start Date</th>
                        <th className="text-left py-3 px-4">Status</th>
                        <th className="text-left py-3 px-4">Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {trips.map((trip) => (
                        <tr key={trip._id} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4 font-medium">{trip.tripNumber}</td>
                            <td className="py-3 px-4">{trip.vehicle?.registrationNumber}</td>
                            <td className="py-3 px-4">
                                {trip.driver?.userId?.firstName} {trip.driver?.userId?.lastName}
                            </td>
                            <td className="py-3 px-4">
                                {trip.startLocation} → {trip.destination}
                            </td>
                            <td className="py-3 px-4 capitalize">{trip.tripType?.replace('_', ' ')}</td>
                            <td className="py-3 px-4">{new Date(trip.startDate).toLocaleDateString()}</td>
                            <td className="py-3 px-4">
                  <span className={getStatusBadge(trip.status)}>
                    {trip.status.replace('_', ' ')}
                  </span>
                            </td>
                            <td className="py-3 px-4">
                                {trip.status === 'scheduled' && (
                                    <button
                                        onClick={() => handleStatusUpdate(trip._id, 'in_progress')}
                                        className="text-yellow-600 hover:underline text-sm mr-2"
                                    >
                                        Start
                                    </button>
                                )}
                                {trip.status === 'in_progress' && (
                                    <button
                                        onClick={() => {
                                            const mileage = prompt('Enter end mileage:');
                                            if (mileage) handleStatusUpdate(trip._id, 'completed', Number(mileage));
                                        }}
                                        className="text-green-600 hover:underline text-sm mr-2"
                                    >
                                        Complete
                                    </button>
                                )}
                                {(trip.status === 'scheduled' || trip.status === 'in_progress') && (
                                    <button
                                        onClick={() => handleStatusUpdate(trip._id, 'cancelled')}
                                        className="text-red-600 hover:underline text-sm"
                                    >
                                        Cancel
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Trips;