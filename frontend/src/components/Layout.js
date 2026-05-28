import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Layout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const menuItems = [
        { path: '/', label: 'Dashboard', icon: '📊' },
        { path: '/vehicles', label: 'Vehicles', icon: '🚛' },
        { path: '/drivers', label: 'Drivers', icon: '👨‍✈️' },
        { path: '/trips', label: 'Trips', icon: '🗺️' },
        { path: '/fuel', label: 'Fuel Records', icon: '⛽' },
        { path: '/maintenance', label: 'Maintenance', icon: '🔧' },
        { path: '/reports', label: 'Reports', icon: '📋' },
    ];

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <div className={`fixed inset-y-0 left-0 z-30 w-64 bg-primary-900 text-white transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:inset-0`}>
                <div className="flex items-center justify-between h-16 px-6 bg-primary-950">
                    <Link to="/" className="text-xl font-bold">
                        🚛 SwiftWheels
                    </Link>
                    <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-white">
                        ✕
                    </button>
                </div>

                <nav className="mt-6">
                    {menuItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center px-6 py-3 text-sm hover:bg-primary-800 transition-colors ${
                                location.pathname === item.path ? 'bg-primary-800 border-l-4 border-white' : ''
                            }`}
                            onClick={() => setSidebarOpen(false)}
                        >
                            <span className="mr-3">{item.icon}</span>
                            {item.label}
                        </Link>
                    ))}
                </nav>

                <div className="absolute bottom-0 w-full p-6">
                    <div className="text-sm text-gray-300">
                        Logged in as: <span className="font-semibold text-white">{user?.firstName} {user?.lastName}</span>
                        <br />
                        <span className="text-xs capitalize">({user?.role?.replace('_', ' ')})</span>
                    </div>
                </div>
            </div>

            {/* Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="bg-white shadow-sm">
                    <div className="flex items-center justify-between h-16 px-6">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden text-gray-600"
                        >
                            ☰
                        </button>

                        <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
                            <button
                                onClick={handleLogout}
                                className="btn-danger text-sm"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Layout;