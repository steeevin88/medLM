"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, ActivityIcon, TrendingUp, CalendarClock } from "lucide-react";

export default function HealthVitals() {
  const vitalData = [
    { 
      name: "Heart Rate", 
      value: 72, 
      unit: "bpm", 
      status: "normal",
      history: [68, 75, 71, 72, 70, 73, 72]
    },
    { 
      name: "Blood Pressure", 
      value: "120/80", 
      unit: "mmHg", 
      status: "normal",
      history: ["118/78", "122/82", "119/79", "120/80", "121/81"]
    },
    { 
      name: "Blood Oxygen", 
      value: 98, 
      unit: "%", 
      status: "normal",
      history: [97, 98, 98, 97, 99, 98]
    },
    { 
      name: "Body Temperature", 
      value: 98.6, 
      unit: "°F", 
      status: "normal",
      history: [98.4, 98.7, 98.6, 98.5, 98.6]
    },
    { 
      name: "Weight", 
      value: 158, 
      unit: "lbs", 
      status: "normal",
      history: [160, 159, 158, 158, 157, 158]
    },
  ];

  return (
    <Card className="h-full overflow-auto">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-red-500" />
          Health Vitals
        </CardTitle>
        <CardDescription>
          Track and monitor your important health metrics
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-6">
        <Tabs defaultValue="current">
          <TabsList className="mb-4">
            <TabsTrigger value="current">Current</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
          </TabsList>

          <TabsContent value="current" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {vitalData.map((vital, index) => (
                <Card key={index} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-sm font-medium text-gray-700">{vital.name}</h3>
                        <div className="flex items-baseline mt-1">
                          <span className="text-2xl font-semibold">{vital.value}</span>
                          <span className="ml-1 text-sm text-gray-500">{vital.unit}</span>
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        vital.status === 'normal' 
                          ? 'bg-green-100 text-green-800' 
                          : vital.status === 'high'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                      }`}>
                        {vital.status.charAt(0).toUpperCase() + vital.status.slice(1)}
                      </span>
                    </div>

                    <div className="mt-4">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Low</span>
                        <span>Normal</span>
                        <span>High</span>
                      </div>
                      <Progress value={65} className="h-2" />
                    </div>

                    <p className="text-xs text-gray-500 mt-3">
                      Last updated: Today, 9:45 AM
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-blue-500" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-4">
                <div className="space-y-3">
                  {[
                    { time: "Today, 9:45 AM", message: "Blood pressure measured: 120/80 mmHg" },
                    { time: "Today, 9:44 AM", message: "Heart rate measured: 72 bpm" },
                    { time: "Yesterday, 8:30 PM", message: "Weight recorded: 158 lbs" },
                    { time: "Yesterday, 8:15 AM", message: "Blood oxygen measured: 98%" },
                  ].map((activity, index) => (
                    <div key={index} className="flex items-start gap-3 text-sm border-b last:border-0 pb-2 last:pb-0">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5"></div>
                      <div>
                        <p className="text-gray-700">{activity.message}</p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardContent className="p-4">
                <div className="text-center py-8">
                  <CalendarClock className="w-10 h-10 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-700">Historical data available</h3>
                  <p className="text-gray-500 mt-2 max-w-md mx-auto">
                    View your health metrics over time to track progress and identify trends.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trends">
            <Card>
              <CardContent className="p-4">
                <div className="text-center py-8">
                  <ActivityIcon className="w-10 h-10 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-700">Trending data analysis</h3>
                  <p className="text-gray-500 mt-2 max-w-md mx-auto">
                    See how your health metrics have changed over time with detailed trend analysis.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
} 