"use client";

import { useState, useEffect } from "react";
import EditIcon from "@mui/icons-material/Edit";
import GetMoreInfo from "@/app/(DashboardLayout)/components/GetMoreInfo"
import {
  Box,
  Button,
  Grid,
  Typography,
  IconButton,
  MenuItem,
  Table,
  TableHead,
  TableBody,
  TableCell,
  TableRow,
  TableContainer,
  Paper,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  fetchDiagnosisOptions,
  createDiagnosis,
  deleteDiagnosis,
  updateDiagnosis,
  updateUserDefaults,
  fetchUserDefaults,
} from "@/lib/api";
import CustomTextField from "@/app/(DashboardLayout)/components/forms/theme-elements/CustomTextField";
import { DiagnosisEntry } from "@/types/diagnosis";
import { useAuthStore } from "@/store/authStore";

// Default diagnosis form values
const defaultForm: DiagnosisEntry = {
  name: "",
  icd_code: "",
  current_medications: [],
  physical_exam: [],
  laboratory_tests: [],
  teaching_provided: [],
  medications: [],
  exclusion_group: "",
  user_id: "",
  id: "", // Ensure id is included in the default form
};

const physicalExamOptions = [
  "Constitutional/Vital Signs",
  "Medication Reconciliation",
  "Musculoskeletal",
  "Neurological",
  "Pain Assessment",
  "Other",
  "N/A",
];

const labTestOptions = [
  "Complete Blood Count (CBC)",
  "Electrolytes",
  "Kidney Function",
  "Liver Function",
  "Pregnancy Test",
  "STI Screening",
  "Thyroid Panel",
  "Vitamin D Level",
  "Urine Drug Screen",
  "Other",
];

const teachingOptions = [
  "Medication Education and Management",
  "Stress Management",
  "Suicide Prevention Education and Management",
  "Tobacco Cessation",
  "Weight Management",
  "Gender Health Promotion",
  "Family Education",
  "Disease Education and Management",
  "Discharge Instructions",
  "Diagnostic Testing",
  "Crisis Intervention",
  "Community Resources",
  "Caregiver Support",
  "Care Coordination",
  "Behavioral Modification",
  "Alcohol/Drug Cessation",
  "Other",
];

const medicationOptions = [
  "ADHD Medications",
  "Antianxiety Medications",
  "Antidepressants",
  "Antipsychotics",
  "Anti-Inflammatory",
  "Contraceptives",
  "Hypolipidemic Agents/Lipid Agents",
  "Dopamine Agonist/Antagonist",
  "Insulin/Other Diabetic Agents",
  "Opioid Dependence Agents",
  "Phosphodiesterase (PDE) Inhibitors",
  "Sleep Medications",
  "Vitamin/Supplements",
  "N/A",
  "Other",
];

interface Props {
  onAdd: (entry: DiagnosisEntry) => void;
  onUpdate?: (entry: DiagnosisEntry) => void;
  initialData?: DiagnosisEntry;
  editMode?: boolean;
  onEdit?: (index: number) => void;
  onCancelEdit?: () => void;
}

export default function DiagnosisForm({
  onAdd,
  onUpdate,
  onEdit,
  initialData,
  editMode = false,
  onCancelEdit,
}: Props) {
  const { token, userId } = useAuthStore();

  const [diagnoses, setDiagnoses] = useState<DiagnosisEntry[]>([]);
  const [form, setForm] = useState<DiagnosisEntry>(initialData ?? defaultForm);
  const [defaultPhysicalExams, setDefaultPhysicalExams] = useState<string[]>(
    []
  );
  const [defaultLabs, setDefaultLabs] = useState<string[]>([]);
  const [defaultTeaching, setDefaultTeaching] = useState<string[]>([]);
  const [defaultMeds, setDefaultMeds] = useState<string[]>([]);

  useEffect(() => {
    if (!token || !userId) return;

    const fetchData = async () => {
      try {
        const [diagnosisData, defaults] = await Promise.all([
          fetchDiagnosisOptions(token),
          fetchUserDefaults(userId, token),
        ]);
        setDiagnoses(diagnosisData);
        const defaultValues = defaults.default_values || {};
        setDefaultPhysicalExams(defaultValues.defaultPhysicalExams || []);
        setDefaultLabs(defaultValues.defaultLabs || []);
        setDefaultTeaching(defaultValues.defaultTeaching || []);
        setDefaultMeds(defaultValues.defaultMeds || []);

        if (!editMode) {
          setForm((prev) => ({
            ...prev,
            physical_exam: defaultValues.defaultPhysicalExams || [],
            laboratory_tests: defaultValues.defaultLabs || [],
            teaching_provided: defaultValues.defaultTeaching || [],
            current_medications: defaultValues.defaultMeds || [],
            user_id: userId,
          }));
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };
    fetchData();
  }, [editMode, token, userId]);

  const sorted = [...diagnoses].sort((a, b) => a.name.localeCompare(b.name));

  const handleAddDiagnosis = async (diagnosis: DiagnosisEntry) => {
    if (!token || !userId) {
      console.error("No authentication token available");
      return;
    }
    try {
      const newDiagnosis = await createDiagnosis(
        { ...diagnosis, user_id: userId },
        token
      );
      setDiagnoses((prev) => [...prev, newDiagnosis]);
      onAdd(newDiagnosis);
    } catch (err) {
      console.error("Error creating diagnosis:", err);
    }
  };

  const handleUpdateDiagnosis = async (
    diagnosisId: string,
    diagnosis: DiagnosisEntry
  ) => {
    if (!token || !userId) {
      console.error("No authentication token available");
      return;
    }
    try {
      const updatedDiagnosis = await updateDiagnosis(
        diagnosisId,
        diagnosis,
        token
      );
      setDiagnoses((prev) =>
        prev.map((d) => (d.id === updatedDiagnosis.id ? updatedDiagnosis : d))
      );
      if (onUpdate) onUpdate(updatedDiagnosis);
    } catch (err) {
      console.error("Error updating diagnosis:", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!token) {
      console.error("No authentication token available");
      return;
    }
    try {
      await deleteDiagnosis(id, token);
      setDiagnoses((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      console.error("Error deleting diagnosis:", err);
    }
  };

  const handleChange = <K extends keyof DiagnosisEntry>(
    field: K,
    value: DiagnosisEntry[K]
  ) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!form.name || !form.icd_code) {
      console.error("Name and ICD code are required");
      return;
    }

    if (editMode && form.id) {
      console.log("Updating diagnosis:", form);
      await handleUpdateDiagnosis(form.id, {
        ...form,
        user_id: userId!, // Ensure user_id is included
      });
    } else {
      console.log("Creating new diagnosis:", form);
      await handleAddDiagnosis({
        ...form,
        user_id: userId!, // Ensure user_id is included
      });
    }

    // Reset form after submission
    setForm({
      id: "",
      name: "",
      icd_code: "",
      current_medications: defaultMeds,
      physical_exam: defaultPhysicalExams,
      laboratory_tests: defaultLabs,
      teaching_provided: defaultTeaching,
      medications: [],
      exclusion_group: "",
      user_id: userId!,
    });
    if (editMode && onCancelEdit) onCancelEdit(); // Exit edit mode
  };

  const handleEdit = (index: number) => {
    const diagnosisToEdit = sorted[index];
    console.log("Editing diagnosis:", diagnosisToEdit);
    setForm({
      ...defaultForm, // Spread defaultForm to ensure all fields are present
      ...diagnosisToEdit, // Override with actual data
    }); // Populate form with existing diagnosis data
    if (onEdit) onEdit(index);
  };

  const handleSetDefaultPhysicalExams = async () => {
    if (!token || !userId) {
      console.error("No authentication token available");
      return;
    }
    try {
      await updateUserDefaults(
        { defaultPhysicalExams: form.physical_exam },
        userId,
        token
      );
      setDefaultPhysicalExams(form.physical_exam);
      console.log("Default physical exams updated");
    } catch (error) {
      console.error("Error updating default physical exams:", error);
    }
  };

  const handleSetDefaultLabs = async () => {
    if (!token || !userId) {
      console.error("No authentication token available");
      return;
    }
    try {
      await updateUserDefaults(
        { defaultLabs: form.laboratory_tests },
        userId,
        token
      );
      setDefaultLabs(form.laboratory_tests);
      console.log("Default laboratory tests updated");
    } catch (error) {
      console.error("Error updating default labs:", error);
    }
  };

  const handleSetDefaultTeaching = async () => {
    if (!token || !userId) {
      console.error("No authentication token available");
      return;
    }
    try {
      await updateUserDefaults(
        { defaultTeaching: form.teaching_provided },
        userId,
        token
      );
      setDefaultTeaching(form.teaching_provided);
      console.log("Default teaching updated");
    } catch (error) {
      console.error("Error updating default teaching:", error);
    }
  };

  const handleSetDefaultMeds = async () => {
    if (!token || !userId) {
      console.error("No authentication token available");
      return;
    }
    try {
      await updateUserDefaults(
        { defaultMeds: form.current_medications },
        userId,
        token
      );
      setDefaultMeds(form.current_medications);
      console.log("Default current medications updated");
    } catch (error) {
      console.error("Error updating default medications:", error);
    }
  };

  return (
    <Box>
      <Typography variant="h6" mb={2}>
        {editMode ? "Edit Diagnosis" : "Add New Diagnosis"}
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <CustomTextField
            label="Diagnosis Name"
            fullWidth
            value={form.name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleChange("name", e.target.value)
            }
          />
        </Grid>
        <Grid item xs={6}>
          <CustomTextField
            label="ICD Code"
            fullWidth
            value={form.icd_code}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleChange("icd_code", e.target.value)
            }
          />
        </Grid>

        <Grid item xs={12}>
          <Typography variant="subtitle2" mt={2}>
            Physical Exam Sections
          </Typography>
          <CustomTextField
            select
            fullWidth
            label="Select Physical Exams"
            SelectProps={{ multiple: true }}
            value={form.physical_exam}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleChange(
                "physical_exam",
                typeof e.target.value === "string"
                  ? e.target.value.split(",")
                  : e.target.value
              )
            }
          >
            {physicalExamOptions.map((opt) => (
              <MenuItem
                key={opt}
                value={opt}
                sx={{
                  backgroundColor: defaultPhysicalExams.includes(opt)
                    ? "lightgrey"
                    : "inherit",
                }}
              >
                {opt}
              </MenuItem>
            ))}
          </CustomTextField>
          <Box mt={1}>
            <Button
              size="small"
              variant="outlined"
              onClick={handleSetDefaultPhysicalExams}
            >
              Set as Default for Future Entries
            </Button>
          </Box>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="subtitle2" mt={2}>
            Laboratory Tests
          </Typography>
          <CustomTextField
            select
            fullWidth
            label="Select Laboratory Tests"
            SelectProps={{ multiple: true }}
            value={form.laboratory_tests}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleChange(
                "laboratory_tests",
                typeof e.target.value === "string"
                  ? e.target.value.split(",")
                  : e.target.value
              )
            }
          >
            {labTestOptions.map((opt) => (
              <MenuItem
                key={opt}
                value={opt}
                sx={{
                  backgroundColor: defaultLabs.includes(opt)
                    ? "lightgrey"
                    : "inherit",
                }}
              >
                {opt}
              </MenuItem>
            ))}
          </CustomTextField>
          <Box mt={1}>
            <Button
              size="small"
              variant="outlined"
              onClick={handleSetDefaultLabs}
            >
              Set as Default for Future Entries
            </Button>
          </Box>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="subtitle2" mt={2}>
            Teaching Provided
          </Typography>
          <CustomTextField
            select
            fullWidth
            label="Select Teaching Provided"
            SelectProps={{ multiple: true }}
            value={form.teaching_provided}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleChange(
                "teaching_provided",
                typeof e.target.value === "string"
                  ? e.target.value.split(",")
                  : e.target.value
              )
            }
          >
            {teachingOptions.map((opt) => (
              <MenuItem
                key={opt}
                value={opt}
                sx={{
                  backgroundColor: defaultTeaching.includes(opt)
                    ? "lightgrey"
                    : "inherit",
                }}
              >
                {opt}
              </MenuItem>
            ))}
          </CustomTextField>
          <Box mt={1}>
            <Button
              size="small"
              variant="outlined"
              onClick={handleSetDefaultTeaching}
            >
              Set as Default for Future Entries
            </Button>
          </Box>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="subtitle2" mt={2}>
            Current Medications
          </Typography>
          <CustomTextField
            select
            fullWidth
            label="Select Current Medications"
            SelectProps={{ multiple: true }}
            value={form.current_medications}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleChange(
                "current_medications",
                typeof e.target.value === "string"
                  ? e.target.value.split(",")
                  : e.target.value
              )
            }
          >
            {medicationOptions.map((opt) => (
              <MenuItem
                key={opt}
                value={opt}
                sx={{
                  backgroundColor: defaultMeds.includes(opt)
                    ? "lightgrey"
                    : "inherit",
                }}
              >
                {opt}
              </MenuItem>
            ))}
          </CustomTextField>
          <Box mt={1}>
            <Button
              size="small"
              variant="outlined"
              onClick={handleSetDefaultMeds}
            >
              Set as Default for Future Entries
            </Button>
          </Box>
        </Grid>

        <Grid item xs={12}>
          <CustomTextField
            label="Medications"
            fullWidth
            value={form.medications.join(", ")}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const medsArray = e.target.value
                .split(",")
                .map((med: string) => med.trim())
                .filter((med) => med !== "");
              handleChange("medications", medsArray);
            }}
          />
        </Grid>

        <Grid item xs={12}>
          <CustomTextField
            label="Exclusion Group"
            fullWidth
            value={form.exclusion_group}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleChange("exclusion_group", e.target.value)
            }
          />
        </Grid>

        <Grid item xs={12}>
          <Button variant="contained" onClick={handleSubmit}>
            {editMode ? "Update Diagnosis" : "Add Diagnosis Item"}
          </Button>
          {editMode && onCancelEdit && (
            <Button onClick={onCancelEdit} sx={{ ml: 2 }}>
              Cancel
            </Button>
          )}
          <Box ml={2}>
          <GetMoreInfo />
          </Box>
        </Grid>
      </Grid>

      <Typography variant="h6" mt={4} mb={2}>
        Added Diagnoses
      </Typography>
      {diagnoses.length === 0 ? (
        <Typography>No diagnoses added yet.</Typography>
      ) : (
        <TableContainer component={Paper} elevation={1} sx={{ maxHeight: 400 }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>
                  <strong>Name</strong>
                </TableCell>
                <TableCell>
                  <strong>ICD Code</strong>
                </TableCell>
                <TableCell>
                  <strong>Exclusion Group</strong>
                </TableCell>
                <TableCell>
                  <strong>Current Meds</strong>
                </TableCell>
                <TableCell>
                  <strong>Prescribed Meds</strong>
                </TableCell>
                <TableCell>
                  <strong>Physical Exams</strong>
                </TableCell>
                <TableCell>
                  <strong>Lab Tests</strong>
                </TableCell>
                <TableCell>
                  <strong>Teaching</strong>
                </TableCell>
                <TableCell align="center">
                  <strong>Actions</strong>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sorted.map((entry, idx) => (
                <TableRow key={entry.id || idx}>
                  <TableCell>{entry.name}</TableCell>
                  <TableCell>{entry.icd_code}</TableCell>
                  <TableCell>{entry.exclusion_group || "None"}</TableCell>
                  <TableCell>
                    {entry.current_medications?.join(", ") || "None"}
                  </TableCell>
                  <TableCell>
                    {entry.medications?.join(", ") || "None"}
                  </TableCell>
                  <TableCell>
                    {entry.physical_exam?.join(", ") || "None"}
                  </TableCell>
                  <TableCell>
                    {entry.laboratory_tests?.join(", ") || "None"}
                  </TableCell>
                  <TableCell>
                    {entry.teaching_provided?.join(", ") || "None"}
                  </TableCell>
                  <TableCell align="center">
                    <IconButton onClick={() => handleEdit(idx)} size="small">
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDelete(entry.id)}
                      size="small"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
