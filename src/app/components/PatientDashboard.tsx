"use client";

import React, { useState } from 'react';
import { doctorsMockData, conditionsMockData } from '../context/MockData';

export default function PatientDashboard() {
  const [selectedCondition, setSelectedCondition] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [symptomInput, setSymptomInput] = useState('');
  const [userSymptoms, setUserSymptoms] = useState<string[]>([
    'Headache', 
    'Dizziness'
  ]);

  // Add privacy control states
  const [sharingPreferences, setSharingPreferences] = useState({
    anonymousMode: true,
    shareMedicalHistory: false,
    shareForResearch: true,
    shareBiologicalSex: false
  });
  const [pendingRequests, setPendingRequests] = useState([
    { id: 1, type: 'biologicalSex', from: 'Dr. Sarah Johnson', requestDate: 'Just now' }
  ]);

  const addSymptom = () => {
    if (symptomInput.trim() && !userSymptoms.includes(symptomInput.trim())) {
      setUserSymptoms([...userSymptoms, symptomInput.trim()]);
      setSymptomInput('');
    }
  };

  const removeSymptom = (symptom: string) => {
    setUserSymptoms(userSymptoms.filter(s => s !== symptom));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSymptom();
    }
  };

  const handleSharingChange = (setting: keyof typeof sharingPreferences) => {
    setSharingPreferences(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const handleApproveRequest = (requestId: number) => {
    setPendingRequests(prev => prev.filter(req => req.id !== requestId));
    // In a real app, you would also update the doctor's permissions on the backend
  };

  const handleDenyRequest = (requestId: number) => {
    setPendingRequests(prev => prev.filter(req => req.id !== requestId));
  };

  const filteredDoctors = doctorsMockData.filter(doctor => 
    doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doctor.specialty.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const matchedConditions = conditionsMockData.filter(condition =>
    condition.symptoms.some(symptom =>
      userSymptoms.some(userSymptom =>
        userSymptom.toLowerCase().includes(symptom.toLowerCase())
      )
    )
  );

  const currentCondition = selectedCondition !== null
    ? conditionsMockData.find(c => c.id === selectedCondition)
    : null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
      {/* Symptom Tracker */}
      <div className="md:col-span-1 space-y-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Symptoms</h2>
          
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              placeholder="Add a symptom..."
              className="flex-1 p-2 border border-gray-300 rounded-md"
              value={symptomInput}
              onChange={(e) => setSymptomInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button
              onClick={addSymptom}
              className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 transition-colors"
            >
              Add
            </button>
          </div>
          
          <div className="space-y-2">
            {userSymptoms.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No symptoms added yet.</p>
            ) : (
              userSymptoms.map((symptom, idx) => (
                <div key={idx} className="flex justify-between items-center p-2 bg-gray-50 rounded-md">
                  <span>{symptom}</span>
                  <button
                    onClick={() => removeSymptom(symptom)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                      <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                    </svg>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Privacy Settings</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-800">Anonymous Mode</h3>
                <p className="text-sm text-gray-500">Hide personal information from doctors</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={sharingPreferences.anonymousMode} 
                  onChange={() => handleSharingChange('anonymousMode')}
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-800">Share Medical History</h3>
                <p className="text-sm text-gray-500">Allow doctors to view past conditions</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={sharingPreferences.shareMedicalHistory}
                  onChange={() => handleSharingChange('shareMedicalHistory')}
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-800">Data for Research</h3>
                <p className="text-sm text-gray-500">Allow anonymous data for medical research</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={sharingPreferences.shareForResearch}
                  onChange={() => handleSharingChange('shareForResearch')}
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-800">Share Biological Sex</h3>
                <p className="text-sm text-gray-500">Show biological sex to all doctors</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={sharingPreferences.shareBiologicalSex}
                  onChange={() => handleSharingChange('shareBiologicalSex')}
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Data Access Requests Section */}
        {pendingRequests.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Data Access Requests</h2>
            <div className="space-y-4">
              {pendingRequests.map(request => (
                <div key={request.id} className="border border-yellow-200 bg-yellow-50 rounded-md p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <svg
                      className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <div>
                      <h3 className="font-medium text-gray-800">{request.from} requests access to your {request.type === 'biologicalSex' ? 'biological sex' : request.type} information</h3>
                      <p className="text-sm text-gray-600 mt-1">Requested {request.requestDate}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => handleDenyRequest(request.id)}
                      className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      Deny
                    </button>
                    <button
                      onClick={() => handleApproveRequest(request.id)}
                      className="px-3 py-1 bg-blue-600 rounded text-sm text-white hover:bg-blue-700 transition-colors"
                    >
                      Approve
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="md:col-span-2 space-y-6">
        {/* AI Analysis */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-xl font-semibold text-gray-800">AI Analysis</h2>
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
              Powered by MedLM AI
            </span>
          </div>
          
          {userSymptoms.length === 0 ? (
            <div className="text-center py-8">
              <svg
                className="w-16 h-16 text-gray-300 mx-auto mb-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 className="text-lg font-medium text-gray-700">Add symptoms to get started</h3>
              <p className="text-gray-500 mt-2 max-w-md mx-auto">
                Our AI will analyze your symptoms and suggest potential conditions while maintaining your privacy.
              </p>
            </div>
          ) : (
            <div>
              <p className="mb-4 text-gray-700">
                Based on your symptoms, here are some potential conditions to discuss with a healthcare provider:
              </p>
              
              <div className="space-y-3 mb-6">
                {matchedConditions.map(condition => (
                  <div
                    key={condition.id}
                    className={`p-3 rounded-md cursor-pointer transition-colors ${
                      selectedCondition === condition.id
                        ? 'bg-blue-50 border border-blue-200'
                        : 'hover:bg-gray-50 border border-gray-100'
                    }`}
                    onClick={() => setSelectedCondition(condition.id)}
                  >
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium text-gray-800">{condition.name}</h3>
                      <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                        {condition.symptoms.filter(symptom => 
                          userSymptoms.some(s => s.toLowerCase().includes(symptom.toLowerCase()))
                        ).length} matching symptoms
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      Click to learn more about this condition
                    </p>
                  </div>
                ))}
              </div>
              
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                <div className="flex items-start gap-3">
                  <svg
                    className="w-6 h-6 text-yellow-500 mt-0.5"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div>
                    <h4 className="font-medium text-gray-800">Medical Disclaimer</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      This is not a diagnosis. Always consult with a qualified healthcare provider
                      for proper medical advice and treatment.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Condition Details or Doctor Search */}
        {selectedCondition !== null ? (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-xl font-semibold text-gray-800">{currentCondition?.name}</h2>
              <button
                onClick={() => setSelectedCondition(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                  <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                </svg>
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-800 mb-3">Common Symptoms</h3>
                <ul className="space-y-2">
                  {currentCondition?.symptoms.map((symptom, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm">
                      <span
                        className={
                          userSymptoms.some(s => s.toLowerCase().includes(symptom.toLowerCase()))
                            ? "w-2 h-2 bg-green-500 rounded-full"
                            : "w-2 h-2 bg-gray-300 rounded-full"
                        }
                      ></span>
                      {symptom}
                      {userSymptoms.some(s => s.toLowerCase().includes(symptom.toLowerCase())) && (
                        <span className="text-xs text-green-600">(you reported this)</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-800 mb-3">Common Treatments</h3>
                <ul className="space-y-2">
                  {currentCondition?.commonTreatments.map((treatment, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm">
                      <svg
                        className="w-4 h-4 text-blue-500"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {treatment}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            <div className="mt-6">
              <h3 className="font-medium text-gray-800 mb-3">Recommended Tests</h3>
              <div className="flex flex-wrap gap-2">
                {currentCondition?.relatedTests.map((test, idx) => (
                  <span key={idx} className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
                    {test}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-200">
              <button className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors">
                Connect with a specialist anonymously
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Find a Specialist</h2>
            
            <div className="relative mb-6">
              <input
                type="text"
                placeholder="Search by name or specialty..."
                className="w-full p-3 border border-gray-300 rounded-md pr-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <svg
                className="absolute right-3 top-3.5 h-5 w-5 text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredDoctors.map(doctor => (
                <div key={doctor.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-6 h-6"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-800">{doctor.name}</h3>
                      <p className="text-sm text-gray-500">{doctor.specialty}</p>
                      <div className="flex items-center mt-1">
                        <div className="flex">
                          {Array.from({ length: 5 }).map((_, idx) => (
                            <svg
                              key={idx}
                              className={`w-4 h-4 ${
                                idx < Math.floor(doctor.rating)
                                  ? 'text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z"
                                clipRule="evenodd"
                              />
                            </svg>
                          ))}
                        </div>
                        <span className="text-sm text-gray-500 ml-1">
                          {doctor.rating} • {doctor.yearsExperience} years exp.
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-between items-center">
                    <span className="text-sm text-green-600">
                      {doctor.availableSlots} slots available
                    </span>
                    <button className="bg-blue-600 text-white px-3 py-1.5 rounded-md text-sm hover:bg-blue-700 transition-colors">
                      Book Anonymously
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 