"use server";

import prisma from "../lib/db";

import { HealthIssue, User } from "../../generated/prisma";

export default async function uploadUser(user: User) {
  return await prisma.user.create({
    data: user,
  });
}

export async function getUser(userId: string) {
  return await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });
}

export async function updateUser(userId: string, data: Partial<User>) {
  return await prisma.user.update({
    where: {
      id: userId,
    },
    data,
  });
}
