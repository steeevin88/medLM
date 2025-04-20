"use client";

import React, { useState } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { createDoctor } from "@/actions/doctor";

const formSchema = z.object({
  sex: z.enum(["male", "female", "other"]),
  age: z.coerce.number().int().positive().max(120),
  location: z.string().min(2, { message: "Location must be at least 2 characters" }),
  fieldOfStudy: z.string().min(2, { message: "Field of study must be at least 2 characters" }),
  specialization: z.string().min(2, { message: "Specialization must be at least 2 characters" }),
  yearsExperience: z.coerce.number().int().min(0).optional(),
  licenseNumber: z.string().optional(),
  hospital: z.string().optional(),
  bio: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof formSchema>;

export default function DoctorOnboarding() {
  const { user, isLoaded: isUserLoaded } = useUser();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const defaultValues: Partial<ProfileFormValues> = {
    sex: "male",
    age: undefined,
    location: "",
    fieldOfStudy: "",
    specialization: "",
    yearsExperience: undefined,
    licenseNumber: "",
    hospital: "",
    bio: "",
  };

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  async function onSubmit(data: ProfileFormValues) {
    if (!isUserLoaded || !user) {
      setError("You must be logged in to create a doctor profile");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const sex = data.sex === "male" ? true : data.sex === "female" ? false : undefined;

      if (sex === undefined) {
        setError("Please select male or female for biological sex");
        setIsSubmitting(false);
        return;
      }

      const doctorData = {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.primaryEmailAddress?.emailAddress,
        sex,
        age: data.age,
        location: data.location,
        fieldOfStudy: data.fieldOfStudy,
        specialization: data.specialization,
        yearsExperience: data.yearsExperience,
        licenseNumber: data.licenseNumber,
        hospital: data.hospital,
        bio: data.bio,
      };

      const result = await createDoctor(user.id, doctorData);

      if (result.success) {
        setSuccess("Your doctor profile has been created successfully!");
        setTimeout(() => {
          router.push("/doctor");
        }, 2000);
      } else {
        throw new Error(result.error || "Failed to create doctor profile");
      }
    } catch (err) {
      console.error("Error creating doctor profile:", err);
      setError("There was an error creating your profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Complete Your Doctor Profile</CardTitle>
        <CardDescription>
          Provide your professional information to help us connect you with patients.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
            <p className="text-green-700">{success}</p>
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Sex */}
              <FormField
                control={form.control}
                name="sex"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Biological Sex</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="male" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Male
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="female" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Female
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="other" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Other
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Age */}
              <FormField
                control={form.control}
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Age</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Location */}
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="City, Country" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Years of Experience */}
              <FormField
                control={form.control}
                name="yearsExperience"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Years of Experience</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Field of Study */}
            <FormField
              control={form.control}
              name="fieldOfStudy"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Field of Study</FormLabel>
                  <FormDescription>
                    Your primary medical field (e.g., Internal Medicine, Surgery, Psychiatry)
                  </FormDescription>
                  <FormControl>
                    <Input placeholder="Enter your field of study" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Specialization */}
            <FormField
              control={form.control}
              name="specialization"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Specialization</FormLabel>
                  <FormDescription>
                    Your specific area of expertise (e.g., Cardiology, Dermatology, Oncology)
                  </FormDescription>
                  <FormControl>
                    <Input placeholder="Enter your specialization" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* License Number */}
            <FormField
              control={form.control}
              name="licenseNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>License Number</FormLabel>
                  <FormDescription>
                    Your medical license or registration number
                  </FormDescription>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Hospital/Clinic */}
            <FormField
              control={form.control}
              name="hospital"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hospital/Clinic</FormLabel>
                  <FormDescription>
                    Where you currently practice
                  </FormDescription>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Bio */}
            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Professional Bio</FormLabel>
                  <FormDescription>
                    Tell us about your professional background, expertise, and approach
                  </FormDescription>
                  <FormControl>
                    <Textarea
                      placeholder="Share your professional background, expertise and approach..."
                      className="min-h-[150px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Profile"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
