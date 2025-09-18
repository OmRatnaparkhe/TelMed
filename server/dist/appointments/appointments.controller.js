import { PrismaClient, AppointmentStatus, Role } from '@prisma/client';
const prisma = new PrismaClient();
export const getMyAppointments = async (req, res) => {
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
        const upcomingAppointments = await prisma.appointment.findMany({
            where: {
                patientId: patientProfile.id,
                appointmentTime: { gt: new Date() },
            },
            include: {
                doctor: { select: { user: { select: { firstName: true, lastName: true } } } },
            },
            orderBy: {
                appointmentTime: 'asc',
            },
        });
        res.json(upcomingAppointments);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching appointments' });
    }
};
export const createAppointment = async (req, res) => {
    if (!req.userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    const { doctorId, appointmentTime, symptoms } = req.body;
    try {
        const patientProfile = await prisma.patientProfile.findUnique({
            where: { userId: req.userId },
            select: { id: true },
        });
        if (!patientProfile) {
            return res.status(404).json({ error: 'Patient profile not found' });
        }
        const newAppointment = await prisma.appointment.create({
            data: {
                patientId: patientProfile.id,
                doctorId,
                appointmentTime: new Date(appointmentTime),
                symptoms,
                status: AppointmentStatus.PENDING, // Default status
            },
        });
        res.status(201).json(newAppointment);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error creating appointment' });
    }
};
// Doctor-facing functions
export const getPendingAppointments = async (req, res) => {
    if (!req.userId || req.userRole !== Role.DOCTOR) {
        return res.status(403).json({ error: 'Access denied' });
    }
    try {
        const doctorProfile = await prisma.doctorProfile.findUnique({
            where: { userId: req.userId },
            select: { id: true },
        });
        if (!doctorProfile) {
            return res.status(404).json({ error: 'Doctor profile not found' });
        }
        const pendingAppointments = await prisma.appointment.findMany({
            where: {
                doctorId: doctorProfile.id,
                status: AppointmentStatus.PENDING,
            },
            include: {
                patient: { select: { user: { select: { firstName: true, lastName: true, phone: true, email: true } } } },
            },
            orderBy: {
                appointmentTime: 'asc',
            },
        });
        res.json(pendingAppointments);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching pending appointments' });
    }
};
export const getTodaysConfirmedAppointmentsForDoctor = async (req, res) => {
    if (!req.userId || req.userRole !== Role.DOCTOR) {
        return res.status(403).json({ error: 'Access denied' });
    }
    try {
        const doctorProfile = await prisma.doctorProfile.findUnique({
            where: { userId: req.userId },
            select: { id: true },
        });
        if (!doctorProfile) {
            return res.status(404).json({ error: 'Doctor profile not found' });
        }
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);
        const startOfTomorrow = new Date(startOfToday);
        startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);
        const todaysConfirmed = await prisma.appointment.findMany({
            where: {
                doctorId: doctorProfile.id,
                status: AppointmentStatus.CONFIRMED,
                appointmentTime: {
                    gte: startOfToday,
                    lt: startOfTomorrow,
                },
            },
            include: {
                patient: { select: { user: { select: { firstName: true, lastName: true, phone: true, email: true } } } },
            },
            orderBy: { appointmentTime: 'asc' },
        });
        res.json(todaysConfirmed);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching today\'s confirmed appointments' });
    }
};
export const getAppointmentHistoryForDoctor = async (req, res) => {
    if (!req.userId || req.userRole !== Role.DOCTOR) {
        return res.status(403).json({ error: 'Access denied' });
    }
    const { status, limit } = req.query;
    const take = Math.min(parseInt(limit || '20', 10) || 20, 100);
    try {
        const doctorProfile = await prisma.doctorProfile.findUnique({
            where: { userId: req.userId },
            select: { id: true },
        });
        if (!doctorProfile) {
            return res.status(404).json({ error: 'Doctor profile not found' });
        }
        const whereClause = { doctorId: doctorProfile.id };
        if (status && Object.values(AppointmentStatus).includes(status)) {
            whereClause.status = status;
        }
        const history = await prisma.appointment.findMany({
            where: whereClause,
            include: {
                patient: { select: { user: { select: { firstName: true, lastName: true, phone: true, email: true } } } },
            },
            orderBy: { appointmentTime: 'desc' },
            take,
        });
        res.json(history);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching appointment history' });
    }
};
export const getAppointmentByIdForDoctor = async (req, res) => {
    if (!req.userId || req.userRole !== Role.DOCTOR) {
        return res.status(403).json({ error: 'Access denied' });
    }
    const { id } = req.params; // appointment ID
    try {
        const doctorProfile = await prisma.doctorProfile.findUnique({
            where: { userId: req.userId },
            select: { id: true },
        });
        if (!doctorProfile) {
            return res.status(404).json({ error: 'Doctor profile not found' });
        }
        const appointment = await prisma.appointment.findUnique({
            where: { id },
            include: {
                patient: {
                    select: {
                        user: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                email: true,
                                phone: true,
                            },
                        },
                    },
                },
            },
        });
        if (!appointment || appointment.doctorId !== doctorProfile.id) {
            return res.status(404).json({ error: 'Appointment not found or not assigned to this doctor' });
        }
        // Return the appointment as-is; client expects: id, patient.user{...}, symptoms, appointmentTime
        return res.json(appointment);
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Error fetching appointment details' });
    }
};
export const approveAppointment = async (req, res) => {
    if (!req.userId || req.userRole !== Role.DOCTOR) {
        return res.status(403).json({ error: 'Access denied' });
    }
    const { id } = req.params; // appointment ID
    try {
        const doctorProfile = await prisma.doctorProfile.findUnique({
            where: { userId: req.userId },
            select: { id: true },
        });
        if (!doctorProfile) {
            return res.status(404).json({ error: 'Doctor profile not found' });
        }
        const appointment = await prisma.appointment.findUnique({
            where: { id },
        });
        if (!appointment || appointment.doctorId !== doctorProfile.id) {
            return res.status(404).json({ error: 'Appointment not found or not assigned to this doctor' });
        }
        const updatedAppointment = await prisma.appointment.update({
            where: { id },
            data: { status: AppointmentStatus.CONFIRMED },
        });
        res.json(updatedAppointment);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error approving appointment' });
    }
};
export const rejectAppointment = async (req, res) => {
    if (!req.userId || req.userRole !== Role.DOCTOR) {
        return res.status(403).json({ error: 'Access denied' });
    }
    const { id } = req.params; // appointment ID
    try {
        const doctorProfile = await prisma.doctorProfile.findUnique({
            where: { userId: req.userId },
            select: { id: true },
        });
        if (!doctorProfile) {
            return res.status(404).json({ error: 'Doctor profile not found' });
        }
        const appointment = await prisma.appointment.findUnique({
            where: { id },
        });
        if (!appointment || appointment.doctorId !== doctorProfile.id) {
            return res.status(404).json({ error: 'Appointment not found or not assigned to this doctor' });
        }
        const updatedAppointment = await prisma.appointment.update({
            where: { id },
            data: { status: AppointmentStatus.CANCELLED, consultationNotes: 'Rejected by doctor' },
        });
        res.json(updatedAppointment);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error rejecting appointment' });
    }
};
export const completeAppointment = async (req, res) => {
    if (!req.userId || req.userRole !== Role.DOCTOR) {
        return res.status(403).json({ error: 'Access denied' });
    }
    const { id } = req.params; // appointment ID
    try {
        const doctorProfile = await prisma.doctorProfile.findUnique({
            where: { userId: req.userId },
            select: { id: true },
        });
        if (!doctorProfile) {
            return res.status(404).json({ error: 'Doctor profile not found' });
        }
        const appointment = await prisma.appointment.findUnique({
            where: { id },
        });
        if (!appointment || appointment.doctorId !== doctorProfile.id) {
            return res.status(404).json({ error: 'Appointment not found or not assigned to this doctor' });
        }
        const updatedAppointment = await prisma.appointment.update({
            where: { id },
            data: { status: AppointmentStatus.COMPLETED },
        });
        res.json(updatedAppointment);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error completing appointment' });
    }
};
