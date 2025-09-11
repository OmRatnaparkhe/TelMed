import { PrismaClient, Role } from '@prisma/client';
const prisma = new PrismaClient();
export const getAvailableDoctors = async (req, res) => {
    try {
        const availableDoctors = await prisma.doctorProfile.findMany({
            where: {
                isAvailable: true,
            },
            include: {
                user: {
                    select: { id: true, firstName: true, lastName: true, email: true, phone: true },
                },
            },
            orderBy: {
                user: { lastName: 'asc' },
            },
        });
        res.json(availableDoctors);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching available doctors' });
    }
};
export const updateMyAvailabilityStatus = async (req, res) => {
    if (!req.userId || req.userRole !== Role.DOCTOR) {
        return res.status(403).json({ error: 'Access denied' });
    }
    const { isAvailable } = req.body;
    if (typeof isAvailable !== 'boolean') {
        return res.status(400).json({ error: 'isAvailable must be a boolean' });
    }
    try {
        const updatedDoctorProfile = await prisma.doctorProfile.update({
            where: { userId: req.userId },
            data: { isAvailable },
            select: { isAvailable: true, user: { select: { firstName: true, lastName: true } } },
        });
        res.json(updatedDoctorProfile);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error updating availability status' });
    }
};
