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

export default function AutomationProfilesPage() {
  // Explicitly type the state parameter as AutomationProfileStore
  const profiles = useAutomationProfileStore(
    (state: AutomationProfileStore) => state.profiles
  );
  const fetchProfiles = useAutomationProfileStore(
    (state: AutomationProfileStore) => state.fetchProfiles
  );

  // Fetch profiles from the backend on mount.
  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  return (
    <Box p={4}>
      <Typography variant="h4" gutterBottom>
        Automation Profiles
      </Typography>
      <ProfileForm />
      <Box mt={6}>
        <Typography variant="h5" gutterBottom>
          📂 Your Saved Profiles
        </Typography>
        {profiles.length === 0 ? (
          <Typography color="text.secondary">
            No profiles yet. Go make one!
          </Typography>
        ) : (
          <Box
            display="grid"
            gridTemplateColumns={{
              xs: "1fr",
              md: "1fr 1fr",
              lg: "1fr 1fr 1fr",
            }}
            gap={3}
          >
            {profiles.map((profile: AutomationProfile) => (
              <ProfileCard key={profile.id} profile={profile} />
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
}
