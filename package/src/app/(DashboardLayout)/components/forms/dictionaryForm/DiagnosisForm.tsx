"use client";

import { useState, useEffect } from "react";
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
  updateUserDefaults,
  fetchUserDefaults,
} from "@/lib/api";
import CustomTextField from "@/app/(DashboardLayout)/components/forms/theme-elements/CustomTextField";
import { DiagnosisEntry } from "@/types/diagnosis";

const TEMP_USER_ID = "a14ef32c-bc89-4df9-8435-9a7b5e07c7cd";

const defaultForm: DiagnosisEntry = {
  name: "",
  icd_code: "",
  current_medications: [],
  physical_exam: [],
  laboratory_tests: [],
  teaching_provided: [],
  medications: [],
  exclusion_group: "",
  user_id: TEMP_USER_ID,
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
  initialData?: DiagnosisEntry;
  editMode?: boolean;
  onCancelEdit?: () => void;
}

export default function DiagnosisForm({
  onAdd,
  initialData,
  editMode = false,
  onCancelEdit,
}: Props) {
  const [diagnoses, setDiagnoses] = useState<DiagnosisEntry[]>([]);
  const [form, setForm] = useState<DiagnosisEntry>(initialData ?? defaultForm);
  const [defaultPhysicalExams, setDefaultPhysicalExams] = useState<string[]>(
    []
  );
  const [defaultLabs, setDefaultLabs] = useState<string[]>([]);
  const [defaultTeaching, setDefaultTeaching] = useState<string[]>([]);
  const [defaultMeds, setDefaultMeds] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [diagnosisData, defaults] = await Promise.all([
          fetchDiagnosisOptions(),
          fetchUserDefaults(TEMP_USER_ID),
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
          }));
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };
    fetchData();
  }, [editMode]);

  const handleAddDiagnosis = async (diagnosis: DiagnosisEntry) => {
    try {
      const submission = { ...diagnosis, user_id: TEMP_USER_ID };
      await createDiagnosis(submission);
      const updatedDiagnoses = await fetchDiagnosisOptions();
      setDiagnoses(updatedDiagnoses);
    } catch (err) {
      console.error("Error creating diagnosis:", err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDiagnosis(id);
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
    if (!form.name || !form.icd_code) return;
    await handleAddDiagnosis(form);
    setForm({
      name: "",
      icd_code: "",
      current_medications: defaultMeds,
      physical_exam: defaultPhysicalExams,
      laboratory_tests: defaultLabs,
      teaching_provided: defaultTeaching,
      medications: [],
      exclusion_group: "",
      user_id: TEMP_USER_ID,
    });
  };

  const handleSetDefaultPhysicalExams = async () => {
    try {
      await updateUserDefaults(
        { defaultPhysicalExams: form.physical_exam },
        TEMP_USER_ID
      );
      setDefaultPhysicalExams(form.physical_exam);
      console.log("Default physical exams updated");
    } catch (error) {
      console.error("Error updating default physical exams:", error);
    }
  };

  const handleSetDefaultLabs = async () => {
    try {
      await updateUserDefaults(
        { defaultLabs: form.laboratory_tests },
        TEMP_USER_ID
      );
      setDefaultLabs(form.laboratory_tests);
      console.log("Default laboratory tests updated");
    } catch (error) {
      console.error("Error updating default labs:", error);
    }
  };

  const handleSetDefaultTeaching = async () => {
    try {
      await updateUserDefaults(
        { defaultTeaching: form.teaching_provided },
        TEMP_USER_ID
      );
      setDefaultTeaching(form.teaching_provided);
      console.log("Default teaching updated");
    } catch (error) {
      console.error("Error updating default teaching:", error);
    }
  };

  const handleSetDefaultMeds = async () => {
    try {
      await updateUserDefaults(
        { defaultMeds: form.current_medications },
        TEMP_USER_ID
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
        Add New Diagnosis
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <CustomTextField
            label="Diagnosis Name"
            fullWidth
            value={form.name}
            onChange={(e) => handleChange("name", e.target.value)}
          />
        </Grid>
        <Grid item xs={6}>
          <CustomTextField
            label="ICD Code"
            fullWidth
            value={form.icd_code}
            onChange={(e) => handleChange("icd_code", e.target.value)}
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
            onChange={(e) =>
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
                    ? "lightgrey" // Highlights default options
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
              disabled={
                JSON.stringify(form.physical_exam) ===
                JSON.stringify(defaultPhysicalExams)
              }
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
            onChange={(e) =>
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
                    ? "lightgrey" // Highlights default options
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
              disabled={
                JSON.stringify(form.laboratory_tests) ===
                JSON.stringify(defaultLabs)
              }
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
            onChange={(e) =>
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
                    ? "lightgrey" // Highlights default options
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
              disabled={
                JSON.stringify(form.teaching_provided) ===
                JSON.stringify(defaultTeaching)
              }
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
            onChange={(e) =>
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
                    ? "lightgrey" // Highlights default options
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
              disabled={
                JSON.stringify(form.current_medications) ===
                JSON.stringify(defaultMeds)
              }
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
            onChange={(e) => {
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
            onChange={(e) => handleChange("exclusion_group", e.target.value)}
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
        </Grid>
      </Grid>

      <Typography variant="h6" mt={4} mb={2}>
        Added Diagnoses
      </Typography>
      {diagnoses.length === 0 ? (
        <Typography>No diagnoses added yet.</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
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
                <TableCell align="center">
                  <strong>Actions</strong>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {diagnoses.map((diagnosis) => (
                <TableRow key={diagnosis.id}>
                  <TableCell>{diagnosis.name}</TableCell>
                  <TableCell>{diagnosis.icd_code}</TableCell>
                  <TableCell>
                    {diagnosis.physical_exam
                      ? diagnosis.physical_exam.join(", ")
                      : "None"}
                  </TableCell>
                  <TableCell>
                    {diagnosis.current_medications
                      ? diagnosis.current_medications.join(", ")
                      : "None"}
                  </TableCell>
                  <TableCell>
                    {diagnosis.laboratory_tests
                      ? diagnosis.laboratory_tests.join(", ")
                      : "None"}
                  </TableCell>
                  <TableCell>
                    {diagnosis.teaching_provided
                      ? diagnosis.teaching_provided.join(", ")
                      : "None"}
                  </TableCell>
                  <TableCell>
                    {diagnosis.medications
                      ? diagnosis.medications.join(", ")
                      : "None"}
                  </TableCell>
                  <TableCell>{diagnosis.exclusion_group || "None"}</TableCell>
                  <TableCell align="center">
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={() => handleDelete(diagnosis.id)}
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
