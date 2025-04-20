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

    // Check if patient already exists
    const existingPatient = await prisma.patient.findUnique({
      where: { id: userId }
    });

    let result;
    if (existingPatient) {
      // Update existing patient - remove id from data when updating
      const { id, ...updateData } = input;
      result = await prisma.patient.update({
        where: { id: userId },
        data: updateData,
      });
    } else {
      // Create new patient
      result = await prisma.patient.create({
        data: input,
      });
    }

    return { success: true, patient: result, error: null };
  } catch (error) {
    console.error("Error creating/updating patient profile:", error);
    return { success: false, patient: null, error: "Failed to create/update patient profile" };
  }
}

export async function getPatientByUserId(userId: string) {
  try {
    const patient = await prisma.patient.findUnique({
      where: {
        id: userId,
      },
    });

    return { success: true, patient, error: null };
  } catch (error) {
    console.error("Error fetching patient profile:", error);
    return { success: false, patient: null, error: "Failed to fetch patient profile" };
  }
}

export async function updateDataRequestStatus(requestId: string, status: 'APPROVED' | 'DENIED') {
  try {
    // First update the status of the request
    const dataRequest = await prisma.dataRequest.update({
      where: {
        id: requestId,
      },
      data: {
        status,
        updatedAt: new Date()
      },
      include: {
        report: {
          include: {
            obfuscatedUser: true
          }
        },
        patient: true
      }
    });

    // If approved, update the obfuscatedUser to include the requested field
    if (status === 'APPROVED' && dataRequest.report?.obfuscatedUser) {
      const field = dataRequest.field;
      const patientId = dataRequest.patientId;

      // Get the actual field value from the patient
      const patient = await prisma.patient.findUnique({
        where: { id: patientId },
      });

      if (patient && patient[field as keyof typeof patient] !== undefined) {
        const fieldValue = patient[field as keyof typeof patient];

        // Update the obfuscatedUser with the field value from the patient
        await prisma.obfuscatedUser.update({
          where: { id: dataRequest.report.obfuscatedUser.id },
          data: { [field]: fieldValue }
        });
      }
    }

    return { success: true, request: dataRequest, error: null };
  } catch (error) {
    console.error("Error updating data request status:", error);
    return { success: false, request: null, error: "Failed to update data request status" };
  }
}

export async function getPatientFieldValue(patientId: string, field: string) {
  try {
    const patient = await prisma.patient.findUnique({
      where: {
        id: patientId,
      },
      select: {
        [field]: true
      }
    });

    if (!patient) {
      return { success: false, value: null, error: "Patient not found" };
    }

    return {
      success: true,
      value: patient[field as keyof typeof patient],
      error: null
    };
  } catch (error) {
    console.error(`Error fetching patient ${field}:`, error);
    return { success: false, value: null, error: `Failed to fetch patient ${field}` };
  }
}
