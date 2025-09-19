import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret'; // Use environment variable for secret
// Hardcoded admin email (can be overridden via env for flexibility)
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@telmed.com';

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
    // Prevent registering as ADMIN via signup
    if (role === Role.ADMIN) {
      return res.status(400).json({ error: 'Registration as ADMIN is not allowed' });
    }

    // Determine safe role (default to PATIENT if not provided/invalid)
    const allowedRoles = [Role.PATIENT, Role.DOCTOR, Role.PHARMACIST] as const;
    const safeRole: Role = allowedRoles.includes(role) ? role : Role.PATIENT;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: safeRole,
        firstName,
        lastName,
        phone,
      },
    });

    if (safeRole === Role.PATIENT) {
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
    } else if (safeRole === Role.DOCTOR) {
      await prisma.doctorProfile.create({
        data: {
          userId: user.id,
          specialization,
          qualifications,
          experienceYears: parseInt(experienceYears),
        },
      });
    } else if (safeRole === Role.PHARMACIST) {
      // Create PharmacistProfile and link a default Pharmacy to it
      const pharmacistProfile = await prisma.pharmacistProfile.create({
        data: {
          userId: user.id,
        },
      });

      // Auto-create a Pharmacy and assign to this pharmacist to avoid unassigned errors
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

    // If login email matches the hardcoded admin email, force ADMIN role
    const effectiveRole = email === ADMIN_EMAIL ? Role.ADMIN : user.role;

    const token = jwt.sign({ userId: user.id, role: effectiveRole }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, role: effectiveRole });
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

    // Ensure admin email reflects ADMIN role in /me response
    const responseUser = user.email === ADMIN_EMAIL ? { ...user, role: Role.ADMIN } : user;
    res.json(responseUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching user data' });
  }
};
