const mongoose = require('mongoose');
const dotenv = require('dotenv');

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
        console.log('Connected to MongoDB...\n');

        // Clear all collections
        await Promise.all([
            User.deleteMany({}),
            Vehicle.deleteMany({}),
            Driver.deleteMany({}),
            Trip.deleteMany({}),
            FuelRecord.deleteMany({}),
            Maintenance.deleteMany({})
        ]);
        console.log('✅ Cleared all collections\n');

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
        console.log(`✅ Created ${users.length} users`);

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
        console.log(`✅ Created ${vehicles.length} vehicles`);

        // Create drivers
        const drivers = await Driver.create([
            {
                userId: users[2]._id,
                licenseNumber: 'DL2024001',
                licenseExpiry: new Date('2026-12-31'),
                address: 'Kigali, Gasabo',
                experience: 5,
                status: 'active',
                emergencyContact: {
                    name: 'Alice Uwase',
                    phone: '0788000100',
                    relationship: 'Spouse'
                }
            },
            {
                userId: users[3]._id,
                licenseNumber: 'DL2024002',
                licenseExpiry: new Date('2027-06-30'),
                address: 'Kigali, Nyarugenge',
                experience: 8,
                status: 'active',
                emergencyContact: {
                    name: 'Grace Mugisha',
                    phone: '0788000200',
                    relationship: 'Sister'
                }
            },
            {
                userId: users[4]._id,
                licenseNumber: 'DL2024003',
                licenseExpiry: new Date('2025-03-15'),
                address: 'Kigali, Kicukiro',
                experience: 3,
                status: 'active',
                emergencyContact: {
                    name: 'John Habimana',
                    phone: '0788000300',
                    relationship: 'Brother'
                }
            }
        ]);
        console.log(`✅ Created ${drivers.length} drivers`);

        // Assign vehicles to drivers one by one
        await Driver.findByIdAndUpdate(drivers[0]._id, { assignedVehicle: vehicles[0]._id });
        await Vehicle.findByIdAndUpdate(vehicles[0]._id, { status: 'assigned', assignedDriver: drivers[0]._id });

        await Driver.findByIdAndUpdate(drivers[1]._id, { assignedVehicle: vehicles[1]._id });
        await Vehicle.findByIdAndUpdate(vehicles[1]._id, { status: 'assigned', assignedDriver: drivers[1]._id });

        await Driver.findByIdAndUpdate(drivers[2]._id, { assignedVehicle: vehicles[2]._id });
        await Vehicle.findByIdAndUpdate(vehicles[2]._id, { status: 'assigned', assignedDriver: drivers[2]._id });

        console.log('✅ Vehicles assigned to drivers');

        // Create trips one at a time to avoid duplicate tripNumber
        const trip1 = await Trip.create({
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
        });
        console.log(`✅ Created trip: ${trip1.tripNumber}`);

        const trip2 = await Trip.create({
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
        });
        console.log(`✅ Created trip: ${trip2.tripNumber}`);

        const trip3 = await Trip.create({
            vehicle: vehicles[2]._id,
            driver: drivers[2]._id,
            tripType: 'delivery',
            startLocation: 'Kigali',
            destination: 'Rubavu',
            startDate: new Date('2026-05-28'),
            startMileage: 7500,
            status: 'scheduled'
        });
        console.log(`✅ Created trip: ${trip3.tripNumber}`);

        const trip4 = await Trip.create({
            vehicle: vehicles[3]._id,
            driver: drivers[0]._id,
            tripType: 'rental',
            startLocation: 'Kigali',
            destination: 'Nyagatare',
            startDate: new Date('2026-05-15'),
            endDate: new Date('2026-05-16'),
            startMileage: 24000,
            endMileage: 24400,
            distance: 400,
            status: 'completed',
            expenses: [
                { type: 'fuel', amount: 60000, description: 'Petrol refill', date: new Date('2026-05-15') },
                { type: 'parking', amount: 5000, description: 'Overnight parking', date: new Date('2026-05-16') },
                { type: 'food', amount: 15000, description: 'Driver meals', date: new Date('2026-05-16') }
            ],
            totalExpenses: 80000
        });
        console.log(`✅ Created trip: ${trip4.tripNumber}`);
        console.log(`✅ Created 4 trips total`);

        // Create fuel records with explicit totalCost
        const fuelData = [
            {
                vehicle: vehicles[0]._id,
                driver: drivers[0]._id,
                fuelDate: new Date('2026-05-20'),
                quantity: 50,
                costPerLiter: 1500,
                totalCost: 50 * 1500, // 75000
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
                totalCost: 35 * 1500, // 52500
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
                totalCost: 40 * 1400, // 56000
                mileageAtRefuel: 7000,
                fuelType: 'petrol',
                station: 'SP Gas Station',
                receiptNumber: 'RCP003'
            },
            {
                vehicle: vehicles[3]._id,
                driver: drivers[0]._id,
                fuelDate: new Date('2026-05-10'),
                quantity: 45,
                costPerLiter: 1450,
                totalCost: 45 * 1450, // 65250
                mileageAtRefuel: 24000,
                fuelType: 'petrol',
                station: 'Kobil Station',
                receiptNumber: 'RCP004'
            }
        ];

// Create fuel records one by one to ensure hooks run properly
        const fuelRecords = [];
        for (const fuelDataItem of fuelData) {
            const record = await FuelRecord.create(fuelDataItem);
            fuelRecords.push(record);
            console.log(`✅ Created fuel record: ${record.receiptNumber} - RWF ${record.totalCost}`);
        }
        console.log(`✅ Created ${fuelRecords.length} fuel records total`);
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
        console.log(`✅ Created ${maintenanceRecords.length} maintenance records`);

        console.log('\n🎉 Database seeded successfully!');
        console.log('\n📋 Demo Login Credentials:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('Administrator:');
        console.log('  Email: admin@swiftwheels.com');
        console.log('  Password: admin123');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('Fleet Manager:');
        console.log('  Email: manager@swiftwheels.com');
        console.log('  Password: manager123');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('Driver:');
        console.log('  Email: pierre@swiftwheels.com');
        console.log('  Password: driver123');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        process.exit(0);
    } catch (error) {
        console.error('\n❌ Error seeding database:', error.message);
        console.error('\nStack trace:', error.stack);
        process.exit(1);
    }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
    process.exit(1);
});

seedDatabase();