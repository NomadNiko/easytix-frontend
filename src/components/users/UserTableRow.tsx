// src/components/users/UserTableRow.tsx
import {
  Avatar,
  Box,
  useMantineColorScheme,
  useMantineTheme,
} from "@mantine/core";
import { User } from "@/services/api/types/user";
import { useTranslation } from "@/services/i18n/client";
import UserActions from "./UserActions";

interface UserTableRowProps {
  user: User;
}

function UserTableRow({ user }: UserTableRowProps) {
  const { t: tRoles } = useTranslation("admin-panel-roles");
  const { colorScheme } = useMantineColorScheme();
  const theme = useMantineTheme();

  // Use the correct colorScheme from hook
  const shadowColor =
    colorScheme === "dark"
      ? "rgba(114, 180, 255, 0.4)" // Light blue for dark mode
      : "rgba(0, 100, 255, 0.4)"; // Darker blue for light mode

  return (
    <>
      <td
        style={{ width: theme.other.tableWidths.checkbox, textAlign: "left" }}
      >
        <Box p="xs">
          <Avatar
            alt={user?.firstName + " " + user?.lastName}
            src={user?.photo?.path}
            size="md"
            style={{
              margin: theme.other.spacing[2],
              boxShadow: `0 0 10px ${shadowColor}`,
            }}
          />
        </Box>
      </td>
      <td style={{ width: theme.other.tableWidths.name, textAlign: "left" }}>
        {user?.firstName} {user?.lastName}
      </td>
      <td style={{ width: theme.other.tableWidths.email, textAlign: "left" }}>
        {user?.email}
      </td>
      <td style={{ width: theme.other.tableWidths.status, textAlign: "left" }}>
        {user?.phoneNumber || "-"}
      </td>
      <td style={{ width: theme.other.tableWidths.avatar, textAlign: "left" }}>
        {tRoles(`role.${user?.role?.id}`)}
      </td>
      <td
        style={{ width: theme.other.tableWidths.actions, textAlign: "right" }}
      >
        {user && <UserActions user={user} />}
      </td>
    </>
  );
}

export default UserTableRow;
