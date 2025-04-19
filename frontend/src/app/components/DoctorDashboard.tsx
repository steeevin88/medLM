"use client";

import React, { useState } from 'react';
import { patientsMockData, conditionsMockData } from '../context/MockData';

export default function DoctorDashboard() {
  const [selectedPatient, setSelectedPatient] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [requestedDataAccess, setRequestedDataAccess] = useState<{[key: number]: {biologicalSex: boolean}}>({});

  const requestSexDataAccess = (patientId: number) => {
    setRequestedDataAccess(prev => ({
      ...prev,
      [patientId]: { ...prev[patientId], biologicalSex: true }
    }));
  };

  const filteredPatients = patientsMockData.filter(patient =>
    patient.anonymizedId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.recentSymptoms.some(symptom => symptom.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const currentPatient = selectedPatient !== null
    ? patientsMockData.find(p => p.id === selectedPatient)
    : null;

  const suggestedConditions = currentPatient
    ? conditionsMockData.filter(condition =>
        condition.symptoms.some(symptom =>
          currentPatient.recentSymptoms.some(patientSymptom =>
            patientSymptom.toLowerCase().includes(symptom.toLowerCase())
          )
        )
      )
    : [];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
      {/* Patient List */}
      <div className="bg-white rounded-lg shadow-md p-4 md:col-span-1 flex flex-col h-[calc(100vh-12rem)]">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Anonymous Patients</h2>
          <div className="relative">
            <input
              type="text"
              placeholder="Search by ID or symptoms..."
              className="w-full p-2 border border-gray-300 rounded-md pr-10 text-black"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <svg
              className="absolute right-3 top-2.5 h-5 w-5 text-gray-400"
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
        </div>

        <div className="overflow-y-auto flex-1 space-y-3 pr-1">
          {filteredPatients.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No patients match your search.</p>
          ) : (
            filteredPatients.map(patient => (
              <div
                key={patient.id}
                className={`p-4 rounded-md cursor-pointer transition-colors ${
                  selectedPatient === patient.id
                    ? 'bg-blue-50 border border-blue-200'
                    : 'hover:bg-gray-50 border border-gray-100'
                }`}
                onClick={() => setSelectedPatient(patient.id)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-gray-800 mb-1">ID: {patient.anonymizedId}</h3>
                    <p className="text-sm text-gray-500 mb-3">
                      {patient.age} years • <span className="bg-gray-100 text-gray-800 px-1 rounded select-none cursor-not-allowed">data protected</span>
                    </p>
                  </div>
                  <span className="text-xs bg-blue-100 text-blue-800 px-3 py-1.5 rounded-full font-medium">
                    {patient.pendingTests.length} pending tests
                  </span>
                </div>
                <div>
                  <h4 className="text-xs text-gray-500 uppercase font-medium mb-1.5">Recent Symptoms:</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {patient.recentSymptoms.map((symptom, idx) => (
                      <span
                        key={idx}
                        className="text-xs bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full"
                      >
                        {symptom}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Patient Details */}
      <div className="md:col-span-2">
        {selectedPatient === null ? (
          <div className="bg-white rounded-lg shadow-md p-8 flex flex-col items-center justify-center h-full">
            <svg
              className="w-16 h-16 text-gray-300 mb-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            <h3 className="text-xl font-medium text-gray-700">Select a patient to view details</h3>
            <p className="text-gray-500 mt-2 text-center">
              Patient information is anonymized to protect privacy while providing essential medical context.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Patient Overview */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                    Patient {currentPatient?.anonymizedId}
                  </h2>
                  <div className="flex flex-wrap gap-4 mt-1">
                    <div className="flex items-center">
                      <span className="text-gray-600 mr-1">Age:</span>
                      <span className="font-medium">{currentPatient?.age}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-gray-600 mr-1">Sex:</span>
                      {requestedDataAccess[currentPatient?.id ?? 0]?.biologicalSex ? (
                        <span className="font-medium">{currentPatient?.biologicalSex}</span>
                      ) : (
                        <button
                          onClick={() => currentPatient && requestSexDataAccess(currentPatient.id)}
                          className="text-blue-600 text-sm underline font-normal hover:text-blue-800"
                        >
                          Request access
                        </button>
                      )}
                    </div>
                    <div className="flex items-center">
                      <span className="text-gray-600 mr-1">Last Visit:</span>
                      <span className="font-medium">{currentPatient?.lastVisit}</span>
                    </div>
                  </div>
                </div>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 transition-colors">
                  Request Consultation
                </button>
              </div>
            </div>

            {/* Symptoms & Tests */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Reported Symptoms</h3>
                <ul className="space-y-3">
                  {currentPatient?.recentSymptoms.map((symptom, idx) => (
                    <li key={idx} className="flex items-start gap-3 p-2 bg-gray-50 rounded-md">
                      <svg
                        className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-gray-800">{symptom}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Pending Tests</h3>
                <ul className="space-y-3">
                  {currentPatient?.pendingTests.map((test, idx) => (
                    <li key={idx} className="flex items-start gap-3 p-2 bg-gray-50 rounded-md">
                      <svg
                        className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM6.75 9.25a.75.75 0 000 1.5h6.5a.75.75 0 000-1.5h-6.5z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-gray-800">{test}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Potential Conditions */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Suggested Conditions</h3>
              {suggestedConditions.length === 0 ? (
                <p className="text-gray-500">No conditions suggested based on current symptoms.</p>
              ) : (
                <div className="space-y-4">
                  {suggestedConditions.map(condition => (
                    <div key={condition.id} className="border border-gray-200 rounded-md p-4">
                      <h4 className="font-medium text-gray-800 mb-3">{condition.name}</h4>
                      <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-gray-50 p-3 rounded-md">
                          <h5 className="text-sm font-medium text-gray-700 mb-2">Matching Symptoms:</h5>
                          <ul className="mt-1 text-sm space-y-2">
                            {condition.symptoms.map((symptom, idx) => (
                              <li key={idx} className="flex items-center gap-2">
                                <span
                                  className={
                                    currentPatient?.recentSymptoms.some(s =>
                                      s.toLowerCase().includes(symptom.toLowerCase())
                                    )
                                      ? "w-2 h-2 bg-green-500 rounded-full"
                                      : "w-2 h-2 bg-gray-300 rounded-full"
                                  }
                                ></span>
                                <span className="text-gray-800">{symptom}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-md">
                          <h5 className="text-sm font-medium text-gray-700 mb-2">Recommended Tests:</h5>
                          <ul className="mt-1 text-sm space-y-2">
                            {condition.relatedTests.map((test, idx) => (
                              <li key={idx} className="flex items-center gap-2">
                                <span
                                  className={
                                    currentPatient?.pendingTests.includes(test)
                                      ? "w-2 h-2 bg-blue-500 rounded-full"
                                      : "w-2 h-2 bg-gray-300 rounded-full"
                                  }
                                ></span>
                                <span className="text-gray-800">{test}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Data Access Request Section */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Protected Patient Data</h3>
              <p className="text-gray-600 mb-4">
                Some patient data is protected to maintain privacy. You can request access to this information when medically necessary.
              </p>

              <div className="border border-gray-200 rounded-md p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-blue-500 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium text-gray-800">Biological Sex</span>
                  </div>
                  {requestedDataAccess[currentPatient?.id ?? 0]?.biologicalSex ? (
                    <span className="text-green-600 text-sm font-medium">Access Granted</span>
                  ) : (
                    <button
                      onClick={() => currentPatient && requestSexDataAccess(currentPatient.id)}
                      className="bg-blue-600 text-white px-3 py-1.5 text-sm rounded hover:bg-blue-700 transition-colors"
                    >
                      Request Access
                    </button>
                  )}
                </div>

                <div className="bg-gray-50 p-4 rounded-md">
                  {requestedDataAccess[currentPatient?.id ?? 0]?.biologicalSex ? (
                    <p className="text-gray-800">{currentPatient?.biologicalSex}</p>
                  ) : (
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-gray-400 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                      <p className="text-gray-500">Protected information - requires explicit access request</p>
                    </div>
                  )}
                </div>

                <p className="text-xs text-gray-500 mt-3">
                  Patient will be notified of your request and must consent before this information is shared.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
