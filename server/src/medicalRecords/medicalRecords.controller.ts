import { Request, Response } from 'express';
import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

interface AuthRequest extends Request {
  userId?: string;
  userRole?: Role; // Add userRole
}

export const getMyMedicalRecords = async (req: AuthRequest, res: Response) => {
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
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching medical records' });
  }
};

export const createMedicalRecord = async (req: AuthRequest, res: Response) => {
  if (!req.userId || req.userRole !== Role.DOCTOR) {
    return res.status(403).json({ error: 'Access denied' });
  }

  const { patientId, appointmentId, diagnosis, prescription } = req.body;

  try {
    const doctorProfile = await prisma.doctorProfile.findUnique({
      where: { userId: req.userId },
      select: { id: true },
    });

    if (!doctorProfile) {
      return res.status(404).json({ error: 'Doctor profile not found' });
    }

    // Verify the doctor is associated with the appointment (optional but good for data integrity)
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      select: { doctorId: true },
    });

    if (!appointment || appointment.doctorId !== doctorProfile.id) {
      return res.status(403).json({ error: 'Appointment not found or not assigned to this doctor' });
    }

    const newMedicalRecord = await prisma.medicalRecord.create({
      data: {
        patientId,
        doctorId: doctorProfile.id,
        appointmentId,
        diagnosis,
        prescription,
      },
    });

    res.status(201).json(newMedicalRecord);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error creating medical record' });
  }
};
