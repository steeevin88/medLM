"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Activity, Dumbbell, Timer, Footprints, Award, TrendingUp } from "lucide-react";

export default function ActivityExercise() {
  // Dummy activity data
  const activityData = {
    today: {
      steps: 7842,
      stepsGoal: 10000,
      distance: 3.8,
      calories: 297,
      activeMinutes: 42,
      activeMinutesGoal: 60
    },
    week: {
      averageSteps: 8345,
      totalDistance: 26.2,
      totalCalories: 2105,
      totalActiveMinutes: 312,
      exerciseDays: 5
    },
    exercises: [
      {
        id: 1,
        name: "Morning Run",
        type: "Running",
        duration: "32 min",
        distance: "3.2 miles",
        calories: 285,
        date: "Today, 7:30 AM",
        intensity: "Moderate"
      },
      {
        id: 2,
        name: "Strength Training",
        type: "Weight Training",
        duration: "45 min",
        distance: "-",
        calories: 320,
        date: "Yesterday, 6:15 PM",
        intensity: "High"
      },
      {
        id: 3,
        name: "Yoga Session",
        type: "Yoga",
        duration: "30 min",
        distance: "-",
        calories: 120,
        date: "Yesterday, 8:00 AM",
        intensity: "Low"
      },
      {
        id: 4,
        name: "Evening Walk",
        type: "Walking",
        duration: "28 min",
        distance: "1.5 miles",
        calories: 130,
        date: "2 days ago, 7:00 PM",
        intensity: "Low"
      }
    ]
  };
  
  const dailyGoals = [
    { name: "Steps", current: activityData.today.steps, goal: activityData.today.stepsGoal, icon: <Footprints className="h-4 w-4" />, unit: "steps" },
    { name: "Active Minutes", current: activityData.today.activeMinutes, goal: activityData.today.activeMinutesGoal, icon: <Timer className="h-4 w-4" />, unit: "min" }
  ];

  const getProgressColor = (percentage: number) => {
    if (percentage < 30) return "bg-red-500";
    if (percentage < 70) return "bg-amber-500";
    return "bg-green-500";
  };

  const getIntensityColor = (intensity: string) => {
    switch(intensity.toLowerCase()) {
      case "low": return "bg-blue-100 text-blue-800";
      case "moderate": return "bg-amber-100 text-amber-800";
      case "high": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card className="h-full overflow-auto">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-blue-500" />
          Activity & Exercise
        </CardTitle>
        <CardDescription>
          Track your physical activity and exercise routines
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-6">
        <Tabs defaultValue="today">
          <TabsList className="mb-4">
            <TabsTrigger value="today">Today</TabsTrigger>
            <TabsTrigger value="exercises">Exercises</TabsTrigger>
            <TabsTrigger value="stats">Weekly Stats</TabsTrigger>
          </TabsList>

          <TabsContent value="today" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                  <Footprints className="h-8 w-8 text-blue-500 mb-2" />
                  <h3 className="text-3xl font-bold">{activityData.today.steps.toLocaleString()}</h3>
                  <p className="text-sm text-muted-foreground">Steps</p>
                  <p className="text-xs text-muted-foreground mt-1">Goal: {activityData.today.stepsGoal.toLocaleString()}</p>
                  <Progress 
                    value={(activityData.today.steps / activityData.today.stepsGoal) * 100} 
                    className="h-1.5 mt-2 w-full" 
                  />
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                  <TrendingUp className="h-8 w-8 text-green-500 mb-2" />
                  <h3 className="text-3xl font-bold">{activityData.today.distance}</h3>
                  <p className="text-sm text-muted-foreground">Miles</p>
                  <p className="text-xs text-muted-foreground mt-1">Traveled today</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                  <Timer className="h-8 w-8 text-amber-500 mb-2" />
                  <h3 className="text-3xl font-bold">{activityData.today.activeMinutes}</h3>
                  <p className="text-sm text-muted-foreground">Active Minutes</p>
                  <p className="text-xs text-muted-foreground mt-1">Goal: {activityData.today.activeMinutesGoal}</p>
                  <Progress 
                    value={(activityData.today.activeMinutes / activityData.today.activeMinutesGoal) * 100} 
                    className="h-1.5 mt-2 w-full" 
                  />
                </CardContent>
              </Card>
            </div>

            <Card className="overflow-hidden">
              <CardHeader className="py-3">
                <CardTitle className="text-base">Daily Goals Progress</CardTitle>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="space-y-4">
                  {dailyGoals.map((goal, idx) => {
                    const percentage = Math.min(100, Math.round((goal.current / goal.goal) * 100));
                    
                    return (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            {goal.icon}
                            <span className="text-sm font-medium">{goal.name}</span>
                          </div>
                          <span className="text-sm">
                            {goal.current.toLocaleString()} / {goal.goal.toLocaleString()} {goal.unit}
                          </span>
                        </div>
                        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${getProgressColor(percentage)}`} 
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-right text-muted-foreground">{percentage}% completed</p>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-base">Today&apos;s Highlights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <div className="border rounded-lg p-3 text-center">
                    <p className="text-sm text-muted-foreground">Calories Burned</p>
                    <p className="text-2xl font-semibold">{activityData.today.calories}</p>
                  </div>
                  <div className="border rounded-lg p-3 text-center">
                    <p className="text-sm text-muted-foreground">Active Hours</p>
                    <p className="text-2xl font-semibold">{Math.floor(activityData.today.activeMinutes / 60)}</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <Button className="w-full">View Detailed Activity</Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="exercises" className="space-y-6">
            <div className="space-y-4">
              {activityData.exercises.map((exercise) => (
                <Card key={exercise.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <Dumbbell className="h-5 w-5 text-blue-600" />
                          <h3 className="font-medium">{exercise.name}</h3>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{exercise.date}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${getIntensityColor(exercise.intensity)}`}>
                        {exercise.intensity}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mt-4">
                      <div className="text-center p-2 bg-gray-50 rounded-md">
                        <p className="text-xs text-muted-foreground">Duration</p>
                        <p className="font-medium">{exercise.duration}</p>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded-md">
                        <p className="text-xs text-muted-foreground">Distance</p>
                        <p className="font-medium">{exercise.distance}</p>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded-md">
                        <p className="text-xs text-muted-foreground">Calories</p>
                        <p className="font-medium">{exercise.calories}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <Button className="w-full">Add New Exercise</Button>
          </TabsContent>

          <TabsContent value="stats" className="space-y-6">
            <Card>
              <CardHeader className="py-3">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-base">Weekly Summary</CardTitle>
                  <Award className="h-5 w-5 text-amber-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="text-center p-3 border rounded-lg">
                    <p className="text-sm text-muted-foreground">Avg. Steps</p>
                    <p className="text-2xl font-semibold">{activityData.week.averageSteps.toLocaleString()}</p>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <p className="text-sm text-muted-foreground">Total Miles</p>
                    <p className="text-2xl font-semibold">{activityData.week.totalDistance}</p>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <p className="text-sm text-muted-foreground">Active Days</p>
                    <p className="text-2xl font-semibold">{activityData.week.exerciseDays} <span className="text-sm font-normal">/ 7</span></p>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <p className="text-sm text-muted-foreground">Calories</p>
                    <p className="text-2xl font-semibold">{activityData.week.totalCalories.toLocaleString()}</p>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <p className="text-sm text-muted-foreground">Active Minutes</p>
                    <p className="text-2xl font-semibold">{activityData.week.totalActiveMinutes}</p>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <p className="text-sm text-muted-foreground">Avg. Daily Activity</p>
                    <p className="text-2xl font-semibold">{Math.round(activityData.week.totalActiveMinutes / 7)} <span className="text-sm font-normal">min</span></p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">View Full Report</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
} 