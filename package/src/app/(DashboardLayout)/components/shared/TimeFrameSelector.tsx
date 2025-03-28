// src/app/(DashboardLayout)/components/shared/TimeFrameSelector.tsx
import { ToggleButton, ToggleButtonGroup } from "@mui/material";

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export default function TimeFrameSelector({ value, onChange }: Props) {
  const handleChange = (_event: any, newValue: string) => {
    if (newValue) onChange(newValue);
  };

  return (
    <ToggleButtonGroup
      value={value}
      exclusive
      onChange={handleChange}
      size="small"
      sx={{ mb: 2 }}
    >
      <ToggleButton value="day">Day</ToggleButton>
      <ToggleButton value="week">Week</ToggleButton>
      <ToggleButton value="month">Month</ToggleButton>
    </ToggleButtonGroup>
  );
}
