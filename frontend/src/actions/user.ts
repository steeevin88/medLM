"use server";

import prisma from "../lib/db";

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
