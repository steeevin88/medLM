"use server";

import { Doctor, Patient } from "@prisma/client";
import prisma from "../lib/db";

export type DoctorData = Partial<Doctor>;
export type PatientData = Partial<Patient>;

export async function uploadPatientData(patient: any) {
  return await prisma.patient.create({
    data: patient,
  });
}

export async function getPatientData(patientId: string) {
  return await prisma.patient.findUnique({
    where: {
      id: patientId,
    },
  });
}

export async function updatePatientData(patientId: string, data: any) {
  return await prisma.patient.update({
    where: {
      id: patientId,
    },
    data,
  });
}

export async function createPatient(userId: string, patientData: PatientData) {
  try {
    const requiredFields = ['sex', 'age', 'height', 'weight', 'activityLevel'] as const;
    const missingFields = requiredFields.filter(field => patientData[field] === undefined);

    if (missingFields.length > 0) throw new Error(`Missing required fields: ${missingFields.join(', ')}`);

    const input = {
      id: userId,
      sex: patientData.sex as boolean,
      age: patientData.age as number,
      height: patientData.height as number,
      weight: patientData.weight as number,
      activityLevel: patientData.activityLevel as any, // Cast to any to bypass type check since we've validated it exists
      allergies: patientData.allergies || [],
      medications: patientData.medications || [],
      healthIssues: patientData.healthIssues || [],
      diet: patientData.diet || [],
      additionalInfo: patientData.additionalInfo,
      firstName: patientData.firstName,
      lastName: patientData.lastName,
      email: patientData.email,
      heartRate: patientData.heartRate,
      bloodPressure: patientData.bloodPressure,
    };

    const newPatient = await prisma.patient.create({
      data: input,
    });

    return { success: true, patient: newPatient, error: null };
  } catch (error) {
    console.error("Error creating patient profile:", error);
    return { success: false, patient: null, error: "Failed to create patient profile" };
  }
}
