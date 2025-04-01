"use client";

import { useEffect } from "react";
import { Box, Typography } from "@mui/material";
import ProfileForm from "@/app/(DashboardLayout)/components/forms/automationProfiles/ProfileForm";
import ProfileCard from "@/app/(DashboardLayout)/components/forms/automationProfiles/ProfileCard";
import {
  AutomationProfile,
  AutomationProfileStore,
  useAutomationProfileStore,
} from "@/store/automationProfileStore";
import { useAuthStore } from "@/store/authStore";

export default function AutomationProfilesPage() {
  const { token } = useAuthStore();

  
  const fetchProfiles = useAutomationProfileStore(
    (state: AutomationProfileStore) => state.fetchProfiles
  );



  return (
    <Box p={4}>
      <Typography variant="h4" gutterBottom>
        Automation Profiles
      </Typography>
      <ProfileForm />
    </Box>
  );
}
