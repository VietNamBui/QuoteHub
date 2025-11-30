import HomeIcon from "@mui/icons-material/Home";
import NotificationIcon from "@mui/icons-material/Notifications";
import GroupIcon from "@mui/icons-material/Group";
import VerifiedIcon from "@mui/icons-material/Verified";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import PendingIcon from "@mui/icons-material/Pending";
import GavelIcon from "@mui/icons-material/Gavel";

export const navigationMenu = [
  {
    title: "Home",
    icon: HomeIcon,
    path: "/home",
  },
  {
    title: "Notifications",
    icon: NotificationIcon,
    path: "/notification",
  },
  {
    title: "Communities",
    icon: GroupIcon,
    path: "/communities",
  },
  {
    title: "Profile",
    icon: AccountCircleIcon,
    path: "/profile",
  },
  {
    title: "More",
    icon: PendingIcon,
    path: "/more",
  },
  {
    title: "Moderation",
    icon: GavelIcon,
    path: "/admin/moderation",
    adminOnly: true,
  },
];