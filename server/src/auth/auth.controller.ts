import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret'; // Use environment variable for secret

// Register a new user
export const register = async (req: Request, res: Response) => {
  const {
    email,
    password,
    role,
    firstName,
    lastName,
    phone,
    dob,
    gender,
    address,
    bloodGroup,
    emergencyContact,
    specialization,
    qualifications,
    experienceYears,
  } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role,
        firstName,
        lastName,
        phone,
      },
    });

    if (role === Role.PATIENT) {
      await prisma.patientProfile.create({
        data: {
          userId: user.id,
          dob: new Date(dob),
          gender,
          address,
          bloodGroup,
          emergencyContact,
        },
      });
    } else if (role === Role.DOCTOR) {
      await prisma.doctorProfile.create({
        data: {
          userId: user.id,
          specialization,
          qualifications,
          experienceYears: parseInt(experienceYears),
        },
      });
    } else if (role === Role.PHARMACIST) {
      // NOTE: Schema uses DoctorProfile for pharmacist relationship (Pharmacy.pharmacist -> DoctorProfile)
      // 1) Create a DoctorProfile entry for the pharmacist
      const pharmacistProfile = await prisma.doctorProfile.create({
        data: {
          userId: user.id,
          specialization: specialization || 'Pharmacist',
          qualifications: qualifications || 'Pharmacy',
          experienceYears: parseInt(experienceYears || '0'),
        },
      });

      // 2) Auto-create a Pharmacy and assign to this pharmacist to avoid unassigned errors
      const pharmacyName = `${firstName ?? 'New'} ${lastName ?? 'Pharmacist'} Pharmacy`;
      await prisma.pharmacy.create({
        data: {
          name: pharmacyName,
          address: address || 'N/A',
          latitude: 0,
          longitude: 0,
          pharmacistId: pharmacistProfile.id,
        },
      });
    }

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error registering user' });
  }
};

// Login user
export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, role: user.role });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error logging in' });
  }
};

// Get current user data (protected)
export const getMe = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const user = await prisma.user.findUnique({
      // @ts-ignore
      where: { id: req.userId },
      select: { id: true, email: true, role: true, firstName: true, lastName: true, phone: true },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching user data' });
  }
};
