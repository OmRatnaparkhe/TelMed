import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { register, login, getMe } from "./auth/auth.controller.js";
import { authenticateToken, authorizeRoles } from "./auth/auth.middleware.js";
import { getMyAppointments, createAppointment, getPendingAppointments, approveAppointment, rejectAppointment, completeAppointment, getTodaysConfirmedAppointmentsForDoctor, getAppointmentHistoryForDoctor, getAppointmentByIdForDoctor } from "./appointments/appointments.controller.js";
import { getAvailableDoctors, updateMyAvailabilityStatus, getMyDoctorProfile } from "./doctors/doctors.controller.js";
import { getMyMedicalRecords, createMedicalRecord } from "./medicalRecords/medicalRecords.controller.js";
import { checkSymptoms } from "./symptoms/symptoms.controller.js";
import { createBatch, getInventory, getLowStockAlerts, getPharmacies, getPharmacyStock, searchMedicineStock, updateStockStatus, getAllMedicines } from "./pharmacy/pharmacy.controller.js"; // Import pharmacy controllers
import { listPrescriptions, updatePrescriptionStatus } from "./pharmacy/prescriptions.controller.js";
import { getAllPharmacists, getAllUsers, getAllDoctors, getAppointmentsSummary, getOverview } from "./admin/admin.controller.js";

dotenv.config();

const app = express();

app.use(express.json());

app.use(
  cors({
    origin: ["http://localhost:5173","http://localhost:5174"],
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
app.get("/api/doctors/me", authenticateToken, getMyDoctorProfile);
app.get("/api/medical-records/me", authenticateToken, getMyMedicalRecords);
app.post("/api/symptoms/check", authenticateToken, checkSymptoms);

// Protected Doctor Routes
app.get("/api/appointments/pending", authenticateToken, getPendingAppointments);
app.get("/api/appointments/today-confirmed", authenticateToken, getTodaysConfirmedAppointmentsForDoctor);
app.get("/api/appointments/history", authenticateToken, getAppointmentHistoryForDoctor);
app.put("/api/appointments/:id/approve", authenticateToken, approveAppointment);
app.put("/api/appointments/:id/reject", authenticateToken, rejectAppointment);
app.put("/api/appointments/:id/complete", authenticateToken, completeAppointment);
// Keep the generic route LAST to avoid shadowing specific routes above
app.get("/api/appointments/:id", authenticateToken, getAppointmentByIdForDoctor);
app.put("/api/doctors/me/status", authenticateToken, updateMyAvailabilityStatus);
app.post("/api/medical-records", authenticateToken, createMedicalRecord);

// Public Pharmacy Routes (for map, no auth needed to view)
app.get("/api/pharmacies", getPharmacies);
app.get("/api/pharmacies/search", searchMedicineStock); // Public medicine search
app.get("/api/medicines", getAllMedicines); // New: Get all medicines

// Protected Pharmacist Routes
app.get("/api/pharmacy/stock", authenticateToken, getPharmacyStock); // Can be filtered by medicineName
app.put("/api/pharmacy/stock/:stockId", authenticateToken, updateStockStatus);
app.get("/api/pharmacy/inventory", authenticateToken, getInventory);
app.post("/api/pharmacy/batches", authenticateToken, createBatch);
app.get("/api/pharmacy/alerts/low-stock", authenticateToken, getLowStockAlerts);

// Prescriptions for pharmacist
app.get("/api/pharmacy/prescriptions", authenticateToken, listPrescriptions);
app.patch("/api/pharmacy/prescriptions/:id/status", authenticateToken, updatePrescriptionStatus);

// Admin Routes
app.get("/api/admin/overview", authenticateToken, authorizeRoles('ADMIN'), getOverview);
app.get("/api/admin/users", authenticateToken, authorizeRoles('ADMIN'), getAllUsers);
app.get("/api/admin/doctors", authenticateToken, authorizeRoles('ADMIN'), getAllDoctors);
app.get("/api/admin/pharmacists", authenticateToken, authorizeRoles('ADMIN'), getAllPharmacists);
app.get("/api/admin/appointments/summary", authenticateToken, authorizeRoles('ADMIN'), getAppointmentsSummary);

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening on port ${PORT}`);
});

