"use client";
import React, { useEffect, useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  CircularProgress,
} from "@mui/material";
import { fetchUserProfileInfo, updateUserProfileInfo } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import toast from "react-hot-toast";

const UserProfileForm = () => {
  const token = useAuthStore((state) => state.token);
  const userId = useAuthStore((state) => state.userId);

  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    dNumber: "",
    chamberlainPassword: "",
    preceptor: "",
    scheduledRotation: "",
    faculty: "",
  });
  let data: any;
  useEffect(() => {
    const loadProfileInfo = async () => {
      try {
        if (userId && token) {
          data = await fetchUserProfileInfo(userId, token);
          setFormData((prev) => ({
            ...prev,
            ...data,
          }));
        }
        const info = data?.profile_info || {};
        setFormData((prev) => ({
          ...prev,
          ...info,
        }));
      } catch (err) {
        console.error("Failed to load profile info", err);
      } finally {
        setLoading(false);
      }
    };

    if (userId && token) {
      loadProfileInfo();
    }
  }, [userId, token]);

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!userId || !token) {
      toast.error("Missing user ID or token.");
      return;
    }

    try {
      await updateUserProfileInfo(formData, userId, token);
      toast.success("Profile updated!");
      setIsEditing(false);
    } catch (err) {
      toast.error("Failed to update profile.");
    }
  };

  if (loading) return <CircularProgress />;

  return (
    <Paper sx={{ p: 3, maxWidth: 600, margin: "auto", mt: 4 }}>
      <Box
        sx={{
          backgroundColor: "#fff3cd",
          border: "1px solid #ffeeba",
          borderRadius: 2,
          padding: 2,
          marginBottom: 3,
        }}
      >
        <Typography variant="subtitle2" color="textPrimary" gutterBottom>
          ⚠️ Important:
        </Typography>
        <Typography variant="body2" color="textSecondary">
          The values for <strong>Preceptor</strong>, <strong>Faculty</strong>,
          and <strong>Scheduled Rotation</strong> must exactly match the options
          used in Medtrics.
          <br />
          To get an exact match: open the Medtrics form, right-click the correct
          option, select <em>"Inspect"</em>, and copy the text exactly as it
          appears in the element.
          <br />
          <strong>Do not add extra spaces or change wording.</strong> Medtrics
          requires exact matches.
        </Typography>
      </Box>

      <Typography variant="h5" mb={2}>
        My Profile
      </Typography>

      {isEditing ? (
        <Box display="flex" flexDirection="column" gap={2}>
          <TextField
            label="D#"
            name="dNumber"
            value={formData.dNumber}
            onChange={handleChange}
          />
          <TextField
            label="Chamberlain Password"
            name="chamberlainPassword"
            type="password"
            value={formData.chamberlainPassword}
            onChange={handleChange}
          />
          <TextField
            label="Preceptor"
            name="preceptor"
            value={formData.preceptor}
            onChange={handleChange}
          />
          <TextField
            label="Scheduled Rotation"
            name="scheduledRotation"
            value={formData.scheduledRotation}
            onChange={handleChange}
          />
          <TextField
            label="Faculty"
            name="faculty"
            value={formData.faculty}
            onChange={handleChange}
          />
          <Box display="flex" gap={2}>
            <Button onClick={handleSubmit} variant="contained" color="primary">
              Save
            </Button>
            <Button onClick={() => setIsEditing(false)} variant="outlined">
              Cancel
            </Button>
          </Box>
        </Box>
      ) : (
        <Box display="flex" flexDirection="column" gap={1}>
          <Typography>D#: {formData.dNumber || "—"}</Typography>
          <Typography>Chamberlain Password: ******</Typography>
          <Typography>Preceptor: {formData.preceptor || "—"}</Typography>
          <Typography>
            Scheduled Rotation: {formData.scheduledRotation || "—"}
          </Typography>
          <Typography>Faculty: {formData.faculty || "—"}</Typography>
          <Button
            onClick={() => setIsEditing(true)}
            variant="contained"
            color="primary"
            sx={{ mt: 2, alignSelf: "flex-start" }}
          >
            Edit
          </Button>
        </Box>
      )}
    </Paper>
  );
};

export default UserProfileForm;
