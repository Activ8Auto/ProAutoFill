import {
  IconAperture,
  IconCopy,
  IconLayoutDashboard,
  IconLogin,
  IconMoodHappy,
  IconTypography,
  IconUserPlus,
  IconSettingsAutomation,
  IconBook2,
} from "@tabler/icons-react"; // make sure you import an appropriate icon
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { uniqueId } from "lodash";

const Menuitems = [
  {
    navlabel: true,
    subheader: "Home",
  },
  {
    id: uniqueId(),
    title: "Dashboard",
    icon: IconLayoutDashboard,
    href: "/",
  },
  {
    navlabel: true,
    subheader: "Automation",
  },

  {
    id: uniqueId(),
    title: "Medtrics Automation",
    icon: IconSettingsAutomation,
    href: "/automation-profiles",
  },
  {
    id: uniqueId(),
    title: "Create a Diagnosis Library",
    icon: IconBook2, // or any other icon you prefer from @tabler/icons-react
    href: "/automation-dictionary",
  },
  {
    id: uniqueId(),
    title: "Errors",
    icon: ErrorOutlineIcon, // or any other icon you prefer from @tabler/icons-react
    href: "/errors",
  },

  {
    navlabel: true,
    subheader: "FAQ/How To",
  },
  {
    id: uniqueId(),
    title: "FAQ",
    icon: HelpOutlineIcon, // or any other icon you prefer from @tabler/icons-react
    href: "/faq",
  },
  // {
  //   id: uniqueId(),
  //   title: "Login",
  //   icon: IconLogin,
  //   href: "/authentication/login",
  // },
  // {
  //   id: uniqueId(),
  //   title: "Register",
  //   icon: IconUserPlus,
  //   href: "/authentication/register",
  // },
];

export default Menuitems;
