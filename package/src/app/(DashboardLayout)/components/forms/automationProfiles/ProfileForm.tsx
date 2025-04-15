"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import LoadingSpinner from "@/app/(DashboardLayout)/loading"
import SectionCard from "@/app/(DashboardLayout)/components/shared/SectionCard";
import { parse } from "date-fns";
import Link from "next/link";
import toast from "react-hot-toast";
import { Toaster } from "react-hot-toast";
import ProfileCard from "@/app/(DashboardLayout)/components/forms/automationProfiles/ProfileCard";
import {
  Box,
  Button,
  Grid,
  Typography,
  Snackbar,
  Alert,
  Switch,
  IconButton,
  Paper,
  FormControlLabel,
  TableContainer,
  TableCell,
  TableRow,
  TableBody,
  TableHead,
  Table,
  MenuItem,
} from "@mui/material";
import { updateUserDefaults } from "@/lib/api";
import type { AutomationProfileStore } from "@/store/automationProfileStore";
import InputAdornment from "@mui/material/InputAdornment";
import CustomTextField from "@/app/(DashboardLayout)/components/forms/theme-elements/CustomTextField";
import AddIcon from "@mui/icons-material/Add";
import { useAutomationProfileStore } from "@/store/automationProfileStore";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import { AutomationProfile } from "@/store/automationProfileStore";
import { DatePicker } from "@mui/x-date-pickers";
import { format } from "date-fns";
import { createProfile } from "@/lib/api";
import { DiagnosisEntry } from "@/types/diagnosis";
import DiagnosisSelector from "@/app/(DashboardLayout)/components/forms/dictionaryForm/DiagnosisSelector";
import { fetchDiagnosisOptions } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import Loading from "@/app/loading";

export default function ProfileForm() {
  const { token, userId } = useAuthStore();
  const profiles = useAutomationProfileStore(
    (state: AutomationProfileStore) => state.profiles
  );
  const [loadingProfileInfo, setLoadingProfileInfo] = useState(true);
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoadingProfileInfo(true); // Start loading
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/users/${userId}/profile-info/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const { profile_info } = await res.json();
        if (profile_info) {
          setForm((prev) => ({
            ...prev,
            preceptor: profile_info.preceptor || "",
            faculty: profile_info.faculty || "",
            rotation: profile_info.scheduledRotation || "",
            dNumber: profile_info.dNumber || "",
            chamberlainPassword: profile_info.chamberlainPassword || "",
          }));
        }
      } catch (err) {
        console.error("Failed to load user profile_info", err);
      } finally {
        setLoadingProfileInfo(false); // Stop loading
      }
    };

    if (token && userId) {
      fetchUserProfile();
    }
  }, [token, userId]);
  const addProfile = useAutomationProfileStore((state) => state.addProfile);

  const fetchProfiles = useAutomationProfileStore(
    (state) => state.fetchProfiles
  );

  useEffect(() => {
    if (token) {
      fetchProfiles();
    }
  }, [token, fetchProfiles]);

  const [selectedDiagnoses, setSelectedDiagnoses] = useState<DiagnosisEntry[]>(
    []
  );
  const [showAddRotation, setShowAddRotation] = useState(false);
  const [newRotation, setNewRotation] = useState("");
  const [showAddFaculty, setShowAddFaculty] = useState(false);
  const [newFaculty, setNewFaculty] = useState("");
  const [showAddPreceptor, setShowAddPreceptor] = useState(false);
  const [newPreceptor, setNewPreceptor] = useState("");
  const [selectedPreceptor, setSelectedPreceptor] = useState("");
  const [defaultFaculty, setDefaultFaculty] = useState("");
  const [defaultPreceptor, setDefaultPreceptor] = useState("");
  const [defaultRotation, setDefaultRotation] = useState("");
  const [visitMode, setVisitMode] = useState("");
  const [siteType, setSiteType] = useState("");
  const [cptCode, setCptCode] = useState("");
  const [loadingDiagnoses, setLoadingDiagnoses] = useState(true);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success");
  const [diagnosisOptions, setDiagnosisOptions] = useState<DiagnosisEntry[]>(
    []
  );

  const [ageRanges, setAgeRanges] = useState([
    { range: "5-12 years", weight: 0 },
    { range: "13-17 years", weight: 0 },
    { range: "18-21 years", weight: 10 },
    { range: "22-35 years", weight: 30 },
    { range: "36-55 years", weight: 20 },
    { range: "56-64 years", weight: 20 },
    { range: "65-75 years", weight: 10 },
    { range: "76-85 years", weight: 0 },
    { range: "85+ years", weight: 0 },
  ]);
  const [functionLevels, setFunctionLevels] = useState([
    { level: "100% Student", weight: 0 },
    { level: "75% Student", weight: 25 },
    { level: "50% Student", weight: 50 },
    { level: "25% Student", weight: 25 },
  ]);

  const [ageWeights, setAgeWeights] = useState<number[]>(
    Array(ageRanges.length).fill(0)
  );

  useEffect(() => {
    const loadDiagnoses = async () => {
      try {
        setLoadingDiagnoses(true); // ✅ start loading
        if (!token) throw new Error("No token available");
  
        const data = await fetchDiagnosisOptions(token);
        setDiagnosisOptions(data);
      } catch (err) {
        console.error("Failed to fetch diagnosis options:", err);
      } finally {
        setLoadingDiagnoses(false); // ✅ stop loading
      }
    };
  
    if (token) {
      loadDiagnoses();
    }
  }, [token]);

  const handleSaveDefaults = async () => {
    if (!userId || !token) {
      console.error("Missing userId or token");
      return;
    }

    const defaults = {
      faculty: defaultFaculty,
      preceptor: defaultPreceptor,
      rotation: defaultRotation,
    };

    try {
      await updateUserDefaults(defaults, userId, token);
      alert("Defaults saved!");
    } catch (err) {
      console.error("Failed to save defaults:", err);
    }
  };
  const handleChange = (field: string, value: string | number | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };
  const [form, setForm] = useState({
    name: "",
    targetHours: 1,
    preceptor: "",
    selectedDate: "",
    minWait: 10,
    maxWait: 30,
    runHeadless: true,
    maxDiagnoses: 3,
    rotation: "",
    faculty: "",
    visitType: "",
    siteType: "",
    cptCode: "",
    siteLocation: "",
    gender: "",
    race: "",
    complexity: "",
    dNumber: "",
    chamberlainPassword: "",
    ageRanges: [], // NEW
    studentFunctionWeights: [
      { level: "100% Student", weight: 25 },
      { level: "75% Student", weight: 25 },
      { level: "50% Student", weight: 25 },
      { level: "25% Student", weight: 25 },
    ], // NEW
    durationOptions: ["30 Minutes", "1 Hour"],
    durationWeights: [80, 20],
  });

  const handleSubmit = async () => {
    // Create a new profile data object without userId
    const newProfileData = {
      name: form.name,
      targetHours: Number(form.targetHours),
      selectedDate: form.selectedDate || format(new Date(), "yyyy-MM-dd"),
      minWait: Number(form.minWait),
      maxWait: Number(form.maxWait),
      runHeadless: form.runHeadless,
      maxDiagnoses: 3,
      siteType: form.siteType,
      rotation: form.rotation,
      faculty: form.faculty,
      visitType: form.visitType,
      age_ranges: ageRanges,
      gender: [
        { gender: "Male", weight: 49 },
        { gender: "Female", weight: 49 },
        { gender: "Transgender man/trans man", weight: 0.5 },
        { gender: "Transgender woman/trans woman", weight: 0.5 },
      ],
      race: [
        { race: "Caucasian", weight: 75 },
        { race: "African American", weight: 5 },
        { race: "Hispanic", weight: 15 },
        { race: "Asian", weight: 5 },
      ],
      siteLocation: "Outpatient Clinic",
      cptCode: form.cptCode,
      student_function_weights: form.studentFunctionWeights,
      complexity: [
        {
          level:
            "Straightforward/Low complexity (1 or 2 minor acute problems or exacerbation of a chronic problem requiring intervention, stable, responsive to treatments)",
          weight: 75,
        },
        {
          level:
            "Moderate complexity (multiple acute or chronic issues that require ongoing intervention, stable, responsive to treatments)",
          weight: 20,
        },
        {
          level:
            "High complexity (multiple acute and/or chronic issues that require ongoing intervention, unstable or labile, generally not responding to standard treatment measures)",
          weight: 5,
        },
      ],
      durationOptions: form.durationOptions,
      durationWeights: form.durationWeights,
      preceptor: form.preceptor,
      diagnoses: selectedDiagnoses,
      dNumber: form.dNumber,
      chamberlainPassword: form.chamberlainPassword,
    };

    console.log("Sending profile data:", newProfileData);

    try {
      const savedProfile = await createProfile(newProfileData, token!);
      console.log("Server response:", savedProfile);
      // addProfile(savedProfile);
      toast.success("Profile saved!");
      await fetchProfiles();
    } catch (err) {
      console.error("Failed to save profile:", err);
      toast.error("Failed to save profile.");
    }
  };
  const handleSnackbarClose = (
    event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbarOpen(false);
  };
  return (
    <Box p={3}>
      
      {/* Section 1: Create Automation Profile - Profile Name */}
      <SectionCard title="Create Automation Profile">
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <CustomTextField
              label="Profile Name"
              fullWidth
              value={form.name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleChange("name", e.target.value)
              }
            />
          </Grid>
        </Grid>
      </SectionCard>
  
      {/* Section 2: Visit Info - Form Date and Visit Duration/Weight */}
      <SectionCard title="Visit Info">
        <Grid container spacing={2}>
          {/* <Grid item xs={12}>
            <DatePicker
              label="Select Form Date"
              value={
                form.selectedDate
                  ? parse(form.selectedDate, "yyyy-MM-dd", new Date())
                  : null
              }
              onChange={(date: Date | null) => {
                handleChange("selectedDate", date ? format(date, "yyyy-MM-dd") : "");
              }}
              slotProps={{ textField: { fullWidth: true } }}
            />
          </Grid> */}
          <Grid item xs={12}>
            <Typography
              variant="subtitle1"
              gutterBottom
              sx={{ textDecoration: "underline" }}
            >
              Visit Duration + Weight (%)
            </Typography>
            <Typography variant="body2" gutterBottom>
              -Assigns weights to each option by percent- these control how often each is selected
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Box display="flex" flexDirection="column" gap={1}>
              {form.durationOptions.map((duration, index) => (
                <Box key={duration} display="flex" alignItems="center" gap={2}>
                  <Typography sx={{ minWidth: "150px" }} variant="body2">
                    {duration}
                  </Typography>
                  <CustomTextField
                    type="number"
                    size="small"
                    value={form.durationWeights[index]}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const updated = [...form.durationWeights];
                      updated[index] = parseInt(e.target.value);
                      setForm((prev) => ({
                        ...prev,
                        durationWeights: updated,
                      }));
                    }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">%</InputAdornment>
                      ),
                    }}
                  />
                </Box>
              ))}
            </Box>
          </Grid>
        </Grid>
      </SectionCard>
  
      {/* Section 3: Profile Defaults - Rotation, Faculty, Preceptor */}
      <SectionCard title="Profile Defaults">
        <Grid container spacing={2}>
          {loadingProfileInfo ? (
            <Grid item xs={12}>
              <LoadingSpinner />
            </Grid>
          ) : (
            (["rotation", "faculty", "preceptor"] as const).map((field) => {
              // Note: it's better to move useRouter() call outside the map.
              const router = useRouter();
              const label =
                field === "rotation"
                  ? "Scheduled Rotation "
                  : field === "faculty"
                  ? "Faculty "
                  : "Preceptor ";
  
              return (
                <Grid item xs={12} key={field}>
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                    mb={1}
                  >
                    <Typography sx={{ textDecoration: "underline" }}>
                      {label}
                      <Button
                        variant="text"
                        onClick={() => router.push("/account")}
                        sx={{
                          textDecoration: "underline",
                          color: "primary.main",
                          padding: 0,
                          minWidth: 0,
                          textTransform: "none",
                          display: "inline",
                        }}
                      >
                        (Change in Profile)
                      </Button>
                    </Typography>
                  </Box>
                  {form[field] ? (
                    <Typography fontWeight={500} fontSize="0.9rem" sx={{ opacity: 0.6 }}>
                      {form[field]}
                    </Typography>
                  ) : (
                    <Box textAlign="center" mt={2}>
                      <Typography
                        color="error"
                        fontSize="1.2rem"
                        fontWeight="bold"
                        textAlign="center"
                      >
                        No {field === "rotation" ? "Scheduled Rotation" : field === "faculty" ? "Faculty" : "Preceptor"} set.
                        <br />
                        Please update this in your{" "}
                        <Button
                          variant="text"
                          onClick={() => router.push("/account")}
                          sx={{
                            textDecoration: "underline",
                            color: "#d32f2f",
                            fontWeight: "bold",
                            textTransform: "none",
                            padding: 0,
                            minWidth: 0,
                          }}
                        >
                          My Profile
                        </Button>{" "}
                        page.
                      </Typography>
                    </Box>
                  )}
                </Grid>
              );
            })
          )}
        </Grid>
      </SectionCard>
  
      {/* Section 4: Age Range Weighting */}
      <SectionCard title="Age Range Weighting">
        <Grid container spacing={1}>
          {ageRanges.map((item, index) => (
            <Grid item xs={6} sm={4} key={index} display="flex" alignItems="center" gap={1}>
              <Typography variant="body2" sx={{ minWidth: "100px" }}>
                {item.range}
              </Typography>
              <CustomTextField
                type="number"
                size="small"
                sx={{ maxWidth: 80 }}
                value={item.weight}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const updated = [...ageRanges];
                  updated[index].weight = parseInt(e.target.value);
                  setAgeRanges(updated);
                }}
                InputProps={{
                  style: { fontSize: "0.7rem" },
                  endAdornment: (
                    <InputAdornment position="end">%</InputAdornment>
                  ),
                }}
              />
            </Grid>
          ))}
        </Grid>
      </SectionCard>
  
      {/* Section 5: Visit & Site Info */}
      <SectionCard title="Visit & Site Info">
        <Grid container spacing={2}>
          <Grid item xs={4}>
            <Typography variant="subtitle2" gutterBottom sx={{ textDecoration: "underline" }}>
              Visit Mode
            </Typography>
            <CustomTextField
              select
              fullWidth
              value={form.visitType}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleChange("visitType", e.target.value)
              }
            >
              <MenuItem value="Face to Face">Face to Face</MenuItem>
              <MenuItem value="Telepsychiatry">Telepsychiatry</MenuItem>
            </CustomTextField>
          </Grid>
          <Grid item xs={4}>
            <Typography variant="subtitle2" gutterBottom sx={{ textDecoration: "underline" }}>
              Site Type
            </Typography>
            <CustomTextField
              select
              fullWidth
              value={form.siteType}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleChange("siteType", e.target.value)
              }
            >
              <MenuItem value="Inpatient">Inpatient</MenuItem>
              <MenuItem value="Outpatient">Outpatient</MenuItem>
            </CustomTextField>
          </Grid>
          <Grid item xs={4}>
            <Typography variant="subtitle2" gutterBottom sx={{ textDecoration: "underline" }}>
              CPT Visit Code
            </Typography>
            <CustomTextField
              fullWidth
              placeholder="e.g. 99214"
              value={form.cptCode}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleChange("cptCode", e.target.value)
              }
            />
          </Grid>
        </Grid>
      </SectionCard>
  
      {/* Section 6: Student Level of Function */}
      <SectionCard title="Student Level of Function (%)">
        <Grid container spacing={2}>
          {form.studentFunctionWeights.map((entry, index) => (
            <Grid item xs={12} sm={6} md={3} key={entry.level}>
              <Box display="flex" alignItems="center" gap={1}>
                <Typography variant="body2" minWidth="120px">
                  {entry.level}
                </Typography>
                <CustomTextField
                  type="number"
                  value={entry.weight}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const updated = [...form.studentFunctionWeights];
                    updated[index].weight = parseInt(e.target.value) || 0;
                    setFunctionLevels(updated);
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">%</InputAdornment>
                    ),
                  }}
                  size="small"
                />
              </Box>
            </Grid>
          ))}
        </Grid>
      </SectionCard>
  
      {/* Section 7: Diagnoses Selection */}
      <SectionCard title="Select Diagnoses to Include">
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Select Diagnoses to Include
            </Typography>
          </Grid>
          <Grid item xs={12}>
            {loadingDiagnoses ? (
              <LoadingSpinner />
            ) : diagnosisOptions.length === 0 ? (
              <Typography>No diagnoses available.</Typography>
            ) : (
              <TableContainer
                component={Paper}
                sx={{
                  maxHeight: 400,
                  overflowY: "auto",
                  border: "1px solid #e0e0e0",
                }}
              >
                <Box display="flex" justifyContent="flex-end" p={1}>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => setSelectedDiagnoses(diagnosisOptions)}
                  >
                    Select All Diagnoses
                  </Button>
                </Box>
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>
                        <strong>Select</strong>
                      </TableCell>
                      <TableCell>
                        <strong>Name</strong>
                      </TableCell>
                      <TableCell>
                        <strong>ICD Code</strong>
                      </TableCell>
                      <TableCell>
                        <strong>Physical Exams</strong>
                      </TableCell>
                      <TableCell>
                        <strong>Current Meds</strong>
                      </TableCell>
                      <TableCell>
                        <strong>Lab Tests</strong>
                      </TableCell>
                      <TableCell>
                        <strong>Teaching</strong>
                      </TableCell>
                      <TableCell>
                        <strong>Prescribed Meds</strong>
                      </TableCell>
                      <TableCell>
                        <strong>Exclusion Group</strong>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {diagnosisOptions.map((diagnosis) => {
                      const isSelected = selectedDiagnoses.some(
                        (d) =>
                          d.name === diagnosis.name &&
                          d.icd_code === diagnosis.icd_code
                      );
  
                      const handleToggle = () => {
                        if (isSelected) {
                          setSelectedDiagnoses((prev) =>
                            prev.filter(
                              (d) =>
                                !(
                                  d.name === diagnosis.name &&
                                  d.icd_code === diagnosis.icd_code
                                )
                            )
                          );
                        } else {
                          setSelectedDiagnoses((prev) => [...prev, diagnosis]);
                        }
                      };
  
                      return (
                        <TableRow key={diagnosis.name + diagnosis.icd_code}>
                          <TableCell>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={handleToggle}
                            />
                          </TableCell>
                          <TableCell>{diagnosis.name}</TableCell>
                          <TableCell>{diagnosis.icd_code}</TableCell>
                          <TableCell>
                            {diagnosis.physical_exam?.join(", ") || "None"}
                          </TableCell>
                          <TableCell>
                            {diagnosis.current_medications?.join(", ") || "None"}
                          </TableCell>
                          <TableCell>
                            {diagnosis.laboratory_tests?.join(", ") || "None"}
                          </TableCell>
                          <TableCell>
                            {diagnosis.teaching_provided?.join(", ") || "None"}
                          </TableCell>
                          <TableCell>
                            {diagnosis.medications?.join(", ") || "None"}
                          </TableCell>
                          <TableCell>
                            {diagnosis.exclusion_group || "None"}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Grid>
          <Grid item xs={12}>
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => (window.location.href = "/automation-dictionary")}
              sx={{ mt: 2 }}
            >
              Manage Diagnosis Profiles
            </Button>
          </Grid>
        </Grid>
      </SectionCard>
      
  <Box display="flex" justifyContent="center" p={4}>
  
    <Button variant="contained" sx={{ fontSize: '1.2rem', padding: '12px 24px' }} onClick={handleSubmit}>
      Save Profile
    </Button>
   
  </Box>

  
      {/* Section 8: Your Saved Profiles */}
      <SectionCard title="Your Saved Profiles">
        <Box mt={2}>
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
      </SectionCard>
      <Toaster
     
       toastOptions={{
        position: "bottom-center",
         style: {
           fontSize: "40px", // Set desired font size
           // You can also set other styles, e.g., padding, background, etc.
         },
       }}
      />
    </Box>
    
  );
}  