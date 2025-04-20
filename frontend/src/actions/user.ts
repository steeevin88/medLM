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

// Doctor report actions
export async function getReportsForDoctor(doctorId: string) {
  try {
    const reports = await prisma.report.findMany({
      where: {
        doctorId,
      },
      include: {
        obfuscatedUser: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return { reports, error: null };
  } catch (error) {
    console.error("Error fetching reports:", error);
    return { reports: [], error: "Failed to fetch reports" };
  }
}

export async function getReportById(reportId: string) {
  try {
    const report = await prisma.report.findUnique({
      where: {
        id: reportId,
      },
      include: {
        obfuscatedUser: true,
      },
    });

    return { report, error: null };
  } catch (error) {
    console.error("Error fetching report:", error);
    return { report: null, error: "Failed to fetch report" };
  }
}

export async function createReportWithObfuscatedUser(
  report: any,
  obfuscatedUser: any
) {
  try {
    // Create the report first
    const createdReport = await prisma.report.create({
      data: {
        ...report,
        obfuscatedUser: {
          create: obfuscatedUser,
        },
      },
      include: {
        obfuscatedUser: true,
      },
    });

    return { success: true, report: createdReport, error: null };
  } catch (error) {
    console.error("Error creating report:", error);
    return { success: false, report: null, error: "Failed to create report" };
  }
}

export async function updateReportStatus(
  reportId: string,
  status: "PENDING" | "REVIEWED" | "RESPONDED"
) {
  try {
    const updatedReport = await prisma.report.update({
      where: {
        id: reportId,
      },
      data: {
        status,
      },
    });

    return { success: true, report: updatedReport, error: null };
  } catch (error) {
    console.error("Error updating report status:", error);
    return {
      success: false,
      report: null,
      error: "Failed to update report status",
    };
  }
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

export async function createDataRequest(
  reportId: string,
  doctorId: string,
  patientId: string,
  field: string
) {
  try {
    const existingRequest = await prisma.dataRequest.findFirst({
      where: {
        reportId,
        doctorId,
        patientId,
        field
      }
    });

    // If a request already exists, don't create a duplicate
    if (existingRequest) {
      return {
        success: true,
        dataRequest: existingRequest,
        error: null,
        message: "Request already exists"
      };
    }

    const dataRequest = await prisma.dataRequest.create({
      data: {
        field,
        status: "PENDING",
        report: {
          connect: {
            id: reportId
          }
        },
        doctor: {
          connect: {
            id: doctorId
          }
        },
        patient: {
          connect: {
            id: patientId
          }
        }
      }
    });

    return { success: true, dataRequest, error: null };
  } catch (error) {
    console.error("Error creating data request:", error);
    return {
      success: false,
      dataRequest: null,
      error: "Failed to create data request"
    };
  }
}

export async function getDataRequestsForPatient(patientId: string) {
  try {
    const dataRequests = await prisma.dataRequest.findMany({
      where: {
        patientId
      },
      include: {
        doctor: true,
        report: true
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    return { dataRequests, error: null };
  } catch (error) {
    console.error("Error fetching data requests:", error);
    return { dataRequests: [], error: "Failed to fetch data requests" };
  }
}

export async function updateDataRequestStatus(
  requestId: string,
  status: "APPROVED" | "DENIED"
) {
  try {
    const updatedRequest = await prisma.dataRequest.update({
      where: {
        id: requestId
      },
      data: {
        status
      }
    });

    return { success: true, dataRequest: updatedRequest, error: null };
  } catch (error) {
    console.error("Error updating data request status:", error);
    return {
      success: false,
      dataRequest: null,
      error: "Failed to update data request status"
    };
  }
}
