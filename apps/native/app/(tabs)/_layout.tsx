import { Tabs } from "expo-router";
import { House, Target, PoundSterling, TrendingUp } from "lucide-react-native";
import React from "react";
import Colors from "@/constants/colors";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.light.tint,
        tabBarInactiveTintColor: Colors.light.tabIconDefault,
        headerShown: true,
        tabBarStyle: {
          backgroundColor: Colors.light.backgroundSecondary,
          borderTopColor: Colors.light.border,
          borderTopWidth: 1,
        },
        headerStyle: {
          backgroundColor: Colors.light.backgroundSecondary,
        },
        headerTintColor: Colors.light.text,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Baby Steps",
          tabBarIcon: ({ color }) => <Target size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="snowball"
        options={{
          title: "Debt Snowball",
          tabBarIcon: ({ color }) => <TrendingUp size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="income"
        options={{
          title: "Income",
          tabBarIcon: ({ color }) => <PoundSterling size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="budget"
        options={{
          title: "Budget",
          tabBarIcon: ({ color }) => <House size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
