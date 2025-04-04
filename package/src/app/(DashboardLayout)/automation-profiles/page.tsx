"use client";

import { useEffect, useState} from "react";
import { Box, Typography, Button, Modal } from "@mui/material";
import ProfileForm from "@/app/(DashboardLayout)/components/forms/automationProfiles/ProfileForm";
import ProfileCard from "@/app/(DashboardLayout)/components/forms/automationProfiles/ProfileCard";
import AutomationTrigger from "@/app/(DashboardLayout)/components/forms/automationProfiles/AutomationTrigger";
import {
  AutomationProfile,
  AutomationProfileStore,
  useAutomationProfileStore,
} from "@/store/automationProfileStore";
import { useAuthStore } from "@/store/authStore";

export default function AutomationProfilesPage() {
  const { token } = useAuthStore();

  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const fetchProfiles = useAutomationProfileStore(
    (state: AutomationProfileStore) => state.fetchProfiles
  );



  return (
    <Box p={4}>
      <Typography variant="h4" gutterBottom>
        Automation Profiles
      </Typography>
      <ProfileForm />
      <Button variant="contained" onClick={handleOpen}>
    Launch Automation
  </Button>

  <Modal open={open} onClose={handleClose}>
    <Box
      sx={{
        position: "fixed",
        bottom: 0,
        left: 0,
        width: "100%",
        bgcolor: "background.paper",
        boxShadow: 24,
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
        p: 4,
        maxHeight: "80vh",
        overflowY: "auto",
      }}
    >
      <AutomationTrigger />
      <Box mt={2} textAlign="right">
        <Button onClick={handleClose} variant="outlined">
          Close
        </Button>
      </Box>
    </Box>
  </Modal>
    </Box>
  );
}
