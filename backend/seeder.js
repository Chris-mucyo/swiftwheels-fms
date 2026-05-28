const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

// Import all models
const User = require('./models/User');
const Vehicle = require('./models/Vehicle');
const Driver = require('./models/Driver');
const Trip = require('./models/Trip');
const FuelRecord = require('./models/FuelRecord');
const Maintenance = require('./models/Maintenance');

const seedDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB...');

        // Clear all collections
        await Promise.all([
            User.deleteMany(),
            Vehicle.deleteMany(),
            Driver.deleteMany(),
            Trip.deleteMany(),
            FuelRecord.deleteMany(),
            Maintenance.deleteMany()
        ]);
        console.log('Cleared all collections');

        // Create users
        const users = await User.create([
            {
                firstName: 'Jean',
                lastName: 'Admin',
                email: 'admin@swiftwheels.com',
                password: 'admin123',
                role: 'administrator',
                phone: '0788000001'
            },
            {
                firstName: 'Marie',
                lastName: 'Manager',
                email: 'manager@swiftwheels.com',
                password: 'manager123',
                role: 'fleet_manager',
                phone: '0788000002'
            },
            {
                firstName: 'Pierre',
                lastName: 'Driver1',
                email: 'pierre@swiftwheels.com',
                password: 'driver123',
                role: 'driver',
                phone: '0788000003'
            },
            {
                firstName: 'David',
                lastName: 'Driver2',
                email: 'david@swiftwheels.com',
                password: 'driver123',
                role: 'driver',
                phone: '0788000004'
            },
            {
                firstName: 'Emmanuel',
                lastName: 'Driver3',
                email: 'emmanuel@swiftwheels.com',
                password: 'driver123',
                role: 'driver',
                phone: '0788000005'
            }
        ]);
        console.log(`Created ${users.length} users`);

        // Create vehicles
        const vehicles = await Vehicle.create([
            {
                registrationNumber: 'RAA001A',
                type: 'truck',
                brand: 'Isuzu',
                model: 'FVR 900',
                year: 2023,
                color: 'White',
                fuelType: 'diesel',
                capacity: '10 tons',
                status: 'available',
                currentMileage: 15000
            },
            {
                registrationNumber: 'RAB002B',
                type: 'bus',
                brand: 'Toyota',
                model: 'Coaster',
                year: 2022,
                color: 'Silver',
                fuelType: 'diesel',
                capacity: '30 passengers',
                status: 'available',
                currentMileage: 45000
            },
            {
                registrationNumber: 'RAC003C',
                type: 'van',
                brand: 'Toyota',
                model: 'Hiace',
                year: 2024,
                color: 'White',
                fuelType: 'petrol',
                capacity: '1.5 tons',
                status: 'available',
                currentMileage: 8000
            },
            {
                registrationNumber: 'RAD004D',
                type: 'car',
                brand: 'Toyota',
                model: 'Corolla',
                year: 2023,
                color: 'Black',
                fuelType: 'petrol',
                capacity: '5 passengers',
                status: 'available',
                currentMileage: 25000
            },
            {
                registrationNumber: 'RAE005E',
                type: 'truck',
                brand: 'Mitsubishi',
                model: 'Fuso',
                year: 2021,
                color: 'Blue',
                fuelType: 'diesel',
                capacity: '15 tons',
                status: 'maintenance',
                currentMileage: 120000
            }
        ]);
        console.log(`Created ${vehicles.length} vehicles`);

        // Create drivers
        const drivers = await Driver.create([
            {
                userId: users[2]._id, // Pierre
                licenseNumber: 'DL2024001',
                licenseExpiry: new Date('2026-12-31'),
                address: 'Kigali, Gasabo',
                experience: 5,
                status: 'active',
                emergencyContact: {
                    name: 'Alice Uwase',
                    phone: '0788000100',
                    relationship: 'Spouse'
                },
                assignedVehicle: vehicles[0]._id
            },
            {
                userId: users[3]._id, // David
                licenseNumber: 'DL2024002',
                licenseExpiry: new Date('2027-06-30'),
                address: 'Kigali, Nyarugenge',
                experience: 8,
                status: 'active',
                emergencyContact: {
                    name: 'Grace Mugisha',
                    phone: '0788000200',
                    relationship: 'Sister'
                },
                assignedVehicle: vehicles[1]._id
            },
            {
                userId: users[4]._id, // Emmanuel
                licenseNumber: 'DL2024003',
                licenseExpiry: new Date('2025-03-15'),
                address: 'Kigali, Kicukiro',
                experience: 3,
                status: 'active',
                emergencyContact: {
                    name: 'John Habimana',
                    phone: '0788000300',
                    relationship: 'Brother'
                },
                assignedVehicle: vehicles[2]._id
            }
        ]);
        console.log(`Created ${drivers.length} drivers`);

        // Update vehicles with assigned drivers
        await Vehicle.findByIdAndUpdate(vehicles[0]._id, {
            status: 'assigned',
            assignedDriver: drivers[0]._id
        });
        await Vehicle.findByIdAndUpdate(vehicles[1]._id, {
            status: 'assigned',
            assignedDriver: drivers[1]._id
        });
        await Vehicle.findByIdAndUpdate(vehicles[2]._id, {
            status: 'assigned',
            assignedDriver: drivers[2]._id
        });

        // Create trips
        const trips = await Trip.create([
            {
                vehicle: vehicles[0]._id,
                driver: drivers[0]._id,
                tripType: 'goods_transport',
                startLocation: 'Kigali',
                destination: 'Musanze',
                startDate: new Date('2026-05-20'),
                endDate: new Date('2026-05-20'),
                startMileage: 14000,
                endMileage: 14200,
                distance: 200,
                status: 'completed',
                expenses: [
                    { type: 'fuel', amount: 50000, description: 'Diesel refill', date: new Date('2026-05-20') },
                    { type: 'toll', amount: 2000, description: 'Toll gate', date: new Date('2026-05-20') }
                ],
                totalExpenses: 52000
            },
            {
                vehicle: vehicles[1]._id,
                driver: drivers[1]._id,
                tripType: 'passenger_transport',
                startLocation: 'Kigali',
                destination: 'Huye',
                startDate: new Date('2026-05-25'),
                startMileage: 44000,
                status: 'in_progress',
                expenses: [
                    { type: 'fuel', amount: 35000, description: 'Diesel refill', date: new Date('2026-05-25') }
                ],
                totalExpenses: 35000
            },
            {
                vehicle: vehicles[2]._id,
                driver: drivers[2]._id,
                tripType: 'delivery',
                startLocation: 'Kigali',
                destination: 'Rubavu',
                startDate: new Date('2026-05-28'),
                startMileage: 7500,
                status: 'scheduled'
            }
        ]);
        console.log(`Created ${trips.length} trips`);

        // Create fuel records
        const fuelRecords = await FuelRecord.create([
            {
                vehicle: vehicles[0]._id,
                driver: drivers[0]._id,
                fuelDate: new Date('2026-05-20'),
                quantity: 50,
                costPerLiter: 1500,
                mileageAtRefuel: 14000,
                fuelType: 'diesel',
                station: 'Total Gas Station',
                receiptNumber: 'RCP001'
            },
            {
                vehicle: vehicles[1]._id,
                driver: drivers[1]._id,
                fuelDate: new Date('2026-05-25'),
                quantity: 35,
                costPerLiter: 1500,
                mileageAtRefuel: 44000,
                fuelType: 'diesel',
                station: 'Engen Gas Station',
                receiptNumber: 'RCP002'
            },
            {
                vehicle: vehicles[2]._id,
                driver: drivers[2]._id,
                fuelDate: new Date('2026-05-15'),
                quantity: 40,
                costPerLiter: 1400,
                mileageAtRefuel: 7000,
                fuelType: 'petrol',
                station: 'SP Gas Station',
                receiptNumber: 'RCP003'
            },
            {
                vehicle: vehicles[3]._id,
                driver: null,
                fuelDate: new Date('2026-05-10'),
                quantity: 45,
                costPerLiter: 1450,
                mileageAtRefuel: 24000,
                fuelType: 'petrol',
                station: 'Kobil Station',
                receiptNumber: 'RCP004'
            }
        ]);
        console.log(`Created ${fuelRecords.length} fuel records`);

        // Create maintenance records
        const maintenanceRecords = await Maintenance.create([
            {
                vehicle: vehicles[4]._id,
                maintenanceType: 'repair',
                description: 'Engine overhaul and brake system replacement',
                scheduledDate: new Date('2026-06-01'),
                cost: 500000,
                serviceProvider: 'Toyota Rwanda Service Center',
                status: 'scheduled',
                priority: 'high',
                notes: 'Vehicle has been experiencing engine issues'
            },
            {
                vehicle: vehicles[0]._id,
                maintenanceType: 'routine_service',
                description: 'Regular 10,000 km service',
                scheduledDate: new Date('2026-06-15'),
                cost: 150000,
                serviceProvider: 'Isuzu Service Center',
                status: 'scheduled',
                priority: 'medium',
                nextServiceMileage: 25000,
                nextServiceDate: new Date('2026-12-15')
            },
            {
                vehicle: vehicles[1]._id,
                maintenanceType: 'oil_change',
                description: 'Engine oil and filter change',
                scheduledDate: new Date('2026-05-15'),
                completedDate: new Date('2026-05-15'),
                cost: 75000,
                serviceProvider: 'AutoCare Garage',
                status: 'completed',
                priority: 'low'
            }
        ]);
        console.log(`Created ${maintenanceRecords.length} maintenance records`);

        console.log('\n✅ Database seeded successfully!');
        console.log('\n📋 Demo Credentials:');
        console.log('Admin: admin@swiftwheels.com / admin123');
        console.log('Manager: manager@swiftwheels.com / manager123');
        console.log('Driver: pierre@swiftwheels.com / driver123');

        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seedDatabase();