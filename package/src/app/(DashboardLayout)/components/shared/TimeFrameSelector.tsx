// src/app/(DashboardLayout)/components/shared/TimeFrameSelector.tsx
import { ToggleButton, ToggleButtonGroup } from "@mui/material";

interface Props {
  value: "day" | "week" | "month";
  onChange: (value: "day" | "week" | "month") => void;
}

export default function TimeFrameSelector({ value, onChange }: Props) {
  const handleChange = (
    _event: React.MouseEvent<HTMLElement>,
    newValue: "day" | "week" | "month" | null
  ) => {
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
