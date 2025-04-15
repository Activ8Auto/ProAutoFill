"use client";

import { useState, useEffect } from "react";
import { Toaster } from "react-hot-toast";
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
import GetMoreInfo from "@/app/(DashboardLayout)/components/GetMoreInfo"
import { updateProfile } from "@/lib/api";
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
      // 1. Update the profile with date + hours
      await updateProfile(
        selectedProfileId,
        {
          selected_date: format(selectedDate, "yyyy-MM-dd"),
          target_hours: targetHours ,
          chosen_minutes: targetHours * 60,
        },
        token
      );

      // 2. Then trigger the automation
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

      if (!res.ok) throw new Error("Automation failed");

      toast.success("Automation Launched, Check For 2 Factor Request!", {
        duration: 4000, // 4 seconds
      });
    } catch (err: any) {
      console.error("Automation error:", err);
      // Use the error message from the response or a fallback
      toast.error(err.message || "Failed, check inputs");
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
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setSelectedProfileId(e.target.value)
          }
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
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setTargetHours(Number(e.target.value))
          }
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
          <Box ml={2}>
          <GetMoreInfo />
          </Box>
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
          <Button
            onClick={handleRunAutomation}
            variant="contained"
            color="primary"
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
      <Toaster
     
       toastOptions={{
        position: "bottom-center",
         style: {
           fontSize: "20px", // Set desired font size
           // You can also set other styles, e.g., padding, background, etc.
         },
       }}
      />
    </Box>
  );
}
