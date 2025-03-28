"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Checkbox,
  FormControlLabel,
  Grid,
  Typography,
} from "@mui/material";
import { DiagnosisEntry } from "@/types/diagnosis";
import { fetchDiagnosisOptions } from "@/lib/api"; // You must have this function in your API helpers

interface Props {
  selected: DiagnosisEntry[];
  onChange: (selected: DiagnosisEntry[]) => void;
}

export default function DiagnosisSelector({ selected, onChange }: Props) {
  const [diagnosisOptions, setDiagnosisOptions] = useState<DiagnosisEntry[]>(
    []
  );
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    const loadDiagnoses = async () => {
      try {
        const fetched = await fetchDiagnosisOptions();
        setDiagnosisOptions(fetched);
        const selectedNames = selected.map((d) => d.name);
        setSelectedIds(selectedNames);
      } catch (err) {
        console.error("Error loading diagnoses", err);
      }
    };
    loadDiagnoses();
  }, [selected]);

  const handleToggle = (name: string) => {
    const updated = selectedIds.includes(name)
      ? selectedIds.filter((id) => id !== name)
      : [...selectedIds, name];

    setSelectedIds(updated);
    const updatedSelected = diagnosisOptions.filter((d) =>
      updated.includes(d.name)
    );
    onChange(updatedSelected);
  };

  const handleSelectAll = () => {
    if (selectedIds.length === diagnosisOptions.length) {
      setSelectedIds([]);
      onChange([]);
    } else {
      const all = diagnosisOptions.map((d) => d.name);
      setSelectedIds(all);
      onChange(diagnosisOptions);
    }
  };

  const sorted = [...diagnosisOptions].sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  return (
    <Box>
      <Typography variant="subtitle1" gutterBottom>
        Diagnosis Dictionary (Select All That Apply)
      </Typography>
      <FormControlLabel
        control={
          <Checkbox
            checked={selectedIds.length === diagnosisOptions.length}
            onChange={handleSelectAll}
          />
        }
        label="Select All"
      />
      <Grid container spacing={1}>
        {sorted.map((d) => (
          <Grid item xs={12} sm={6} md={4} key={d.name}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={selectedIds.includes(d.name)}
                  onChange={() => handleToggle(d.name)}
                />
              }
              label={d.name}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
