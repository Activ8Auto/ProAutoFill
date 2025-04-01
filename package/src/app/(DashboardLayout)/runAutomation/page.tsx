"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  MenuItem,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import { useAuthStore } from "@/store/authStore";
import { useAutomationProfileStore } from "@/store/automationProfileStore";
import CustomTextField from "@/app/(DashboardLayout)/components/forms/theme-elements/CustomTextField";
import { format } from "date-fns";
import toast from "react-hot-toast";

export default function RunAutomationPage() {
  const { token, userId } = useAuthStore();
  const profiles = useAutomationProfileStore((state) => state.profiles);

  const [selectedProfileId, setSelectedProfileId] = useState("");
  const [targetHours, setTargetHours] = useState(1);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleRunAutomation = async () => {
    setConfirmOpen(false);

    if (!selectedProfileId || !token) {
      toast.error("Please select a profile and ensure you're logged in");
      return;
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/automation/run/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            profile_id: selectedProfileId,
          }),
        }
      );
      if (!res.ok) {
        throw new Error("Automation failed");
      }

      toast.success("Automation started successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to start automation");
    }
  };

  const selectedProfile = profiles.find((p) => p.id === selectedProfileId);

  return (
    <Box p={4} maxWidth={600} margin="auto">
      <Typography variant="h4" align="center" fontWeight={700} mb={3}>
        Run Automation
      </Typography>

      <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 3 }}>
        <CustomTextField
          select
          label="Select a Profile"
          fullWidth
          value={selectedProfileId}
          onChange={(e) => setSelectedProfileId(e.target.value)}
          sx={{ mb: 2 }}
        >
          {profiles.map((profile) => (
            <MenuItem key={profile.id} value={profile.id}>
              {profile.name}
            </MenuItem>
          ))}
        </CustomTextField>

        <CustomTextField
          label="Target Hours"
          type="number"
          fullWidth
          value={targetHours}
          onChange={(e) => setTargetHours(Number(e.target.value))}
          sx={{ mb: 2 }}
        />

        <DatePicker
          label="Form Date (Day only)"
          value={selectedDate}
          onChange={(date) => setSelectedDate(date ?? new Date())}
          slotProps={{ textField: { fullWidth: true } }}
        />

        <Box mt={4} display="flex" justifyContent="center">
          <Button
            variant="contained"
            color="primary"
            onClick={() => setConfirmOpen(true)}
            disabled={!selectedProfileId}
          >
            Run Automation
          </Button>
        </Box>
      </Paper>

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Confirm Run</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to run automation for
            <strong> {selectedProfile?.name}</strong>?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button onClick={handleRunAutomation} variant="contained" color="primary">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
