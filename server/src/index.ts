import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { register, login, getMe } from "./auth/auth.controller.js";
import { authenticateToken } from "./auth/auth.middleware.js";
import { getMyAppointments, createAppointment, getPendingAppointments, approveAppointment, rejectAppointment, completeAppointment, getTodaysConfirmedAppointmentsForDoctor } from "./appointments/appointments.controller.js";
import { getAvailableDoctors, updateMyAvailabilityStatus } from "./doctors/doctors.controller.js";
import { getMyMedicalRecords, createMedicalRecord } from "./medicalRecords/medicalRecords.controller.js";
import { checkSymptoms } from "./symptoms/symptoms.controller.js";
import { getPharmacies, getPharmacyStock, updateStockStatus } from "./pharmacy/pharmacy.controller.js"; // Import pharmacy controllers

dotenv.config();

const app = express();

app.use(express.json());

app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept"
    ]
  })
);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Auth routes
app.post("/api/auth/register", register);
app.post("/api/auth/login", login);
app.get("/api/auth/me", authenticateToken, getMe);

// Protected Patient Routes
app.get("/api/appointments/my-appointments", authenticateToken, getMyAppointments);
app.post("/api/appointments", authenticateToken, createAppointment);
app.get("/api/doctors", authenticateToken, getAvailableDoctors);
app.get("/api/medical-records/me", authenticateToken, getMyMedicalRecords);
app.post("/api/symptoms/check", authenticateToken, checkSymptoms);

// Protected Doctor Routes
app.get("/api/appointments/pending", authenticateToken, getPendingAppointments);
app.get("/api/appointments/today-confirmed", authenticateToken, getTodaysConfirmedAppointmentsForDoctor);
app.put("/api/appointments/:id/approve", authenticateToken, approveAppointment);
app.put("/api/appointments/:id/reject", authenticateToken, rejectAppointment);
app.put("/api/appointments/:id/complete", authenticateToken, completeAppointment);
app.put("/api/doctors/me/status", authenticateToken, updateMyAvailabilityStatus);
app.post("/api/medical-records", authenticateToken, createMedicalRecord);

// Public Pharmacy Routes (for map, no auth needed to view)
app.get("/api/pharmacies", getPharmacies);

// Protected Pharmacist Routes
app.get("/api/pharmacy/stock", authenticateToken, getPharmacyStock); // Can be filtered by medicineName
app.put("/api/pharmacy/stock/:stockId", authenticateToken, updateStockStatus);

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening on port ${PORT}`);
});

