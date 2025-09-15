import React, { useState, useEffect } from 'react';

interface Medicine {
  id: string;
  name: string;
  category: string;
  manufacturer: string;
  batchNumber: string;
  expiryDate: string;
  quantity: number;
  minStockLevel: number;
  price: number;
  mrp: number;
  description: string;
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'expired';
}

interface FormErrors {
  [key: string]: string;
}

interface InputFieldProps {
  label: string;
  name: string;
  type: string;
  placeholder?: string;
  required?: boolean;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  error?: string;
  options?: { value: string; label: string }[];
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  name,
  type,
  placeholder,
  required = false,
  value,
  onChange,
  error,
  options,
}) => {
  const inputClasses = `mt-1 block w-full px-3 py-2 border ${
    error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
  } rounded-md shadow-sm focus:outline-none focus:ring-1 sm:text-sm transition-colors`;

  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {type === 'select' ? (
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          className={inputClasses}
          required={required}
        >
          {options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : type === 'textarea' ? (
        <textarea
          id={name}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={inputClasses}
          required={required}
          rows={3}
        />
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={inputClasses}
          required={required}
        />
      )}
      {error && (
        <p className="mt-1 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

const InventoryManagement: React.FC = () => {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [filteredMedicines, setFilteredMedicines] = useState<Medicine[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    manufacturer: '',
    batchNumber: '',
    expiryDate: '',
    quantity: '',
    minStockLevel: '',
    price: '',
    mrp: '',
    description: '',
  });

  const categories = [
    'Antibiotics',
    'Pain Relief',
    'Vitamins & Supplements',
    'Cardiovascular',
    'Diabetes',
    'Respiratory',
    'Digestive',
    'Skin Care',
    'Eye Care',
    'Other',
  ];

  useEffect(() => {
    // Simulate fetching medicines data
    const mockMedicines: Medicine[] = [
      {
        id: 'MED001',
        name: 'Paracetamol 500mg',
        category: 'Pain Relief',
        manufacturer: 'ABC Pharma',
        batchNumber: 'PAR2024001',
        expiryDate: '2025-12-31',
        quantity: 150,
        minStockLevel: 50,
        price: 2.5,
        mrp: 3.0,
        description: 'Pain relief and fever reducer',
        status: 'in_stock',
      },
      {
        id: 'MED002',
        name: 'Amoxicillin 250mg',
        category: 'Antibiotics',
        manufacturer: 'XYZ Labs',
        batchNumber: 'AMX2024002',
        expiryDate: '2025-06-30',
        quantity: 25,
        minStockLevel: 30,
        price: 8.0,
        mrp: 10.0,
        description: 'Antibiotic for bacterial infections',
        status: 'low_stock',
      },
      {
        id: 'MED003',
        name: 'Vitamin D3 1000IU',
        category: 'Vitamins & Supplements',
        manufacturer: 'Health Plus',
        batchNumber: 'VIT2024003',
        expiryDate: '2026-03-15',
        quantity: 0,
        minStockLevel: 20,
        price: 15.0,
        mrp: 18.0,
        description: 'Vitamin D supplement',
        status: 'out_of_stock',
      },
      {
        id: 'MED004',
        name: 'Aspirin 75mg',
        category: 'Cardiovascular',
        manufacturer: 'CardioMed',
        batchNumber: 'ASP2023001',
        expiryDate: '2024-01-15',
        quantity: 80,
        minStockLevel: 25,
        price: 1.5,
        mrp: 2.0,
        description: 'Low-dose aspirin for heart health',
        status: 'expired',
      },
    ];
    setMedicines(mockMedicines);
    setFilteredMedicines(mockMedicines);
  }, []);

  useEffect(() => {
    let filtered = medicines;

    if (searchTerm) {
      filtered = filtered.filter(
        (medicine) =>
          medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          medicine.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
          medicine.batchNumber.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterCategory !== 'all') {
      filtered = filtered.filter((medicine) => medicine.category === filterCategory);
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter((medicine) => medicine.status === filterStatus);
    }

    setFilteredMedicines(filtered);
  }, [medicines, searchTerm, filterCategory, filterStatus]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_stock': return 'bg-green-100 text-green-800';
      case 'low_stock': return 'bg-yellow-100 text-yellow-800';
      case 'out_of_stock': return 'bg-red-100 text-red-800';
      case 'expired': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'in_stock': return '✅';
      case 'low_stock': return '⚠️';
      case 'out_of_stock': return '❌';
      case 'expired': return '⏰';
      default: return '❓';
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Medicine name is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.manufacturer.trim()) newErrors.manufacturer = 'Manufacturer is required';
    if (!formData.batchNumber.trim()) newErrors.batchNumber = 'Batch number is required';
    if (!formData.expiryDate) newErrors.expiryDate = 'Expiry date is required';
    if (!formData.quantity || parseInt(formData.quantity) < 0) newErrors.quantity = 'Valid quantity is required';
    if (!formData.minStockLevel || parseInt(formData.minStockLevel) < 0) newErrors.minStockLevel = 'Valid minimum stock level is required';
    if (!formData.price || parseFloat(formData.price) <= 0) newErrors.price = 'Valid price is required';
    if (!formData.mrp || parseFloat(formData.mrp) <= 0) newErrors.mrp = 'Valid MRP is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const determineStatus = (quantity: number, minStockLevel: number, expiryDate: string): Medicine['status'] => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    
    if (expiry < today) return 'expired';
    if (quantity === 0) return 'out_of_stock';
    if (quantity <= minStockLevel) return 'low_stock';
    return 'in_stock';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const quantity = parseInt(formData.quantity);
    const minStockLevel = parseInt(formData.minStockLevel);
    const status = determineStatus(quantity, minStockLevel, formData.expiryDate);

    const medicineData: Medicine = {
      id: editingMedicine ? editingMedicine.id : `MED${Date.now()}`,
      name: formData.name,
      category: formData.category,
      manufacturer: formData.manufacturer,
      batchNumber: formData.batchNumber,
      expiryDate: formData.expiryDate,
      quantity,
      minStockLevel,
      price: parseFloat(formData.price),
      mrp: parseFloat(formData.mrp),
      description: formData.description,
      status,
    };

    if (editingMedicine) {
      setMedicines(medicines.map(med => med.id === editingMedicine.id ? medicineData : med));
    } else {
      setMedicines([...medicines, medicineData]);
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      manufacturer: '',
      batchNumber: '',
      expiryDate: '',
      quantity: '',
      minStockLevel: '',
      price: '',
      mrp: '',
      description: '',
    });
    setErrors({});
    setShowAddForm(false);
    setEditingMedicine(null);
  };

  const handleEdit = (medicine: Medicine) => {
    setFormData({
      name: medicine.name,
      category: medicine.category,
      manufacturer: medicine.manufacturer,
      batchNumber: medicine.batchNumber,
      expiryDate: medicine.expiryDate,
      quantity: medicine.quantity.toString(),
      minStockLevel: medicine.minStockLevel.toString(),
      price: medicine.price.toString(),
      mrp: medicine.mrp.toString(),
      description: medicine.description,
    });
    setEditingMedicine(medicine);
    setShowAddForm(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this medicine?')) {
      setMedicines(medicines.filter(med => med.id !== id));
    }
  };

  const handleUpdateStock = (id: string, newQuantity: number) => {
    setMedicines(medicines.map(med => {
      if (med.id === id) {
        const status = determineStatus(newQuantity, med.minStockLevel, med.expiryDate);
        return { ...med, quantity: newQuantity, status };
      }
      return med;
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Inventory Management</h2>
          <p className="text-gray-600">Manage your pharmacy's medicine stock</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
        >
          <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Medicine
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              placeholder="Search medicines..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">All Status</option>
              <option value="in_stock">In Stock</option>
              <option value="low_stock">Low Stock</option>
              <option value="out_of_stock">Out of Stock</option>
              <option value="expired">Expired</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterCategory('all');
                setFilterStatus('all');
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Add/Edit Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                {editingMedicine ? 'Edit Medicine' : 'Add New Medicine'}
              </h3>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  label="Medicine Name"
                  name="name"
                  type="text"
                  placeholder="Enter medicine name"
                  required
                  value={formData.name}
                  onChange={handleFormChange}
                  error={errors.name}
                />
                <InputField
                  label="Category"
                  name="category"
                  type="select"
                  required
                  value={formData.category}
                  onChange={handleFormChange}
                  error={errors.category}
                  options={[
                    { value: '', label: 'Select Category' },
                    ...categories.map(cat => ({ value: cat, label: cat }))
                  ]}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  label="Manufacturer"
                  name="manufacturer"
                  type="text"
                  placeholder="Enter manufacturer name"
                  required
                  value={formData.manufacturer}
                  onChange={handleFormChange}
                  error={errors.manufacturer}
                />
                <InputField
                  label="Batch Number"
                  name="batchNumber"
                  type="text"
                  placeholder="Enter batch number"
                  required
                  value={formData.batchNumber}
                  onChange={handleFormChange}
                  error={errors.batchNumber}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  label="Expiry Date"
                  name="expiryDate"
                  type="date"
                  required
                  value={formData.expiryDate}
                  onChange={handleFormChange}
                  error={errors.expiryDate}
                />
                <InputField
                  label="Quantity"
                  name="quantity"
                  type="number"
                  placeholder="Enter quantity"
                  required
                  value={formData.quantity}
                  onChange={handleFormChange}
                  error={errors.quantity}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <InputField
                  label="Minimum Stock Level"
                  name="minStockLevel"
                  type="number"
                  placeholder="Enter minimum stock"
                  required
                  value={formData.minStockLevel}
                  onChange={handleFormChange}
                  error={errors.minStockLevel}
                />
                <InputField
                  label="Price (₹)"
                  name="price"
                  type="number"
                  placeholder="Enter price"
                  required
                  value={formData.price}
                  onChange={handleFormChange}
                  error={errors.price}
                />
                <InputField
                  label="MRP (₹)"
                  name="mrp"
                  type="number"
                  placeholder="Enter MRP"
                  required
                  value={formData.mrp}
                  onChange={handleFormChange}
                  error={errors.mrp}
                />
              </div>
              <InputField
                label="Description"
                name="description"
                type="textarea"
                placeholder="Enter medicine description"
                value={formData.description}
                onChange={handleFormChange}
                error={errors.description}
              />
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                >
                  {editingMedicine ? 'Update Medicine' : 'Add Medicine'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Medicines Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Medicines ({filteredMedicines.length})
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medicine</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Batch</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expiry</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMedicines.map((medicine) => (
                <tr key={medicine.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{medicine.name}</div>
                      <div className="text-sm text-gray-500">{medicine.manufacturer}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{medicine.category}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{medicine.batchNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{medicine.expiryDate}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{medicine.quantity} units</div>
                    <div className="text-xs text-gray-500">Min: {medicine.minStockLevel}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">₹{medicine.price}</div>
                    <div className="text-xs text-gray-500">MRP: ₹{medicine.mrp}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(medicine.status)}`}>
                      <span className="mr-1">{getStatusIcon(medicine.status)}</span>
                      {medicine.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleEdit(medicine)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        const newQuantity = prompt('Enter new quantity:', medicine.quantity.toString());
                        if (newQuantity && !isNaN(parseInt(newQuantity))) {
                          handleUpdateStock(medicine.id, parseInt(newQuantity));
                        }
                      }}
                      className="text-green-600 hover:text-green-900"
                    >
                      Update Stock
                    </button>
                    <button
                      onClick={() => handleDelete(medicine.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredMedicines.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No medicines found matching your criteria.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InventoryManagement;
