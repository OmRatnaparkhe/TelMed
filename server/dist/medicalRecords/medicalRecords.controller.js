import { PrismaClient, Role, PrescriptionStatus } from '@prisma/client';
const prisma = new PrismaClient();
export const getMyMedicalRecords = async (req, res) => {
    if (!req.userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    try {
        const patientProfile = await prisma.patientProfile.findUnique({
            where: { userId: req.userId },
            select: { id: true },
        });
        if (!patientProfile) {
            return res.status(404).json({ error: 'Patient profile not found' });
        }
        const medicalRecords = await prisma.medicalRecord.findMany({
            where: {
                patientId: patientProfile.id,
            },
            include: {
                doctor: { select: { user: { select: { firstName: true, lastName: true } } } },
                appointment: { select: { appointmentTime: true } },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        res.json(medicalRecords);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching medical records' });
    }
};
export const createMedicalRecord = async (req, res) => {
    if (!req.userId || req.userRole !== Role.DOCTOR) {
        return res.status(403).json({ error: 'Access denied' });
    }
    const { appointmentId, diagnosis, prescriptionItems, pharmacyId } = req.body;
    try {
        const doctorProfile = await prisma.doctorProfile.findUnique({
            where: { userId: req.userId },
            select: { id: true },
        });
        if (!doctorProfile) {
            return res.status(404).json({ error: 'Doctor profile not found' });
        }
        const appointment = await prisma.appointment.findUnique({
            where: { id: appointmentId },
            select: { doctorId: true, patientId: true },
        });
        if (!appointment || appointment.doctorId !== doctorProfile.id) {
            return res.status(403).json({ error: 'Appointment not found or not assigned to this doctor' });
        }
        const newMedicalRecord = await prisma.medicalRecord.create({
            data: {
                patientId: appointment.patientId, // Use PatientProfile ID from appointment to satisfy FK
                doctorId: doctorProfile.id,
                appointmentId,
                diagnosis,
                // The 'prescription' string field is being replaced by structured Prescription model
                // So, we remove it from MedicalRecord creation.
            },
        });
        // If prescription items are provided, create a formal Prescription
        if (prescriptionItems && prescriptionItems.length > 0) {
            if (!pharmacyId) {
                return res.status(400).json({ error: 'Pharmacy ID is required for prescriptions' });
            }
            await prisma.prescription.create({
                data: {
                    patientId: appointment.patientId,
                    doctorId: doctorProfile.id,
                    pharmacyId: pharmacyId,
                    status: PrescriptionStatus.PENDING, // Default status
                    items: {
                        create: await Promise.all(prescriptionItems.map(async (item) => {
                            let medicine = await prisma.medicine.findFirst({
                                where: { name: { equals: item.medicineName, mode: 'insensitive' } },
                            });
                            if (!medicine) {
                                medicine = await prisma.medicine.create({
                                    data: {
                                        name: item.medicineName,
                                        genericName: item.medicineName, // Default generic name to be the same
                                    },
                                });
                            }
                            return {
                                medicine: { connect: { id: medicine.id } },
                                quantity: item.quantity,
                                instructions: item.instructions,
                                dosageInstructions: {
                                    create: item.dosageInstructions.map(di => ({
                                        languageCode: 'en', // Assuming English for now, can be dynamic
                                        text: `${di.dosage} - ${di.frequency} for ${di.duration}`,
                                    })),
                                },
                            };
                        })),
                    },
                },
            });
        }
        res.status(201).json(newMedicalRecord);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error creating medical record or prescription' });
    }
};
