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
    title: "Automation Profiles",
    icon: IconSettingsAutomation,
    href: "/automation-profiles",
  },
  {
    id: uniqueId(),
    title: "Diagnosis Library",
    icon: IconBook2, // or any other icon you prefer from @tabler/icons-react
    href: "/automation-dictionary",
  },
  {
    id: uniqueId(),
    title: "Run Automation",
    icon: IconBook2, // or any other icon you prefer from @tabler/icons-react
    href: "/runAutomation",
  },

  {
    navlabel: true,
    subheader: "Auth",
  },
  {
    id: uniqueId(),
    title: "Login",
    icon: IconLogin,
    href: "/authentication/login",
  },
  {
    id: uniqueId(),
    title: "Register",
    icon: IconUserPlus,
    href: "/authentication/register",
  },
];

export default Menuitems;
