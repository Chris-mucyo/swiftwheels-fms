import React, { useState, useEffect } from 'react';
import { vehicleService } from '../services/api';
import api from '../services/api';
import toast from 'react-hot-toast';

const Reports = () => {
    const [activeTab, setActiveTab] = useState('vehicle-usage');
    const [loading, setLoading] = useState(false);
    const [reportData, setReportData] = useState(null);
    const [vehicles, setVehicles] = useState([]);
    const [dateRange, setDateRange] = useState({
        startDate: '',
        endDate: ''
    });
    const [vehicleFilter, setVehicleFilter] = useState('');

    useEffect(() => {
        fetchVehicles();
    }, []);

    useEffect(() => {
        if (activeTab) {
            fetchReport();
        }
    }, [activeTab, dateRange, vehicleFilter]);

    const fetchVehicles = async () => {
        try {
            const res = await vehicleService.getAll();
            setVehicles(res.data.vehicles);
        } catch (error) {
            console.error('Failed to fetch vehicles');
        }
    };

    const fetchReport = async () => {
        setLoading(true);
        try {
            const params = {};
            if (dateRange.startDate) params.startDate = dateRange.startDate;
            if (dateRange.endDate) params.endDate = dateRange.endDate;
            if (vehicleFilter) params.vehicleId = vehicleFilter;

            let endpoint = '';
            switch (activeTab) {
                case 'vehicle-usage':
                    endpoint = '/reports/vehicle-usage';
                    break;
                case 'driver-activity':
                    endpoint = '/reports/driver-activity';
                    break;
                case 'fuel-consumption':
                    endpoint = '/reports/fuel-consumption';
                    break;
                case 'maintenance':
                    endpoint = '/reports/maintenance';
                    break;
                case 'expenses':
                    endpoint = '/reports/expenses';
                    break;
                default:
                    endpoint = '/reports/vehicle-usage';
            }

            const response = await api.get(endpoint, { params });
            setReportData(response.data);
        } catch (error) {
            toast.error('Failed to fetch report');
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const handleExportCSV = () => {
        toast.success('Export functionality coming soon');
    };

    const tabs = [
        { id: 'vehicle-usage', label: 'Vehicle Usage', icon: '🚛' },
        { id: 'driver-activity', label: 'Driver Activity', icon: '👨‍✈️' },
        { id: 'fuel-consumption', label: 'Fuel Consumption', icon: '⛽' },
        { id: 'maintenance', label: 'Maintenance', icon: '🔧' },
        { id: 'expenses', label: 'Expenses', icon: '💰' }
    ];

    const renderVehicleUsageReport = () => (
        <div>
            <h2 className="text-xl font-semibold mb-4">Vehicle Usage Report</h2>
            <div className="overflow-x-auto">
                <table className="min-w-full">
                    <thead>
                    <tr className="border-b">
                        <th className="text-left py-3 px-4">Vehicle</th>
                        <th className="text-left py-3 px-4">Type</th>
                        <th className="text-left py-3 px-4">Total Trips</th>
                        <th className="text-left py-3 px-4">Total Distance</th>
                        <th className="text-left py-3 px-4">Avg Distance/Trip</th>
                        <th className="text-left py-3 px-4">Total Expenses</th>
                    </tr>
                    </thead>
                    <tbody>
                    {reportData?.report?.map((item) => (
                        <tr key={item._id} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4 font-medium">
                                {item.registrationNumber}
                                <br />
                                <span className="text-sm text-gray-500">{item.brand} {item.model}</span>
                            </td>
                            <td className="py-3 px-4 capitalize">{item.vehicleType}</td>
                            <td className="py-3 px-4">{item.totalTrips}</td>
                            <td className="py-3 px-4">{item.totalDistance?.toLocaleString()} km</td>
                            <td className="py-3 px-4">{item.averageDistance?.toLocaleString()} km</td>
                            <td className="py-3 px-4">RWF {item.totalExpenses?.toLocaleString()}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderDriverActivityReport = () => (
        <div>
            <h2 className="text-xl font-semibold mb-4">Driver Activity Report</h2>
            <div className="overflow-x-auto">
                <table className="min-w-full">
                    <thead>
                    <tr className="border-b">
                        <th className="text-left py-3 px-4">Driver</th>
                        <th className="text-left py-3 px-4">License</th>
                        <th className="text-left py-3 px-4">Total Trips</th>
                        <th className="text-left py-3 px-4">Completed</th>
                        <th className="text-left py-3 px-4">Completion Rate</th>
                        <th className="text-left py-3 px-4">Total Distance</th>
                        <th className="text-left py-3 px-4">Expenses</th>
                    </tr>
                    </thead>
                    <tbody>
                    {reportData?.report?.map((item) => (
                        <tr key={item._id} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4 font-medium">{item.driverName}</td>
                            <td className="py-3 px-4">{item.licenseNumber}</td>
                            <td className="py-3 px-4">{item.totalTrips}</td>
                            <td className="py-3 px-4">{item.completedTrips}</td>
                            <td className="py-3 px-4">
                                <div className="flex items-center">
                                    <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                                        <div
                                            className="bg-green-600 h-2 rounded-full"
                                            style={{ width: `${item.completionRate}%` }}
                                        />
                                    </div>
                                    <span className="text-sm">{item.completionRate}%</span>
                                </div>
                            </td>
                            <td className="py-3 px-4">{item.totalDistance?.toLocaleString()} km</td>
                            <td className="py-3 px-4">RWF {item.totalExpenses?.toLocaleString()}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderFuelConsumptionReport = () => (
        <div>
            <h2 className="text-xl font-semibold mb-4">Fuel Consumption Report</h2>

            {reportData?.summary && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="stat-card border-blue-500">
                        <p className="text-sm text-gray-600">Total Fuel</p>
                        <p className="text-2xl font-bold">{reportData.summary.totalFuel} L</p>
                    </div>
                    <div className="stat-card border-green-500">
                        <p className="text-sm text-gray-600">Total Cost</p>
                        <p className="text-2xl font-bold">RWF {reportData.summary.totalCost?.toLocaleString()}</p>
                    </div>
                    <div className="stat-card border-yellow-500">
                        <p className="text-sm text-gray-600">Total Refuels</p>
                        <p className="text-2xl font-bold">{reportData.summary.totalRefuels}</p>
                    </div>
                    <div className="stat-card border-purple-500">
                        <p className="text-sm text-gray-600">Avg Price/L</p>
                        <p className="text-2xl font-bold">RWF {reportData.summary.averagePricePerLiter}</p>
                    </div>
                </div>
            )}

            <div className="overflow-x-auto">
                <table className="min-w-full">
                    <thead>
                    <tr className="border-b">
                        <th className="text-left py-3 px-4">Vehicle</th>
                        <th className="text-left py-3 px-4">Period</th>
                        <th className="text-left py-3 px-4">Total Fuel</th>
                        <th className="text-left py-3 px-4">Total Cost</th>
                        <th className="text-left py-3 px-4">Avg Price/L</th>
                        <th className="text-left py-3 px-4">Refuels</th>
                    </tr>
                    </thead>
                    <tbody>
                    {reportData?.report?.map((item, index) => (
                        <tr key={index} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4 font-medium">
                                {item.vehicle}
                                <br />
                                <span className="text-sm text-gray-500 capitalize">{item.vehicleType}</span>
                            </td>
                            <td className="py-3 px-4">
                                {new Date(item.year, item.month - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}
                            </td>
                            <td className="py-3 px-4">{item.totalFuel} L</td>
                            <td className="py-3 px-4">RWF {item.totalCost?.toLocaleString()}</td>
                            <td className="py-3 px-4">RWF {item.avgPricePerLiter}</td>
                            <td className="py-3 px-4">{item.refuelCount}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderMaintenanceReport = () => (
        <div>
            <h2 className="text-xl font-semibold mb-4">Maintenance Report</h2>

            {reportData?.upcomingMaintenance && reportData.upcomingMaintenance.length > 0 && (
                <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3 text-yellow-600">⚠️ Upcoming Maintenance</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {reportData.upcomingMaintenance.map((item) => (
                            <div key={item._id} className="card border-l-4 border-yellow-500">
                                <p className="font-semibold">{item.vehicle?.registrationNumber}</p>
                                <p className="text-sm text-gray-600">{item.vehicle?.brand} {item.vehicle?.model}</p>
                                <p className="text-sm mt-2 capitalize">{item.maintenanceType?.replace('_', ' ')}</p>
                                <p className="text-sm font-medium text-yellow-600">
                                    Scheduled: {new Date(item.scheduledDate).toLocaleDateString()}
                                </p>
                                <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="overflow-x-auto">
                <table className="min-w-full">
                    <thead>
                    <tr className="border-b">
                        <th className="text-left py-3 px-4">Vehicle</th>
                        <th className="text-left py-3 px-4">Total Services</th>
                        <th className="text-left py-3 px-4">Completed</th>
                        <th className="text-left py-3 px-4">Pending</th>
                        <th className="text-left py-3 px-4">Total Cost</th>
                        <th className="text-left py-3 px-4">Avg Cost</th>
                    </tr>
                    </thead>
                    <tbody>
                    {reportData?.report?.map((item) => (
                        <tr key={item._id} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4 font-medium">
                                {item.registrationNumber}
                                <br />
                                <span className="text-sm text-gray-500 capitalize">{item.vehicleType}</span>
                            </td>
                            <td className="py-3 px-4">{item.totalServices}</td>
                            <td className="py-3 px-4 text-green-600">{item.completedServices}</td>
                            <td className="py-3 px-4 text-yellow-600">{item.pendingServices}</td>
                            <td className="py-3 px-4">RWF {item.totalCost?.toLocaleString()}</td>
                            <td className="py-3 px-4">RWF {item.averageCost?.toLocaleString()}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderExpenseReport = () => (
        <div>
            <h2 className="text-xl font-semibold mb-4">Expense Report</h2>

            {reportData?.grandTotal > 0 && (
                <div className="stat-card border-blue-500 mb-6">
                    <p className="text-sm text-gray-600">Grand Total Expenses</p>
                    <p className="text-3xl font-bold">RWF {reportData.grandTotal?.toLocaleString()}</p>
                </div>
            )}

            <div className="overflow-x-auto">
                <table className="min-w-full">
                    <thead>
                    <tr className="border-b">
                        <th className="text-left py-3 px-4">Expense Type</th>
                        <th className="text-left py-3 px-4">Count</th>
                        <th className="text-left py-3 px-4">Total Amount</th>
                        <th className="text-left py-3 px-4">Average</th>
                        <th className="text-left py-3 px-4">Percentage</th>
                    </tr>
                    </thead>
                    <tbody>
                    {reportData?.report?.map((item) => (
                        <tr key={item.expenseType} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4 font-medium capitalize">{item.expenseType?.replace('_', ' ')}</td>
                            <td className="py-3 px-4">{item.count}</td>
                            <td className="py-3 px-4">RWF {item.totalAmount?.toLocaleString()}</td>
                            <td className="py-3 px-4">RWF {item.averageAmount?.toLocaleString()}</td>
                            <td className="py-3 px-4">
                                <div className="flex items-center">
                                    <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                                        <div
                                            className="bg-primary-600 h-2 rounded-full"
                                            style={{ width: `${item.percentage}%` }}
                                        />
                                    </div>
                                    <span className="text-sm">{item.percentage}%</span>
                                </div>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Reports</h1>
                <div className="flex gap-2">
                    <button onClick={handlePrint} className="btn-secondary">
                        🖨️ Print
                    </button>
                    <button onClick={handleExportCSV} className="btn-primary">
                        📥 Export CSV
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                            activeTab === tab.id
                                ? 'bg-primary-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                    >
                        {tab.icon} {tab.label}
                    </button>
                ))}
            </div>

            {/* Filters */}
            <div className="flex gap-4 mb-6 flex-wrap">
                <input
                    type="date"
                    value={dateRange.startDate}
                    onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
                    className="input-field max-w-xs"
                />
                <input
                    type="date"
                    value={dateRange.endDate}
                    onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
                    className="input-field max-w-xs"
                />
                {activeTab !== 'driver-activity' && activeTab !== 'expenses' && (
                    <select
                        value={vehicleFilter}
                        onChange={(e) => setVehicleFilter(e.target.value)}
                        className="input-field max-w-xs"
                    >
                        <option value="">All Vehicles</option>
                        {vehicles.map(v => (
                            <option key={v._id} value={v._id}>{v.registrationNumber}</option>
                        ))}
                    </select>
                )}
            </div>

            {/* Report Content */}
            <div className="card">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                    </div>
                ) : reportData ? (
                    <>
                        {activeTab === 'vehicle-usage' && renderVehicleUsageReport()}
                        {activeTab === 'driver-activity' && renderDriverActivityReport()}
                        {activeTab === 'fuel-consumption' && renderFuelConsumptionReport()}
                        {activeTab === 'maintenance' && renderMaintenanceReport()}
                        {activeTab === 'expenses' && renderExpenseReport()}
                    </>
                ) : (
                    <div className="text-center py-12 text-gray-500">
                        No data available for the selected filters
                    </div>
                )}
            </div>
        </div>
    );
};

export default Reports;