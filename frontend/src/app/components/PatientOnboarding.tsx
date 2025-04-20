"use client";

import React, { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { createPatient, getPatientByUserId } from "@/actions/user";
import {
  ActivityLevel,
  Allergy,
  Diet,
  Medication,
  Patient,
} from "@prisma/client";
import { useUser } from "@clerk/nextjs";

const ALLERGIES = [
  { id: "peanuts", label: "Peanuts" },
  { id: "shellfish", label: "Shellfish" },
  { id: "dairy", label: "Dairy" },
  { id: "gluten", label: "Gluten" },
  { id: "eggs", label: "Eggs" },
  { id: "soy", label: "Soy" },
  { id: "medication", label: "Medication Allergies" },
] as const;

const MEDICATIONS = [
  { id: "antibiotics", label: "Antibiotics" },
  { id: "antihistamines", label: "Antihistamines" },
  { id: "antidepressants", label: "Antidepressants" },
  { id: "painkillers", label: "Painkillers" },
  { id: "bloodpressure", label: "Blood Pressure Medication" },
  { id: "diabetes", label: "Diabetes Medication" },
  { id: "other", label: "Other" },
] as const;

const DIETS = [
  { value: "regular", label: "Regular Diet" },
  { value: "vegetarian", label: "Vegetarian" },
  { value: "vegan", label: "Vegan" },
  { value: "keto", label: "Keto" },
  { value: "lowcarb", label: "Low-Carb" },
  { value: "glutenfree", label: "Gluten-Free" },
  { value: "dairyfree", label: "Dairy-Free" },
] as const;

const ACTIVITY_LEVELS = [
  { value: "sedentary", label: "Sedentary" },
  { value: "light", label: "Light Exercise (1-2 days/week)" },
  { value: "moderate", label: "Moderate Exercise (3-5 days/week)" },
  { value: "active", label: "Active (6-7 days/week)" },
  { value: "veryactive", label: "Very Active (multiple times/day)" },
] as const;

// Create a schema for form validation
const formSchema = z.object({
  sex: z.enum(["male", "female", "other"]),
  age: z.coerce.number().int().positive().max(120),
  height: z.coerce.number().positive(),
  weight: z.coerce.number().positive(),
  allergies: z.array(z.string()).optional(),
  medications: z.array(z.string()).optional(),
  medicalHistory: z.array(z.string()).optional(),
  additionalMedicalHistory: z.string().optional(),
  diet: z.enum([
    "regular",
    "vegetarian",
    "vegan",
    "keto",
    "lowcarb",
    "glutenfree",
    "dairyfree",
  ]),
  activityLevel: z.enum([
    "sedentary",
    "light",
    "moderate",
    "active",
    "veryactive",
  ]),
  additionalInfo: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof formSchema>;

function mapActivityLevel(level: string): ActivityLevel {
  switch (level) {
    case "sedentary":
      return "LOW";
    case "light":
    case "moderate":
      return "MEDIUM";
    case "active":
    case "veryactive":
      return "HIGH";
    default:
      return "LOW";
  }
}

function mapDiet(diet: string): Diet {
  switch (diet) {
    case "vegetarian":
      return "VEGETARIAN";
    case "vegan":
      return "VEGAN";
    case "keto":
      return "KETO";
    case "lowcarb":
      return "LOW_CARB";
    case "glutenfree":
      return "GLUTEN_FREE";
    case "dairyfree":
      return "DAIRY_FREE";
    default:
      return "OTHER";
  }
}

function mapAllergies(allergies: string[]): Allergy[] {
  return [...allergies].map((allergy) => {
    switch (allergy) {
      case "dairy":
        return Allergy.DAIRY;
      case "eggs":
        return Allergy.EGGS;
      case "gluten":
        return Allergy.GLUTEN;
      case "lactose":
        return Allergy.LACTOSE;
      case "latex":
        return Allergy.LATEX;
      case "nuts":
        return Allergy.NUTS;
      case "peanuts":
        return Allergy.PEANUTS;
      case "pollen":
        return Allergy.POLLEN;
      case "seafood":
        return Allergy.SEAFOOD;
      case "soy":
        return Allergy.SOY;
      default:
        return Allergy.OTHER;
    }
  });
}

function mapMedications(medications: string[]): Medication[] {
  return [...medications].map((medication) => {
    switch (medication) {
      case "antibiotics":
        return Medication.ANTIBIOTICS;
      case "antihistamines":
        return Medication.ANTIBIOTICS;
      case "antidepressants":
        return Medication.OTHER;
      case "painkillers":
        return Medication.IBUPROFEN;
      case "bloodpressure":
        return Medication.BLOOD_PRESSURE_MEDICATION;
      case "diabetes":
        return Medication.INSULIN;
      case "other":
      default:
        return Medication.OTHER;
    }
  });
}

export default function PatientOnboarding() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const defaultValues: Partial<ProfileFormValues> = {
    sex: "male",
    age: undefined,
    height: undefined,
    weight: undefined,
    allergies: [],
    medications: [],
    medicalHistory: [],
    additionalMedicalHistory: "",
    diet: "regular",
    activityLevel: "moderate",
    additionalInfo: "",
  };

  const { user, isLoaded } = useUser();
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  // Fetch patient data on component mount
  useEffect(() => {
    async function fetchPatientData() {
      if (!isLoaded || !user) return;

      try {
        const result = await getPatientByUserId(user.id);

        if (result.success && result.patient) {
          // Map database values back to form values
          const patient = result.patient;

          // Convert boolean sex to string
          const sexValue = patient.sex ? "male" : "female";

          // Map activity level enum back to form value
          let activityLevelValue = "moderate";
          if (patient.activityLevel === "LOW") activityLevelValue = "sedentary";
          else if (patient.activityLevel === "MEDIUM") activityLevelValue = "moderate";
          else if (patient.activityLevel === "HIGH") activityLevelValue = "active";

          // Map diet enum back to form value (use the first one if there's an array)
          let dietValue = "regular";
          if (patient.diet && patient.diet.length > 0) {
            const dietEnum = patient.diet[0];
            if (dietEnum === "VEGETARIAN") dietValue = "vegetarian";
            else if (dietEnum === "VEGAN") dietValue = "vegan";
            else if (dietEnum === "KETO") dietValue = "keto";
            else if (dietEnum === "LOW_CARB") dietValue = "lowcarb";
            else if (dietEnum === "GLUTEN_FREE") dietValue = "glutenfree";
            else if (dietEnum === "DAIRY_FREE") dietValue = "dairyfree";
          }

          // Map allergies enum back to string IDs
          const allergiesValue = patient.allergies?.map(allergy => {
            switch (allergy) {
              case "DAIRY": return "dairy";
              case "EGGS": return "eggs";
              case "GLUTEN": return "gluten";
              case "PEANUTS": return "peanuts";
              case "SOY": return "soy";
              default: return "";
            }
          }).filter(Boolean) || [];

          // Map medications enum back to string IDs
          const medicationsValue = patient.medications?.map(medication => {
            switch (medication) {
              case "ANTIBIOTICS": return "antibiotics";
              case "IBUPROFEN": return "painkillers";
              case "BLOOD_PRESSURE_MEDICATION": return "bloodpressure";
              case "INSULIN": return "diabetes";
              default: return "other";
            }
          }) || [];

          // Reset form with patient data
          form.reset({
            sex: sexValue as "male" | "female" | "other",
            age: patient.age || undefined,
            height: patient.height || undefined,
            weight: patient.weight || undefined,
            allergies: allergiesValue,
            medications: medicationsValue,
            medicalHistory: [],
            additionalMedicalHistory: "",
            diet: dietValue as any,
            activityLevel: activityLevelValue as any,
            additionalInfo: patient.additionalInfo || "",
          });
        }
      } catch (error) {
        console.error("Error fetching patient data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchPatientData();
  }, [isLoaded, user, form]);

  function onSubmit(data: ProfileFormValues) {
    if (!isLoaded || !user) return;
    setIsSubmitting(true);

    const patientData = {
      sex: data.sex === "male",
      age: data.age,
      height: data.height,
      weight: data.weight,
      activityLevel: mapActivityLevel(data.activityLevel),
      allergies: mapAllergies(data.allergies ?? []),
      medications: mapMedications(data.medications ?? []),
      diet: [mapDiet(data.diet)],
      additionalInfo: data.additionalInfo,
      firstName: user.firstName ?? null,
      lastName: user.lastName ?? null,
      email: user.primaryEmailAddress?.emailAddress ?? null,
      healthIssues: [],
      heartRate: null,
      bloodPressure: null,
    };

    createPatient(user.id, patientData)
      .then((result) => {
        if (result.success) {
          window.location.href = "/patient";
        } else {
          console.error(result.error);
        }
      })
      .catch((err) => {
        console.error("Error creating patient profile:", err);
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  }

  if (isLoading && isLoaded) {
    return (
      <Card className="h-full overflow-auto">
        <CardHeader>
          <CardTitle>Loading Your Health Profile</CardTitle>
          <CardDescription>
            Please wait while we load your information...
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="h-full overflow-auto">
      <CardHeader>
        <CardTitle>Complete Your Health Profile</CardTitle>
        <CardDescription>
          Provide your health information to help us provide better care.
        </CardDescription>
      </CardHeader>
      <CardContent>
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
                          <FormLabel className="font-normal">Male</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="female" />
                          </FormControl>
                          <FormLabel className="font-normal">Female</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="other" />
                          </FormControl>
                          <FormLabel className="font-normal">Other</FormLabel>
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

              {/* Height */}
              <FormField
                control={form.control}
                name="height"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Height (cm)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Weight */}
              <FormField
                control={form.control}
                name="weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Weight (kg)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Allergies */}
            <FormField
              control={form.control}
              name="allergies"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel className="text-base">Allergies</FormLabel>
                    <FormDescription>
                      Select any allergies you have.
                    </FormDescription>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {ALLERGIES.map((item) => (
                      <FormField
                        key={item.id}
                        control={form.control}
                        name="allergies"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={item.id}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(item.id)}
                                  onCheckedChange={(checked: boolean) => {
                                    return checked
                                      ? field.onChange([
                                          ...(field.value || []),
                                          item.id,
                                        ])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== item.id
                                          )
                                        );
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                {item.label}
                              </FormLabel>
                            </FormItem>
                          );
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Medications */}
            <FormField
              control={form.control}
              name="medications"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel className="text-base">
                      Current Medications
                    </FormLabel>
                    <FormDescription>
                      Select any medications you are currently taking.
                    </FormDescription>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {MEDICATIONS.map((item) => (
                      <FormField
                        key={item.id}
                        control={form.control}
                        name="medications"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={item.id}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(item.id)}
                                  onCheckedChange={(checked: boolean) => {
                                    return checked
                                      ? field.onChange([
                                          ...(field.value || []),
                                          item.id,
                                        ])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== item.id
                                          )
                                        );
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                {item.label}
                              </FormLabel>
                            </FormItem>
                          );
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Medical History */}
            <FormField
              control={form.control}
              name="additionalMedicalHistory"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Medical History</FormLabel>
                  <FormDescription>
                    List any past surgeries, major illnesses, or conditions.
                  </FormDescription>
                  <FormControl>
                    <Textarea
                      placeholder="E.g., Appendectomy in 2015, Asthma diagnosis in 2010..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Diet */}
            <FormField
              control={form.control}
              name="diet"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Diet</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your diet type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {DIETS.map((diet) => (
                        <SelectItem key={diet.value} value={diet.value}>
                          {diet.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Activity Level */}
            <FormField
              control={form.control}
              name="activityLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Physical Activity Level</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your activity level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {ACTIVITY_LEVELS.map((level) => (
                        <SelectItem key={level.value} value={level.value}>
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Additional Info */}
            <FormField
              control={form.control}
              name="additionalInfo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Anything Else We Should Know?</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add any other health-related information..."
                      className="min-h-[100px]"
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
