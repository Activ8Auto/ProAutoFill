"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Grid,
  Typography,
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

export default function ProfileForm() {
  const { token, userId } = useAuthStore();
  const addProfile = useAutomationProfileStore((state) => state.addProfile);

  const [rotationOptions, setRotationOptions] = useState([
    "NR605 - Outpatient Psychiatry",
    "NR606 - Inpatient Psychiatry",
    "NR607 - Telehealth Mental Health",
  ]);

  const [facultyOptions, setFacultyOptions] = useState([
    "Kimberly Sena (Faculty)",
    "Dr. Robert Lee (Faculty)",
    "Angel Julmy (Preceptor)",
  ]);

  const [preceptorList, setPreceptorList] = useState([
    "Angel Julmy (Preceptor)",
    "Laura Geller (Preceptor)",
    "Joseph Santiago (Preceptor)",
  ]);

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

  const [diagnosisOptions, setDiagnosisOptions] = useState<DiagnosisEntry[]>(
    []
  );

  const [ageRanges, setAgeRanges] = useState([
    { range: "5-12 years", weight: 0 },
    { range: "13-17 years", weight: 0 },
    { range: "18-21 years", weight: 0 },
    { range: "22-35 years", weight: 0 },
    { range: "36-55 years", weight: 0 },
    { range: "56-64 years", weight: 0 },
    { range: "65-75 years", weight: 0 },
    { range: "76-85 years", weight: 0 },
    { range: "85+ years", weight: 0 },
  ]);
  const [functionLevels, setFunctionLevels] = useState([
    { level: "100% student", weight: 25 },
    { level: "75% student", weight: 25 },
    { level: "50% student", weight: 25 },
    { level: "25% student", weight: 25 },
  ]);

  const [ageWeights, setAgeWeights] = useState<number[]>(
    Array(ageRanges.length).fill(0)
  );

  useEffect(() => {
    const loadDiagnoses = async () => {
      try {
        if (!token) {
          throw new Error("No token available");
        }
        const data = await fetchDiagnosisOptions(token);
        setDiagnosisOptions(data);
      } catch (err) {
        console.error("Failed to fetch diagnosis options:", err);
      }
    };

    loadDiagnoses();
  }, [token]);


  const handleSaveDefaults = async () => {
    const defaults = {
      faculty: defaultFaculty,
      preceptor: defaultPreceptor,
      rotation: defaultRotation,
    };

    try {
      await updateUserDefaults(defaults, userId, token); // replace with actual user ID
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
    ageRanges: [], // NEW
    studentFunctionWeights: [
      { level: "100% student", weight: 25 },
      { level: "75% student", weight: 25 },
      { level: "50% student", weight: 25 },
      { level: "25% student", weight: 25 },
    ], // NEW
    durationOptions: ["30 Minutes", "1 Hour"],
    durationWeights: [80, 20],
  });
  
  const handleSubmit = async () => {
    // Create a new profile data object without userId
    const newProfileData = {
      name: form.name,
      targetHours: Number(form.targetHours),
      selectedDate: form.selectedDate,
      minWait: Number(form.minWait),
      maxWait: Number(form.maxWait),
      runHeadless: form.runHeadless,
      maxDiagnoses: 3,
      siteType: form.siteType,
      rotation: form.rotation,
      faculty: form.faculty,
      visitType: form.visitType,
      age_ranges: form.ageRanges,
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
    };

    console.log("Sending profile data:", newProfileData);

    try {
      const savedProfile = await createProfile(newProfileData, token!);
      console.log("Server response:", savedProfile);
      addProfile(savedProfile);
      alert("Profile saved!");
    } catch (err) {
      console.error("Failed to save profile:", err);
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h6" gutterBottom>
        Create Automation Profile
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <CustomTextField
            label="Profile Name"
            fullWidth
            value={form.name}
            onChange={(e) => handleChange("name", e.target.value)}
          />
        </Grid>
        {/* Min Wait Input */}
        <Grid item xs={6}>
          <CustomTextField
            label="Min Wait (sec)"
            type="number"
            fullWidth
            value={form.minWait}
            onChange={(e) => handleChange("minWait", parseInt(e.target.value))}
          />
        </Grid>
        {/* Max Wait Input */}
        <Grid item xs={6}>
          <CustomTextField
            label="Max Wait (sec)"
            type="number"
            fullWidth
            value={form.maxWait}
            onChange={(e) => handleChange("maxWait", parseInt(e.target.value))}
          />
        </Grid>

        <Grid item xs={6}>
          <CustomTextField
            label="Target Hours"
            type="number"
            fullWidth
            value={form.targetHours}
            onChange={(e) =>
              handleChange("targetHours", parseFloat(e.target.value))
            }
          />
        </Grid>
        <Grid item xs={6} display="flex" alignItems="center">
          <FormControlLabel
            control={
              <Switch
                checked={form.runHeadless}
                onChange={(e) => handleChange("runHeadless", e.target.checked)}
              />
            }
            label="Run Headless"
          />
        </Grid>
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Visit Info
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <DatePicker
            label="Select Form Date"
            value={form.selectedDate ? new Date(form.selectedDate) : null}
            onChange={(date: Date | null) => {
              handleChange(
                "selectedDate",
                date ? format(date, "yyyy-MM-dd") : ""
              );
            }}
            slotProps={{ textField: { fullWidth: true } }}
          />
        </Grid>

        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom>
            Visit Duration + Weight (%)
          </Typography>
          <Typography variant="body2" gutterBottom>
            -Assigns weights to each option by percent- these control how often
            each is selected
          </Typography>
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
                  onChange={(e) => {
                    const updated = [...form.durationWeights];
                    updated[index] = parseInt(e.target.value);
                    setDurationWeights(updated);
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

        {["rotation", "faculty"].map((field) => (
          <Grid item xs={12} key={field}>
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              mb={1}
            >
              <Typography>
                {field === "rotation" ? "Scheduled Rotation" : "Faculty"}
              </Typography>
              <Box>
                <Button
                  size="small"
                  onClick={() => {
                    if (field === "rotation") setDefaultRotation(form.rotation);
                    if (field === "faculty") setDefaultFaculty(form.faculty);
                  }}
                >
                  Set as Default
                </Button>
              </Box>
            </Box>
            <CustomTextField
              select
              fullWidth
              value={form[field] as string}
              onChange={(e) => handleChange(field, e.target.value)}
            >
              {(field === "rotation" ? rotationOptions : facultyOptions).map(
                (opt) => (
                  <MenuItem key={opt} value={opt}>
                    {opt}
                  </MenuItem>
                )
              )}
            </CustomTextField>
          </Grid>
        ))}

        <Grid item xs={12}>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            mb={1}
          >
            <Typography>Preceptor</Typography>
            <Button
              size="small"
              onClick={() => setDefaultPreceptor(form.preceptor)}
            >
              Set as Default
            </Button>
          </Box>
          <CustomTextField
            select
            fullWidth
            value={form.preceptor}
            onChange={(e) => handleChange("preceptor", e.target.value)}
          >
            {preceptorList.map((opt) => (
              <MenuItem key={opt} value={opt}>
                {opt}
              </MenuItem>
            ))}
          </CustomTextField>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom>
            Age Range Weighting
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={1}>
            Assign weights to each age group by percent — these control how
            often each is selected.
          </Typography>
          <Typography sx={{ fontSize: "0.7rem" }}>
            Example: 5-12 years = 100 then 100 percent of patients outputed will
            be in this age range.
          </Typography>
          <Grid container spacing={1}>
            {ageRanges.map((item, index) => (
              <Grid
                item
                xs={6}
                sm={4}
                key={index}
                display="flex"
                alignItems="center"
                gap={1}
              >
                <Typography variant="body2" sx={{ minWidth: "100px" }}>
                  {item.range}
                </Typography>
                <CustomTextField
                  type="number"
                  size="small"
                  sx={{ maxWidth: 80 }}
                  value={item.weight}
                  onChange={(e) => {
                    const updated = [...ageRanges];
                    updated[index].weight = parseInt(e.target.value);
                    setAgeRanges(updated);
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">%</InputAdornment>
                    ),
                  }}
                />
              </Grid>
            ))}
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <Grid container spacing={2}>
            {/* Visit Mode */}
            <Grid item xs={4}>
              <Typography variant="subtitle2" gutterBottom>
                Visit Mode
              </Typography>
              <CustomTextField
                select
                fullWidth
                value={form.visitType}
                onChange={(e) => handleChange("visitType", e.target.value)}
              >
                <MenuItem value="Face to Face">Face to Face</MenuItem>
                <MenuItem value="Telepsychiatry">Telepsychiatry</MenuItem>
              </CustomTextField>
            </Grid>

            {/* Site Type */}
            <Grid item xs={4}>
              <Typography variant="subtitle2" gutterBottom>
                Site Type
              </Typography>
              <CustomTextField
                select
                fullWidth
                value={form.siteType}
                onChange={(e) => handleChange("siteType", e.target.value)}
              >
                <MenuItem value="Inpatient">Inpatient</MenuItem>
                <MenuItem value="Outpatient">Outpatient</MenuItem>
              </CustomTextField>
            </Grid>

            {/* CPT Visit Code */}
            <Grid item xs={4}>
              <Typography variant="subtitle2" gutterBottom>
                CPT Visit Code
              </Typography>
              <CustomTextField
                fullWidth
                placeholder="e.g. 99214"
                value={form.cptCode}
                onChange={(e) => handleChange("cptCode", e.target.value)}
              />
            </Grid>
          </Grid>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom>
            Student Level of Function (%)
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={1}>
            Assign how often the student is functioning at each level.
          </Typography>

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
                    onChange={(e) => {
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
        </Grid>

        <Grid item xs={12}>
          <Typography variant="h6" mt={4} mb={2}>
            Select Diagnoses to Include
          </Typography>
          {diagnosisOptions.length === 0 ? (
            <Typography>No diagnoses available.</Typography>
          ) : (
            <TableContainer
              component={Paper}
              sx={{
                maxHeight: 400, // Adjust height as needed
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

        <Grid item xs={12} mt={4}>
          <Box display="flex" justifyContent="flex-start">
            <Button variant="contained" onClick={handleSubmit}>
              Save Profile
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
