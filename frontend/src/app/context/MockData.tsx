export const doctorsMockData = [
  {
    id: 1,
    name: "Dr. Sarah Johnson",
    specialty: "Internal Medicine", 
    yearsExperience: 12,
    rating: 4.8,
    profileImage: "/doctors/doctor1.jpg",
    availableSlots: 7
  },
  {
    id: 2,
    name: "Dr. Michael Chen",
    specialty: "Cardiology",
    yearsExperience: 15,
    rating: 4.9,
    profileImage: "/doctors/doctor2.jpg",
    availableSlots: 3
  },
  {
    id: 3,
    name: "Dr. Anita Patel",
    specialty: "Pediatrics",
    yearsExperience: 8,
    rating: 4.7,
    profileImage: "/doctors/doctor3.jpg",
    availableSlots: 5
  },
  {
    id: 4,
    name: "Dr. James Wilson",
    specialty: "Dermatology",
    yearsExperience: 10,
    rating: 4.6,
    profileImage: "/doctors/doctor4.jpg",
    availableSlots: 2
  }
];

export const patientsMockData = [
  {
    id: 101,
    anonymizedId: "PT78392",
    age: 34,
    biologicalSex: "Female",
    recentSymptoms: ["Persistent headache", "Fatigue", "Dizziness"],
    pendingTests: ["Blood panel", "MRI"],
    lastVisit: "2023-10-15"
  },
  {
    id: 102,
    anonymizedId: "PT45921",
    age: 58,
    biologicalSex: "Male",
    recentSymptoms: ["Chest pain", "Shortness of breath"],
    pendingTests: ["ECG", "Stress test"],
    lastVisit: "2023-11-02"
  },
  {
    id: 103,
    anonymizedId: "PT12837",
    age: 7,
    biologicalSex: "Male",
    recentSymptoms: ["Fever", "Cough", "Runny nose"],
    pendingTests: ["Throat culture"],
    lastVisit: "2023-11-10"
  },
  {
    id: 104,
    anonymizedId: "PT93847",
    age: 45,
    biologicalSex: "Female",
    recentSymptoms: ["Joint pain", "Morning stiffness", "Fatigue"],
    pendingTests: ["Rheumatoid factor test", "X-rays"],
    lastVisit: "2023-11-05"
  },
  {
    id: 105,
    anonymizedId: "PT67234",
    age: 29,
    biologicalSex: "Male",
    recentSymptoms: ["Anxiety", "Insomnia", "Loss of appetite"],
    pendingTests: ["Psychological evaluation"],
    lastVisit: "2023-11-08"
  },
  {
    id: 106,
    anonymizedId: "PT54321",
    age: 62,
    biologicalSex: "Female",
    recentSymptoms: ["Blurred vision", "Frequent urination", "Thirst"],
    pendingTests: ["Blood glucose test", "HbA1c"],
    lastVisit: "2023-11-01"
  },
  {
    id: 107,
    anonymizedId: "PT89012",
    age: 41,
    biologicalSex: "Male",
    recentSymptoms: ["Lower back pain", "Numbness in legs", "Muscle weakness"],
    pendingTests: ["MRI", "Nerve conduction study"],
    lastVisit: "2023-10-28"
  },
  {
    id: 108,
    anonymizedId: "PT34567",
    age: 23,
    biologicalSex: "Female",
    recentSymptoms: ["Skin rash", "Itching", "Swelling"],
    pendingTests: ["Allergy testing", "Skin biopsy"],
    lastVisit: "2023-11-12"
  }
];

export const conditionsMockData = [
  {
    id: 1,
    name: "Migraine",
    symptoms: ["Severe headache", "Sensitivity to light", "Nausea"],
    commonTreatments: ["Preventive medications", "Pain relievers", "Lifestyle changes"],
    relatedTests: ["Neurological exam", "MRI", "CT scan"]
  },
  {
    id: 2,
    name: "Hypertension",
    symptoms: ["Headaches", "Shortness of breath", "Chest pain"],
    commonTreatments: ["Blood pressure medications", "Dietary changes", "Exercise"],
    relatedTests: ["Blood pressure monitoring", "ECG", "Kidney function tests"]
  },
  {
    id: 3,
    name: "Asthma",
    symptoms: ["Wheezing", "Shortness of breath", "Coughing"],
    commonTreatments: ["Inhalers", "Anti-inflammatory medications", "Avoiding triggers"],
    relatedTests: ["Lung function tests", "Allergy testing"]
  }
];