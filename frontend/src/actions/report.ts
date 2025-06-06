"use server";

import prisma from "../lib/db";
import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { Prisma } from "@prisma/client";

// Removing unused interfaces and just keeping as comments for future reference
// Interfaces for Prisma types:
// - Prisma.ReportCreateInput
// - Prisma.ObfuscatedUserCreateInput

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
  report: Prisma.ReportCreateInput,
  obfuscatedUser: Prisma.ObfuscatedUserCreateInput
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

type SendReportParams = {
  reportBody: string;
  doctorId: string;
};

export async function sendDoctorReport({ reportBody, doctorId }: SendReportParams) {
  try {
    const authResult = await auth();
    const userId = authResult.userId;

    if (!userId) {
      return { success: false, error: "Not authenticated" };
    }

    // Get the patient's data
    const patient = await prisma.patient.findUnique({
      where: { id: userId },
      select: {
        id: true,
      },
    });

    if (!patient) {
      return { success: false, error: "Patient profile not found" };
    }

    // Create obfuscated user - only include symptoms, all other fields are null by default
    const obfuscatedUser = await prisma.obfuscatedUser.create({
      data: {
        id: `obf_${userId}_${Date.now()}`,
        userId: userId,
        age: null,
        sex: null,
        activityLevel: null,
        allergies: [],
        diet: [],
        healthIssues: [],
      },
    });

    // Create the report
    await prisma.report.create({
      data: {
        body: reportBody,
        status: "PENDING",
        patient: {
          connect: {
            id: userId
          }
        },
        doctor: {
          connect: {
            id: doctorId
          }
        },
        obfuscatedUser: {
          connect: {
            id: obfuscatedUser.id
          }
        }
      },
    });

    revalidatePath('/patient');
    return { success: true, error: null };
  } catch (error) {
    console.error("Error creating report:", error);
    return { success: false, error: "Failed to create report. Please try again." };
  }
}
