import { Request, Response } from 'express';
import { PrismaClient, Role } from '@prisma/client';
// Local typing decoupled from Prisma enum exports to avoid TS import issues across versions
type PrescriptionStatus = 'PENDING' | 'DISPENSED';

const prisma = new PrismaClient();

// Allowed statuses (and runtime validation) independent of Prisma export shape
const AllowedPrescriptionStatuses = ['PENDING', 'DISPENSED'] as const;
const isPrescriptionStatus = (s: string): s is PrescriptionStatus => (AllowedPrescriptionStatuses as readonly string[]).includes(s);

interface AuthRequest extends Request {
  userId?: string;
  userRole?: Role;
}

// List e-prescriptions for pharmacists
// Optional query: status=PENDING|DISPENSED
export const listPrescriptions = async (req: AuthRequest, res: Response) => {
  if (!req.userId || req.userRole !== Role.PHARMACIST) {
    return res.status(403).json({ error: 'Access denied' });
  }

  const { status } = req.query as { status?: string };
  // Normalize and validate status if provided
  let normalizedStatus: PrescriptionStatus | undefined = undefined;
  if (status && typeof status === 'string') {
    const candidate = status.toUpperCase();
    if (isPrescriptionStatus(candidate)) {
      normalizedStatus = candidate;
    } else {
      return res.status(400).json({ error: 'Invalid status. Allowed: ' + (AllowedPrescriptionStatuses as readonly string[]).join(', ') });
    }
  }

  try {
    const prescriptions = await prisma.prescription.findMany({
      where: {
        ...(normalizedStatus ? { status: normalizedStatus as any } : {}),
      },
      orderBy: { createdAt: 'desc' },
      include: {
        patient: { include: { user: { select: { firstName: true, lastName: true, email: true } } } },
        doctor: { include: { user: { select: { firstName: true, lastName: true, email: true } } } },
        items: {
          include: {
            medicine: { select: { id: true, name: true, genericName: true } },
            dosageInstructions: true,
          },
        },
      },
      take: 100,
    });

    res.json(prescriptions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching prescriptions' });
  }
};

// Update a prescription's status
export const updatePrescriptionStatus = async (req: AuthRequest, res: Response) => {
  if (!req.userId || req.userRole !== Role.PHARMACIST) {
    return res.status(403).json({ error: 'Access denied' });
  }

  const { id } = req.params;
  const { status } = req.body as { status: PrescriptionStatus | string };
  // Normalize input to enum and validate
  const normalized: string = typeof status === 'string' ? status.toUpperCase() : (status as string);
  if (!isPrescriptionStatus(normalized)) {
    return res.status(400).json({ error: 'Invalid prescription status provided. Allowed: ' + (AllowedPrescriptionStatuses as readonly string[]).join(', ') });
  }

  try {
    const updated = await prisma.prescription.update({
      where: { id },
      data: { status: normalized as any },
    });

    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error updating prescription status' });
  }
};

