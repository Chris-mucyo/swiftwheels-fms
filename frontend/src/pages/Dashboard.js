import React, { useState, useEffect } from 'react';
import { vehicleService, driverService, tripService, maintenanceService } from '../services/api';
import toast from 'react-hot-toast';

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalVehicles: 0,
        activeDrivers: 0,
        activeTrips: 0,
        pendingMaintenance: 0,
        availableVehicles: 0,
        completedTrips: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [vehicles, drivers, trips, maintenance] = await Promise.all([
                vehicleService.getAll(),
                driverService.getAll({ status: 'active' }),
                tripService.getAll(),
                maintenanceService.getAll({ status: 'scheduled' })
            ]);

            const allVehicles = vehicles.data.vehicles;
            const allTrips = trips.data.trips;

            setStats({
                totalVehicles: allVehicles.length,
                activeDrivers: drivers.data.count,
                activeTrips: allTrips.filter(t => t.status === 'in_progress').length,
                pendingMaintenance: maintenance.data.count,
                availableVehicles: allVehicles.filter(v => v.status === 'available').length,
                completedTrips: allTrips.filter(t => t.status === 'completed').length
            });
        } catch (error) {
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div>Loading dashboard...</div>;

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Dashboard Overview</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <div className="stat-card border-blue-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Total Vehicles</p>
                            <p className="text-3xl font-bold">{stats.totalVehicles}</p>
                        </div>
                        <span className="text-4xl">🚛</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">{stats.availableVehicles} available</p>
                </div>

                <div className="stat-card border-green-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Active Drivers</p>
                            <p className="text-3xl font-bold">{stats.activeDrivers}</p>
                        </div>
                        <span className="text-4xl">👨‍✈️</span>
                    </div>
                </div>

                <div className="stat-card border-yellow-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Active Trips</p>
                            <p className="text-3xl font-bold">{stats.activeTrips}</p>
                        </div>
                        <span className="text-4xl">🗺️</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">{stats.completedTrips} completed</p>
                </div>

                <div className="stat-card border-red-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Pending Maintenance</p>
                            <p className="text-3xl font-bold">{stats.pendingMaintenance}</p>
                        </div>
                        <span className="text-4xl">🔧</span>
                    </div>
                </div>
            </div>

            <div className="card">
                <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <a href="/vehicles" className="p-4 bg-blue-50 rounded-lg text-center hover:bg-blue-100 transition-colors">
                        <span className="text-2xl">🚛</span>
                        <p className="text-sm font-medium mt-1">Add Vehicle</p>
                    </a>
                    <a href="/drivers" className="p-4 bg-green-50 rounded-lg text-center hover:bg-green-100 transition-colors">
                        <span className="text-2xl">👨‍✈️</span>
                        <p className="text-sm font-medium mt-1">Register Driver</p>
                    </a>
                    <a href="/trips" className="p-4 bg-yellow-50 rounded-lg text-center hover:bg-yellow-100 transition-colors">
                        <span className="text-2xl">🗺️</span>
                        <p className="text-sm font-medium mt-1">Start Trip</p>
                    </a>
                    <a href="/maintenance" className="p-4 bg-red-50 rounded-lg text-center hover:bg-red-100 transition-colors">
                        <span className="text-2xl">🔧</span>
                        <p className="text-sm font-medium mt-1">Schedule Service</p>
                    </a>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;