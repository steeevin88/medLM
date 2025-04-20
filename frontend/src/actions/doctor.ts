"use server";

import { Doctor } from "@prisma/client";
import prisma from "../lib/db";
import { DoctorData } from "./user";

export async function uploadDoctorData(doctor: any) {
  return await prisma.doctor.create({
    data: doctor,
  });
}

export async function getDoctorData(doctorId: string) {
  return await prisma.doctor.findUnique({
    where: {
      id: doctorId,
    },
  });
}

export async function updateDoctorData(doctorId: string, data: any) {
  return await prisma.doctor.update({
    where: {
      id: doctorId,
    },
    data,
  });
}

export async function createDoctor(userId: string, doctorData: DoctorData) {
  try {
    const requiredFields = ['sex', 'age', 'location', 'fieldOfStudy'] as const;
    const missingFields = requiredFields.filter(field => doctorData[field] === undefined);

    if (missingFields.length > 0) throw new Error(`Missing required fields: ${missingFields.join(', ')}`);

    const input = {
      id: userId,
      sex: doctorData.sex as boolean,
      age: doctorData.age as number,
      location: doctorData.location as string,
      fieldOfStudy: doctorData.fieldOfStudy as string,
      firstName: doctorData.firstName,
      lastName: doctorData.lastName,
      email: doctorData.email,
      specialization: doctorData.specialization,
      yearsExperience: doctorData.yearsExperience,
      licenseNumber: doctorData.licenseNumber,
      hospital: doctorData.hospital,
      bio: doctorData.bio,
    };

    const newDoctor = await prisma.doctor.create({
      data: input,
    });

    return { success: true, doctor: newDoctor, error: null };
  } catch (error) {
    console.error("Error creating doctor profile:", error);
    return { success: false, doctor: null, error: "Failed to create doctor profile" };
  }
}

export async function getDoctors() {
  try {
    const doctors = await prisma.doctor.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        specialization: true,
        email: true,
        hospital: true,
        bio: true,
      }
    });

    return { doctors, error: null };
  } catch (error) {
    console.error('Error fetching doctors:', error);
    return { doctors: [], error: 'Failed to fetch doctors' };
  }
}
