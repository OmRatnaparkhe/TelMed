import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';


interface AppointmentDetails {
  id: string;
  patient: { id: string; user: { firstName: string; lastName: string; email: string; phone: string } };
  symptoms: string;
  appointmentTime: string;
}

interface Pharmacy {
  id: string;
  name: string;
  address: string;
}

interface DosageInstructionInput {
  dosage: string;
  frequency: string;
  duration: string;
}

interface PrescriptionItemInput {
  medicineName: string; // Changed from medicineId
  quantity: number;
  instructions?: string;
  dosageInstructions: DosageInstructionInput[];
}

const ConsultationPage: React.FC = () => {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState<AppointmentDetails | null>(null);
  const [diagnosis, setDiagnosis] = useState('');
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [selectedPharmacyId, setSelectedPharmacyId] = useState<string | undefined>(undefined);
  const [prescriptionItems, setPrescriptionItems] = useState<PrescriptionItemInput[]>([
    { medicineName: '', quantity: 1, dosageInstructions: [{ dosage: '', frequency: '', duration: '' }] }
  ]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      if (!appointmentId) {
        setError('Appointment ID is missing.');
        setLoading(false);
        return;
      }
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const [appointmentRes, pharmaciesRes] = await Promise.all([
          api.get(`/api/appointments/${appointmentId}`),
          api.get('/api/pharmacies'),
        ]);

        setAppointment(appointmentRes.data);
        setPharmacies(pharmaciesRes.data);
        if (pharmaciesRes.data.length > 0) {
          setSelectedPharmacyId(pharmaciesRes.data[0].id); // Select first pharmacy by default
        }

      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to fetch initial data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, [appointmentId, navigate]);

  const handleAddItem = () => {
    setPrescriptionItems([...prescriptionItems, { medicineName: '', quantity: 1, dosageInstructions: [{ dosage: '', frequency: '', duration: '' }] }]);
  };

  const handleRemoveItem = (index: number) => {
    const newItems = [...prescriptionItems];
    newItems.splice(index, 1);
    setPrescriptionItems(newItems);
  };

  const handleItemChange = (index: number, field: keyof PrescriptionItemInput, value: any) => {
    const newItems = [...prescriptionItems];
    // Handle nested dosageInstructions
    if (field === 'dosageInstructions') {
      newItems[index][field] = value; // value is already an array of DosageInstructionInput
    } else {
      (newItems[index] as any)[field] = value;
    }
    setPrescriptionItems(newItems);
  };

  const handleDosageChange = (itemIndex: number, dosageIndex: number, field: keyof DosageInstructionInput, value: string) => {
    const newItems = [...prescriptionItems];
    const newDosageInstructions = [...newItems[itemIndex].dosageInstructions];
    (newDosageInstructions[dosageIndex] as any)[field] = value;
    newItems[itemIndex].dosageInstructions = newDosageInstructions;
    setPrescriptionItems(newItems);
  };

  const handleAddDosageInstruction = (itemIndex: number) => {
    const newItems = [...prescriptionItems];
    newItems[itemIndex].dosageInstructions.push({ dosage: '', frequency: '', duration: '' });
    setPrescriptionItems(newItems);
  };

  const handleRemoveDosageInstruction = (itemIndex: number, dosageIndex: number) => {
    const newItems = [...prescriptionItems];
    newItems[itemIndex].dosageInstructions.splice(dosageIndex, 1);
    setPrescriptionItems(newItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    if (!appointment || !diagnosis.trim()) {
      setError('Diagnosis is required.');
      setSubmitting(false);
      return;
    }

    // Validate prescription items
    const isValidPrescription = prescriptionItems.every(item => 
      item.medicineName.trim() && item.quantity > 0 && 
      item.dosageInstructions.every(di => di.dosage.trim() && di.frequency.trim() && di.duration.trim())
    );

    if (prescriptionItems.length > 0 && (!isValidPrescription || !selectedPharmacyId)) {
      setError('All prescription items must have a medicine name, quantity, and complete dosage instructions. A pharmacy must also be selected.');
      setSubmitting(false);
      return;
    }

    try {

      const payload: { appointmentId: string; diagnosis: string; prescriptionItems?: PrescriptionItemInput[]; pharmacyId?: string } = {
        appointmentId: appointment.id,
        diagnosis,
      };

      if (prescriptionItems.length > 0 && selectedPharmacyId) {
        payload.prescriptionItems = prescriptionItems;
        payload.pharmacyId = selectedPharmacyId;
      }
      
      // Create medical record and prescription
      await api.post('/api/medical-records', payload);

      // Update appointment status to completed
      await api.put(`/api/appointments/${appointment.id}/complete`);

      alert('Consultation completed and medical record/prescription saved!');
      navigate('/doctor'); // Redirect back to doctor dashboard
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to complete consultation');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center p-4 sm:p-6"><p>Loading consultation details...</p></div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-600 p-4 sm:p-6"><p>{error}</p></div>;
  if (!appointment) return <div className="min-h-screen flex items-center justify-center p-4 sm:p-6"><p>Appointment not found.</p></div>;

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 md:p-8">
      <div className="max-w-3xl mx-auto bg-white p-4 sm:p-6 rounded-lg shadow-md">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-4 sm:mb-6">Consultation for {appointment.patient.user.firstName} {appointment.patient.user.lastName}</h1>

        <div className="mb-4 p-4 bg-blue-50 rounded-md border border-blue-200">
          <h2 className="text-xl font-semibold text-blue-800">Patient Details:</h2>
          <p className="text-gray-700">Email: {appointment.patient.user.email}</p>
          <p className="text-gray-700">Phone: {appointment.patient.user.phone}</p>
          <p className="text-gray-700">Appointment Time: {new Date(appointment.appointmentTime).toLocaleString()}</p>
          <p className="text-gray-700 font-medium mt-2">Symptoms: {appointment.symptoms}</p>
        </div>

        {error && <p className="mt-4 text-sm text-red-600">Error: {error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="diagnosis" className="block text-sm font-medium text-gray-700">Diagnosis:</Label>
            <Textarea
              id="diagnosis"
              name="diagnosis"
              rows={5}
              className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2"
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              required
            ></Textarea>
          </div>

          <div className="border p-3 sm:p-4 rounded-md space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">Prescription Details</h2>

            <div>
              <Label htmlFor="pharmacy" className="block text-sm font-medium text-gray-700 mb-1">Select Pharmacy:</Label>
              <Select onValueChange={(value) => setSelectedPharmacyId(value)} value={selectedPharmacyId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a pharmacy" />
                </SelectTrigger>
                <SelectContent>
                  {pharmacies.map((pharmacy) => (
                    <SelectItem key={pharmacy.id} value={pharmacy.id}>
                      {pharmacy.name} - {pharmacy.address}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {prescriptionItems.map((item, itemIndex) => (
              <div key={itemIndex} className="border p-3 rounded-md bg-gray-50 space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">Prescription Item {itemIndex + 1}</h3>
                  {prescriptionItems.length > 1 && (
                    <Button type="button" variant="destructive" size="sm" onClick={() => handleRemoveItem(itemIndex)}>
                      Remove Item
                    </Button>
                  )}
                </div>

                <div>
                  <Label htmlFor={`medicineName-${itemIndex}`} className="block text-sm font-medium text-gray-700 mb-1">Medicine Name:</Label>
                  <Input
                    id={`medicineName-${itemIndex}`}
                    type="text"
                    value={item.medicineName}
                    onChange={(e) => handleItemChange(itemIndex, 'medicineName', e.target.value)}
                    className="mt-1 block w-full"
                    placeholder="e.g., Paracetamol"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor={`quantity-${itemIndex}`} className="block text-sm font-medium text-gray-700">Quantity:</Label>
                  <Input
                    id={`quantity-${itemIndex}`}
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(itemIndex, 'quantity', parseInt(e.target.value))}
                    className="mt-1 block w-full"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor={`instructions-${itemIndex}`} className="block text-sm font-medium text-gray-700">Instructions (optional):</Label>
                  <Textarea
                    id={`instructions-${itemIndex}`}
                    value={item.instructions}
                    onChange={(e) => handleItemChange(itemIndex, 'instructions', e.target.value)}
                    className="mt-1 block w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="block text-sm font-medium text-gray-700">Dosage Instructions:</Label>
                  {item.dosageInstructions.map((dosage, dosageIndex) => (
                    <div key={dosageIndex} className="flex space-x-2 items-end">
                      <div className="flex-1">
                        <Label htmlFor={`dosage-${itemIndex}-${dosageIndex}`} className="sr-only">Dosage</Label>
                        <Input
                          id={`dosage-${itemIndex}-${dosageIndex}`}
                          placeholder="e.g., 1 tablet"
                          value={dosage.dosage}
                          onChange={(e) => handleDosageChange(itemIndex, dosageIndex, 'dosage', e.target.value)}
                          required
                        />
                      </div>
                      <div className="flex-1">
                        <Label htmlFor={`frequency-${itemIndex}-${dosageIndex}`} className="sr-only">Frequency</Label>
                        <Input
                          id={`frequency-${itemIndex}-${dosageIndex}`}
                          placeholder="e.g., twice daily"
                          value={dosage.frequency}
                          onChange={(e) => handleDosageChange(itemIndex, dosageIndex, 'frequency', e.target.value)}
                          required
                        />
                      </div>
                      <div className="flex-1">
                        <Label htmlFor={`duration-${itemIndex}-${dosageIndex}`} className="sr-only">Duration</Label>
                        <Input
                          id={`duration-${itemIndex}-${dosageIndex}`}
                          placeholder="e.g., for 7 days"
                          value={dosage.duration}
                          onChange={(e) => handleDosageChange(itemIndex, dosageIndex, 'duration', e.target.value)}
                          required
                        />
                      </div>
                      {item.dosageInstructions.length > 1 && (
                        <Button type="button" variant="outline" size="sm" onClick={() => handleRemoveDosageInstruction(itemIndex, dosageIndex)}>
                          Remove
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={() => handleAddDosageInstruction(itemIndex)}>
                    Add Dosage Instruction
                  </Button>
                </div>
              </div>
            ))}
            <Button type="button" onClick={handleAddItem}>
              Add Prescription Item
            </Button>
          </div>

          <Button
            type="submit"
            disabled={submitting}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Completing...' : 'Complete Consultation & Save Record'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ConsultationPage;
