"use server";

import prisma from "../lib/db";

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
