import {
  Box,
  Table,
  TableHead,
  TableBody,
  TableCell,
  TableRow,
  TableContainer,
  Paper,
  Typography,
  IconButton,
} from "@mui/material";
import { DiagnosisEntry } from "@/types/diagnosis";
import EditIcon from "@mui/icons-material/Edit";

interface Props {
  diagnoses: DiagnosisEntry[];
  onEdit: (index: number) => void;
}

export default function DiagnosisList({
  diagnoses = [],
  onEdit = () => {},
}: Props) {
  if (diagnoses.length === 0) {
    return <Typography>No diagnoses added yet.</Typography>;
  }

  const sorted = [...diagnoses].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <Box mt={4}>
      <Typography variant="h6" gutterBottom>
        Saved Diagnoses
      </Typography>
      <TableContainer component={Paper} elevation={1}>
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
              <TableRow key={idx}>
                <TableCell>{entry.name}</TableCell>
                <TableCell>{entry.icd_code}</TableCell>
                <TableCell>{entry.exclusion_group}</TableCell>
                <TableCell>{entry.current_medications.join(", ")}</TableCell>
                <TableCell>{entry.medications.join(", ")}</TableCell>
                <TableCell>{entry.physical_exam.join(", ")}</TableCell>
                <TableCell>{entry.laboratory_tests.join(", ")}</TableCell>
                <TableCell>{entry.teaching_provided.join(", ")}</TableCell>
                <TableCell align="center">
                  <IconButton onClick={() => onEdit(idx)} size="small">
                    <EditIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
