"use client";

import { Card, CardContent, Typography, IconButton, Box } from "@mui/material";


import DeleteIcon from "@mui/icons-material/Delete";
import {
  AutomationProfile,
  useAutomationProfileStore,
} from "@/store/automationProfileStore";

type Props = {
  profile: AutomationProfile;
};

export default function ProfileCard({ profile }: Props) {
  const removeProfile = useAutomationProfileStore(
    (state) => state.removeProfile
  );
  const selectProfile = useAutomationProfileStore(
    (state) => state.selectProfile
  );

  

  return (
    <Card
      sx={{ mb: 2, cursor: "pointer", "&:hover": { boxShadow: 4 } }}
      onClick={() => selectProfile(profile.id)}
    >
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">{profile.name}</Typography>
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              removeProfile(profile.id);
            }}
          >
            <DeleteIcon color="error" />
          </IconButton>
        </Box>
      </CardContent>
    </Card>
  );
}
