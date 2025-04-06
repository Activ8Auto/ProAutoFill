import { Button } from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { useRouter } from "next/router";

export default function LearnMoreButton() {
  const router = useRouter();

  return (
    <Button
      variant="text"
      size="small"
      startIcon={<InfoOutlinedIcon />}
      onClick={() => router.push("/faq")}
      sx={{ textTransform: "none", padding: 0, minWidth: 0 }}
    >
      Learn more
    </Button>
  );
}