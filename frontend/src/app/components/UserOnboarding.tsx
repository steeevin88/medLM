"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

// Enum definitions
export enum Allergies {
  NONE = "None",
  PENICILLIN = "Penicillin",
  PEANUTS = "Peanuts",
  SHELLFISH = "Shellfish",
  DAIRY = "Dairy",
  EGGS = "Eggs",
  SOY = "Soy",
  WHEAT = "Wheat",
  TREE_NUTS = "Tree Nuts",
  FISH = "Fish",
  LATEX = "Latex",
  INSECT_STINGS = "Insect Stings",
  POLLEN = "Pollen",
  DUST = "Dust Mites",
  MOLD = "Mold"
}

export enum Medication {
  NONE = "None",
  ACETAMINOPHEN = "Acetaminophen (Tylenol)",
  IBUPROFEN = "Ibuprofen (Advil, Motrin)",
  ASPIRIN = "Aspirin",
  LISINOPRIL = "Lisinopril",
  ATORVASTATIN = "Atorvastatin (Lipitor)",
  LEVOTHYROXINE = "Levothyroxine (Synthroid)",
  METFORMIN = "Metformin",
  AMLODIPINE = "Amlodipine",
  METOPROLOL = "Metoprolol",
  OMEPRAZOLE = "Omeprazole (Prilosec)",
  SIMVASTATIN = "Simvastatin (Zocor)",
  LOSARTAN = "Losartan",
  ALBUTEROL = "Albuterol"
}

export enum Diet {
  REGULAR = "Regular",
  VEGETARIAN = "Vegetarian",
  VEGAN = "Vegan",
  PESCATARIAN = "Pescatarian",
  GLUTEN_FREE = "Gluten-Free",
  KETO = "Keto",
  PALEO = "Paleo",
  MEDITERRANEAN = "Mediterranean",
  DASH = "DASH",
  LOW_CARB = "Low-Carb",
  LOW_FAT = "Low-Fat",
  INTERMITTENT_FASTING = "Intermittent Fasting"
}

export enum ActivityLevel {
  SEDENTARY = "Sedentary (little to no exercise)",
  LIGHT = "Light (exercise 1-3 times/week)",
  MODERATE = "Moderate (exercise 3-5 times/week)",
  ACTIVE = "Active (exercise 6-7 times/week)",
  VERY_ACTIVE = "Very Active (exercise multiple times/day)"
}

// Type for the user health profile
export type HealthProfile = {
  sex: boolean; // true for male, false for female
  age: number;
  height: number; // in cm
  weight: number; // in kg
  allergies: Allergies[];
  currentMedications: Medication[];
  medicalHistory: string[];
  diet: Diet;
  activityLevel: ActivityLevel;
  additionalInfo: string;
  
  // Optional sync data
  heartRate?: number;
  steps?: number;
}

export default function UserOnboarding() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<HealthProfile>({
    sex: true,
    age: 30,
    height: 170,
    weight: 70,
    allergies: [],
    currentMedications: [],
    medicalHistory: [],
    diet: Diet.REGULAR,
    activityLevel: ActivityLevel.MODERATE,
    additionalInfo: '',
  });
  
  // For multi-select inputs
  const [newMedicalHistoryItem, setNewMedicalHistoryItem] = useState('');
  
  // Track which step has been completed
  const [completedSteps, setCompletedSteps] = useState<{[key: number]: boolean}>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: parseFloat(value)
    });
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>, enumType: 'allergies' | 'medications') => {
    const { value, checked } = e.target;
    
    if (enumType === 'allergies') {
      if (checked) {
        setFormData({
          ...formData,
          allergies: [...formData.allergies, value as Allergies]
        });
      } else {
        setFormData({
          ...formData,
          allergies: formData.allergies.filter(item => item !== value)
        });
      }
    } else if (enumType === 'medications') {
      if (checked) {
        setFormData({
          ...formData,
          currentMedications: [...formData.currentMedications, value as Medication]
        });
      } else {
        setFormData({
          ...formData,
          currentMedications: formData.currentMedications.filter(item => item !== value)
        });
      }
    }
  };

  const handleSexChange = (value: boolean) => {
    setFormData({
      ...formData,
      sex: value
    });
  };

  const handleAddMedicalHistory = () => {
    if (newMedicalHistoryItem.trim()) {
      setFormData({
        ...formData,
        medicalHistory: [...formData.medicalHistory, newMedicalHistoryItem.trim()]
      });
      setNewMedicalHistoryItem('');
    }
  };

  const handleRemoveMedicalHistory = (index: number) => {
    const updatedHistory = [...formData.medicalHistory];
    updatedHistory.splice(index, 1);
    setFormData({
      ...formData,
      medicalHistory: updatedHistory
    });
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'diet') {
      setFormData({
        ...formData,
        diet: value as Diet
      });
    } else if (name === 'activityLevel') {
      setFormData({
        ...formData,
        activityLevel: value as ActivityLevel
      });
    }
  };

  const nextStep = () => {
    setCompletedSteps({...completedSteps, [step]: true});
    setStep(step + 1);
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  const submitForm = () => {
    setCompletedSteps({...completedSteps, [step]: true});
    
    // In a real application, this would be sent to an API
    // For now, just store in localStorage
    localStorage.setItem('userHealthProfile', JSON.stringify(formData));
    
    // Mock storing in memory
    console.log('User health profile stored:', formData);
    
    // Redirect to dashboard
    router.push('/patient');
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-6">Basic Information</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Sex</label>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => handleSexChange(true)}
              className={`px-4 py-2 rounded-md ${formData.sex ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'}`}
            >
              Male
            </button>
            <button
              type="button"
              onClick={() => handleSexChange(false)}
              className={`px-4 py-2 rounded-md ${!formData.sex ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'}`}
            >
              Female
            </button>
          </div>
        </div>
        
        <div>
          <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">Age</label>
          <input
            type="number"
            id="age"
            name="age"
            min="1"
            max="120"
            value={formData.age}
            onChange={handleNumberChange}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        
        <div>
          <label htmlFor="height" className="block text-sm font-medium text-gray-700 mb-1">Height (cm)</label>
          <input
            type="number"
            id="height"
            name="height"
            min="50"
            max="250"
            step="0.1"
            value={formData.height}
            onChange={handleNumberChange}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        
        <div>
          <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
          <input
            type="number"
            id="weight"
            name="weight"
            min="20"
            max="300"
            step="0.1"
            value={formData.weight}
            onChange={handleNumberChange}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-6">Allergies</h2>
      <p className="text-sm text-gray-600 mb-4">Please select all allergies that apply:</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {Object.values(Allergies).map((allergy) => (
          <div key={allergy} className="flex items-center">
            <input
              type="checkbox"
              id={`allergy-${allergy}`}
              value={allergy}
              checked={formData.allergies.includes(allergy)}
              onChange={(e) => handleCheckboxChange(e, 'allergies')}
              className="h-4 w-4 text-blue-600 rounded"
            />
            <label htmlFor={`allergy-${allergy}`} className="ml-2 text-sm text-gray-700">
              {allergy}
            </label>
          </div>
        ))}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-6">Current Medications</h2>
      <p className="text-sm text-gray-600 mb-4">Please select all medications you are currently taking:</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {Object.values(Medication).map((medication) => (
          <div key={medication} className="flex items-center">
            <input
              type="checkbox"
              id={`medication-${medication}`}
              value={medication}
              checked={formData.currentMedications.includes(medication)}
              onChange={(e) => handleCheckboxChange(e, 'medications')}
              className="h-4 w-4 text-blue-600 rounded"
            />
            <label htmlFor={`medication-${medication}`} className="ml-2 text-sm text-gray-700">
              {medication}
            </label>
          </div>
        ))}
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-6">Medical History</h2>
      <p className="text-sm text-gray-600 mb-4">Please add any significant medical procedures or conditions:</p>
      
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={newMedicalHistoryItem}
          onChange={(e) => setNewMedicalHistoryItem(e.target.value)}
          placeholder="E.g., Appendectomy 2018"
          className="flex-1 p-2 border border-gray-300 rounded-md"
        />
        <button
          type="button"
          onClick={handleAddMedicalHistory}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Add
        </button>
      </div>
      
      <div className="space-y-2">
        {formData.medicalHistory.length === 0 ? (
          <p className="text-gray-500 text-sm">No medical history items added yet.</p>
        ) : (
          formData.medicalHistory.map((item, index) => (
            <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded-md">
              <span>{item}</span>
              <button
                type="button"
                onClick={() => handleRemoveMedicalHistory(index)}
                className="text-red-500 hover:text-red-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-6">Lifestyle</h2>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="diet" className="block text-sm font-medium text-gray-700 mb-1">Diet</label>
          <select
            id="diet"
            name="diet"
            value={formData.diet}
            onChange={handleSelectChange}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            {Object.values(Diet).map((diet) => (
              <option key={diet} value={diet}>{diet}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label htmlFor="activityLevel" className="block text-sm font-medium text-gray-700 mb-1">Physical Activity Level</label>
          <select
            id="activityLevel"
            name="activityLevel"
            value={formData.activityLevel}
            onChange={handleSelectChange}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            {Object.values(ActivityLevel).map((level) => (
              <option key={level} value={level}>{level}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );

  const renderStep6 = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-6">Additional Information</h2>
      
      <div>
        <label htmlFor="additionalInfo" className="block text-sm font-medium text-gray-700 mb-1">
          Is there anything else you would like your healthcare providers to know?
        </label>
        <textarea
          id="additionalInfo"
          name="additionalInfo"
          value={formData.additionalInfo}
          onChange={handleInputChange}
          rows={5}
          className="w-full p-2 border border-gray-300 rounded-md"
          placeholder="Include any other relevant health information..."
        ></textarea>
      </div>
    </div>
  );

  const renderStep7 = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-6">Review and Submit</h2>
      
      <div className="space-y-6 bg-gray-50 p-6 rounded-lg">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="font-medium text-gray-700">Sex</h3>
            <p>{formData.sex ? 'Male' : 'Female'}</p>
          </div>
          <div>
            <h3 className="font-medium text-gray-700">Age</h3>
            <p>{formData.age} years</p>
          </div>
          <div>
            <h3 className="font-medium text-gray-700">Height</h3>
            <p>{formData.height} cm</p>
          </div>
          <div>
            <h3 className="font-medium text-gray-700">Weight</h3>
            <p>{formData.weight} kg</p>
          </div>
        </div>
        
        <div>
          <h3 className="font-medium text-gray-700">Allergies</h3>
          {formData.allergies.length === 0 ? (
            <p className="text-gray-500">None</p>
          ) : (
            <ul className="list-disc list-inside">
              {formData.allergies.map((allergy, index) => (
                <li key={index}>{allergy}</li>
              ))}
            </ul>
          )}
        </div>
        
        <div>
          <h3 className="font-medium text-gray-700">Current Medications</h3>
          {formData.currentMedications.length === 0 ? (
            <p className="text-gray-500">None</p>
          ) : (
            <ul className="list-disc list-inside">
              {formData.currentMedications.map((medication, index) => (
                <li key={index}>{medication}</li>
              ))}
            </ul>
          )}
        </div>
        
        <div>
          <h3 className="font-medium text-gray-700">Medical History</h3>
          {formData.medicalHistory.length === 0 ? (
            <p className="text-gray-500">None</p>
          ) : (
            <ul className="list-disc list-inside">
              {formData.medicalHistory.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          )}
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="font-medium text-gray-700">Diet</h3>
            <p>{formData.diet}</p>
          </div>
          <div>
            <h3 className="font-medium text-gray-700">Activity Level</h3>
            <p>{formData.activityLevel}</p>
          </div>
        </div>
        
        {formData.additionalInfo && (
          <div>
            <h3 className="font-medium text-gray-700">Additional Information</h3>
            <p className="whitespace-pre-line">{formData.additionalInfo}</p>
          </div>
        )}
      </div>
      
      <div className="bg-blue-50 border border-blue-200 p-4 rounded-md">
        <p className="text-sm text-blue-800">
          By submitting this form, you confirm that the information provided is accurate and can be shared with your healthcare providers.
        </p>
      </div>
    </div>
  );

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      case 4:
        return renderStep4();
      case 5:
        return renderStep5();
      case 6:
        return renderStep6();
      case 7:
        return renderStep7();
      default:
        return renderStep1();
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold text-center mb-8">Health Profile Setup</h1>
      
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex justify-between">
          {[1, 2, 3, 4, 5, 6, 7].map((stepNumber) => (
            <div 
              key={stepNumber} 
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                stepNumber === step 
                  ? 'bg-blue-600 text-white' 
                  : completedSteps[stepNumber] 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-200 text-gray-700'
              }`}
            >
              {completedSteps[stepNumber] ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                stepNumber
              )}
            </div>
          ))}
        </div>
        <div className="hidden sm:flex justify-between mt-2">
          {['Basic', 'Allergies', 'Medications', 'History', 'Lifestyle', 'Additional', 'Review'].map((label, i) => (
            <div key={i} className="text-xs font-medium text-gray-600" style={{width: '14.28%', textAlign: 'center'}}>
              {label}
            </div>
          ))}
        </div>
      </div>
      
      {/* Form Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-6">
        <form onSubmit={(e) => e.preventDefault()}>
          {renderStepContent()}
          
          <div className="mt-8 flex justify-between">
            {step > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Back
              </button>
            )}
            {step < 7 ? (
              <button
                type="button"
                onClick={nextStep}
                className="ml-auto px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Next
              </button>
            ) : (
              <button
                type="button"
                onClick={submitForm}
                className="ml-auto px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Submit
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
} 