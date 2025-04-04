"use client";

import { Box, Typography, Paper } from "@mui/material";
import { useState } from "react";
import DiagnosisForm from "../components/forms/dictionaryForm/DiagnosisForm";
import { DiagnosisEntry } from "@/types/diagnosis";

export default function AutomationDictionaryPage() {
  const [diagnoses, setDiagnoses] = useState<DiagnosisEntry[]>([]);
  const [editIndex, setEditIndex] = useState<number | null>(null);

  const addDiagnosis = (newDiagnosis: DiagnosisEntry) => {
    setDiagnoses((prev) => [...prev, newDiagnosis]);
  };

  const updateDiagnosis = (updatedDiagnosis: DiagnosisEntry) => {
    
    setDiagnoses((prev) =>
      prev.map((d, i) => (i === editIndex ? updatedDiagnosis : d))
    );
    setEditIndex(null); // Exit edit mode
  };

  const onEdit = (index: number) => {
    
    setEditIndex(index); // Set the editIndex to the clicked index
    
  };

  const onCancelEdit = () => {
    
    setEditIndex(null);
  };



  return (
    <Box p={4}>
      <Typography variant="h5" mb={3}>
        Primary Diagnosis Dictionary
      </Typography>

      <Box mb={4}>
        <Paper elevation={2} sx={{ p: 3, backgroundColor: "#f9fafb" }}>
          <Typography variant="h6" gutterBottom>
            🧠 What You're Building
          </Typography>
          <Typography variant="body1" gutterBottom>
            This page lets you create smart{" "}
            <strong>profiles for each diagnosis</strong> — like Bipolar
            Disorder, PTSD, or Anxiety. Each profile includes exactly what you'd
            expect for that condition: the right medications, labs, physical
            exams, teaching, and anything to avoid.
          </Typography>
          <Typography variant="body1" gutterBottom>
            When the automation runs, it will randomly select diagnoses from
            this list. But instead of combining random medications and tests
            that might not make sense together, it will follow the safe,
            realistic profile <strong>you</strong> defined.
          </Typography>
          <Typography variant="body1">
            This keeps your forms accurate, clinically sound, and fast — without
            needing to edit anything later.
          </Typography>
        </Paper>
      </Box>

      <DiagnosisForm
        onAdd={addDiagnosis}
        onUpdate={updateDiagnosis}
        initialData={editIndex !== null ? diagnoses[editIndex] : undefined}
        editMode={editIndex !== null} // This should be true when editIndex is set
        onCancelEdit={onCancelEdit}
        onEdit={onEdit} // Pass onEdit to DiagnosisForm
      />
    </Box>
  );
}