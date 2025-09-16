import { PrismaClient, AppointmentStatus, Role } from '@prisma/client';
const prisma = new PrismaClient();
// List all users with basic info
export const getAllUsers = async (_req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: { id: true, email: true, role: true, firstName: true, lastName: true, phone: true, createdAt: true },
            orderBy: { createdAt: 'desc' }
        });
        res.json(users);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
};
// List all doctors with profile and availability
export const getAllDoctors = async (_req, res) => {
    try {
        const doctors = await prisma.doctorProfile.findMany({
            include: {
                user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true, role: true } },
            },
            orderBy: { user: { lastName: 'asc' } },
        });
        res.json(doctors);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch doctors' });
    }
};
// List all pharmacists (users with PHARMACIST role)
export const getAllPharmacists = async (_req, res) => {
    try {
        const pharmacists = await prisma.user.findMany({
            where: { role: Role.PHARMACIST },
            select: { id: true, firstName: true, lastName: true, email: true, phone: true, role: true },
            orderBy: { lastName: 'asc' }
        });
        res.json(pharmacists);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch pharmacists' });
    }
};
// Appointments summary: totals by status, counts per doctor, per patient, recent appointments
export const getAppointmentsSummary = async (_req, res) => {
    try {
        const [total, pending, confirmed, completed, cancelled] = await Promise.all([
            prisma.appointment.count(),
            prisma.appointment.count({ where: { status: AppointmentStatus.PENDING } }),
            prisma.appointment.count({ where: { status: AppointmentStatus.CONFIRMED } }),
            prisma.appointment.count({ where: { status: AppointmentStatus.COMPLETED } }),
            prisma.appointment.count({ where: { status: AppointmentStatus.CANCELLED } }),
        ]);
        // Group by doctor
        const byDoctorRaw = await prisma.appointment.groupBy({
            by: ['doctorId'],
            _count: { _all: true },
        });
        // Group by doctor and status for per-status breakdown
        const byDoctorStatusRaw = await prisma.appointment.groupBy({
            by: ['doctorId', 'status'],
            _count: { _all: true },
        });
        const doctorsMap = new Map(byDoctorRaw.map(r => [r.doctorId, r._count._all]));
        const doctors = await prisma.doctorProfile.findMany({
            where: { id: { in: Array.from(doctorsMap.keys()) } },
            include: { user: { select: { firstName: true, lastName: true, email: true } } }
        });
        // Aggregate per-status counts for each doctor
        const doctorStatusMap = {};
        for (const r of byDoctorStatusRaw) {
            const key = r.doctorId;
            if (!doctorStatusMap[key]) {
                doctorStatusMap[key] = { pending: 0, confirmed: 0, completed: 0, cancelled: 0 };
            }
            if (r.status === AppointmentStatus.PENDING)
                doctorStatusMap[key].pending += r._count._all;
            if (r.status === AppointmentStatus.CONFIRMED)
                doctorStatusMap[key].confirmed += r._count._all;
            if (r.status === AppointmentStatus.COMPLETED)
                doctorStatusMap[key].completed += r._count._all;
            if (r.status === AppointmentStatus.CANCELLED)
                doctorStatusMap[key].cancelled += r._count._all;
        }
        const bookingsPerDoctor = doctors.map(d => ({
            doctorId: d.id,
            name: `Dr. ${d.user.firstName} ${d.user.lastName}`,
            email: d.user.email,
            total: doctorsMap.get(d.id) || 0,
            statusBreakdown: doctorStatusMap[d.id] || { pending: 0, confirmed: 0, completed: 0, cancelled: 0 },
        })).sort((a, b) => b.total - a.total);
        // Group by patient
        const byPatientRaw = await prisma.appointment.groupBy({
            by: ['patientId'],
            _count: { _all: true },
        });
        // Group by patient and status for per-status breakdown
        const byPatientStatusRaw = await prisma.appointment.groupBy({
            by: ['patientId', 'status'],
            _count: { _all: true },
        });
        const patientsMap = new Map(byPatientRaw.map(r => [r.patientId, r._count._all]));
        const patients = await prisma.patientProfile.findMany({
            where: { id: { in: Array.from(patientsMap.keys()) } },
            include: { user: { select: { firstName: true, lastName: true, email: true } } }
        });
        // Aggregate per-status counts for each patient
        const patientStatusMap = {};
        for (const r of byPatientStatusRaw) {
            const key = r.patientId;
            if (!patientStatusMap[key]) {
                patientStatusMap[key] = { pending: 0, confirmed: 0, completed: 0, cancelled: 0 };
            }
            if (r.status === AppointmentStatus.PENDING)
                patientStatusMap[key].pending += r._count._all;
            if (r.status === AppointmentStatus.CONFIRMED)
                patientStatusMap[key].confirmed += r._count._all;
            if (r.status === AppointmentStatus.COMPLETED)
                patientStatusMap[key].completed += r._count._all;
            if (r.status === AppointmentStatus.CANCELLED)
                patientStatusMap[key].cancelled += r._count._all;
        }
        const bookingsPerUser = patients.map(p => ({
            patientId: p.id,
            name: `${p.user.firstName} ${p.user.lastName}`,
            email: p.user.email,
            total: patientsMap.get(p.id) || 0,
            statusBreakdown: patientStatusMap[p.id] || { pending: 0, confirmed: 0, completed: 0, cancelled: 0 },
        })).sort((a, b) => b.total - a.total);
        // Recent appointments
        const recentAppointments = await prisma.appointment.findMany({
            orderBy: { appointmentTime: 'desc' },
            take: 20,
            include: {
                patient: { include: { user: { select: { firstName: true, lastName: true } } } },
                doctor: { include: { user: { select: { firstName: true, lastName: true } } } },
            }
        });
        res.json({
            totals: { total, pending, confirmed, completed, cancelled },
            bookingsPerDoctor,
            bookingsPerUser,
            recentAppointments,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch appointments summary' });
    }
};
// Overview counts
export const getOverview = async (_req, res) => {
    try {
        const [users, doctors, pharmacists, pharmacies, patients] = await Promise.all([
            prisma.user.count(),
            prisma.user.count({ where: { role: Role.DOCTOR } }),
            prisma.user.count({ where: { role: Role.PHARMACIST } }),
            prisma.pharmacy.count(),
            prisma.user.count({ where: { role: Role.PATIENT } }),
        ]);
        res.json({ users, doctors, pharmacists, pharmacies, patients });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch overview' });
    }
};
