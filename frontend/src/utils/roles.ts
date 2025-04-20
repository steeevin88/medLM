// i think we need to make API routes for each one idk
// im assuming this is caused by the same reason why we can't use db/actions in middleware.ts too
// maybe we can look at our old repos + see how we did it

import { getDoctorData, getPatientData } from "@/actions/user";
import { useUser } from "@clerk/nextjs";

export type Role = "patient" | "doctor";

type RouterLike = {
  push: (url: string) => void;
};

export const handleRoleRedirects = async (
  user: ReturnType<typeof useUser>["user"],
  isLoaded: boolean,
  expectedRole: Role,
  router: RouterLike
) => {
  if (isLoaded) {
    // Redirect to homepage if not signed in
    if (!user) {
      router.push("/");
      return true;
    }

    // Redirect to role selection if user is signed in BUT no role set
    if (!user.publicMetadata?.role) {
      router.push("/select-role");
      return true;
    }

    console.log(
      `role; ${user.publicMetadata.role}; ${await getPatientData(user.id)}`
    );

    if (
      (user.publicMetadata.role === "patient" &&
        (await getPatientData(user.id)) === null) ||
      (user.publicMetadata.role === "doctor" &&
        (await getDoctorData(user.id)) === null)
    ) {
      router.push("/onboarding");
      return true;
    }

    // Redirect to appropriate dashboard if user doesn't have the expected role
    if (user.publicMetadata.role !== expectedRole) {
      // If they're a doctor viewing patient page, send to doctor page
      if (user.publicMetadata.role === "doctor" && expectedRole === "patient") {
        router.push("/doctor");
        return true;
      }

      // If they're a patient viewing doctor page, send to patient page
      if (user.publicMetadata.role === "patient" && expectedRole === "doctor") {
        router.push("/patient");
        return true;
      }
    }
  }

  return false;
};
