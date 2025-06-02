"use client";
import { User } from "@/services/api/types/user";
import useAuth from "@/services/auth/use-auth";
import useConfirmDialog from "@/components/confirm-dialog/use-confirm-dialog";
import { useDeleteUsersService } from "@/services/api/services/users";
import { usersQueryKeys } from "@/app/[language]/admin-panel/users/queries/queries";
import { InfiniteData, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "@/services/i18n/client";
import { Button, Group, Text, ActionIcon, Tooltip } from "@mantine/core";
import {
  IconTrash,
  IconEdit,
  IconLock,
  IconTicket,
  IconUsers,
} from "@tabler/icons-react";
import Link from "@/components/link";
import { useResponsive } from "@/services/responsive/use-responsive";
import { useState } from "react";
import { UserTicketsModal } from "./UserTicketsModal";
import { UserQueuesModal } from "./UserQueuesModal";

interface UserActionsProps {
  user: User;
}

function UserActions({ user }: UserActionsProps) {
  const { user: authUser } = useAuth();
  const { confirmDialog } = useConfirmDialog();
  const fetchUserDelete = useDeleteUsersService();
  const queryClient = useQueryClient();
  const canDelete = user.id !== authUser?.id;
  const { t: tUsers } = useTranslation("admin-panel-users");
  const { isMobile } = useResponsive();
  const [ticketsModalOpened, setTicketsModalOpened] = useState(false);
  const [queuesModalOpened, setQueuesModalOpened] = useState(false);

  const handleDelete = async () => {
    const isConfirmed = await confirmDialog({
      title: tUsers("admin-panel-users:confirm.delete.title"),
      message: tUsers("admin-panel-users:confirm.delete.message"),
    });
    if (isConfirmed) {
      // Define the type for user query data
      type UsersQueryData = InfiniteData<{ nextPage: number; data: User[] }>;
      // Get the base query key for users
      const baseQueryKey = usersQueryKeys.list().key;
      // Cancel any in-flight queries
      await queryClient.cancelQueries({ queryKey: baseQueryKey });
      // Update all matching queries in the cache regardless of filters or sorting
      // This approach ensures consistency across all views of user data
      queryClient.setQueriesData(
        { queryKey: [baseQueryKey[0]] },
        (oldData: UsersQueryData | undefined) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            pages: oldData.pages.map((page) => ({
              ...page,
              data: page.data.filter((item) => item.id !== user.id),
            })),
          };
        }
      );
      // Perform the actual delete operation
      await fetchUserDelete({
        id: user.id,
      });
      // Instead of invalidating queries, we've already updated the cache
      // This avoids unnecessary refetching while maintaining data consistency
    }
  };

  // Mobile view styling
  const mobileButtonStyle = {
    width: "auto",
    overflow: "hidden",
    whiteSpace: "nowrap" as const,
    textOverflow: "ellipsis",
  };

  // Font size adjustment for mobile
  const textSize = "xs";

  // Mobile view with all actions as buttons
  if (isMobile) {
    return (
      <>
        <Group gap="xs" wrap="wrap">
          <Button
            size="xs"
            variant="light"
            component={Link}
            href={`/admin-panel/users/edit/${user.id}`}
            style={mobileButtonStyle}
          >
            <Group gap={4} align="center" wrap="nowrap">
              <IconEdit size={14} />
              <Text size={textSize} truncate>
                {tUsers("admin-panel-users:actions.edit")}
              </Text>
            </Group>
          </Button>
          <Button
            size="xs"
            variant="light"
            component={Link}
            href={`/admin-panel/users/edit-password/${user.id}`}
            style={mobileButtonStyle}
          >
            <Group gap={4} align="center" wrap="nowrap">
              <IconLock size={14} />
              <Text size={textSize} truncate>
                {tUsers("admin-panel-users:actions.changePassword")}
              </Text>
            </Group>
          </Button>
          <Button
            size="xs"
            variant="light"
            color="blue"
            onClick={() => setTicketsModalOpened(true)}
            style={mobileButtonStyle}
          >
            <Group gap={4} align="center" wrap="nowrap">
              <IconTicket size={14} />
              <Text size={textSize} truncate>
                {tUsers("admin-panel-users:actions.viewTickets")}
              </Text>
            </Group>
          </Button>
          <Button
            size="xs"
            variant="light"
            color="teal"
            onClick={() => setQueuesModalOpened(true)}
            style={mobileButtonStyle}
          >
            <Group gap={4} align="center" wrap="nowrap">
              <IconUsers size={14} />
              <Text size={textSize} truncate>
                {tUsers("admin-panel-users:actions.manageQueues")}
              </Text>
            </Group>
          </Button>
          {canDelete && (
            <Button
              size="xs"
              variant="light"
              color="red"
              onClick={handleDelete}
              style={mobileButtonStyle}
            >
              <Group gap={4} align="center" wrap="nowrap">
                <IconTrash size={14} />
                <Text size={textSize} truncate>
                  {tUsers("admin-panel-users:actions.delete")}
                </Text>
              </Group>
            </Button>
          )}
        </Group>
        <UserTicketsModal
          user={user}
          opened={ticketsModalOpened}
          onClose={() => setTicketsModalOpened(false)}
        />
        <UserQueuesModal
          user={user}
          opened={queuesModalOpened}
          onClose={() => setQueuesModalOpened(false)}
        />
      </>
    );
  }

  // Desktop view - icon-only buttons
  return (
    <>
      <Group gap="xs">
        <Tooltip label={tUsers("admin-panel-users:actions.edit")}>
          <ActionIcon
            size="lg"
            component={Link}
            href={`/admin-panel/users/edit/${user.id}`}
          >
            <IconEdit size={16} />
          </ActionIcon>
        </Tooltip>
        <Tooltip label={tUsers("admin-panel-users:actions.changePassword")}>
          <ActionIcon
            size="lg"
            variant="light"
            component={Link}
            href={`/admin-panel/users/edit-password/${user.id}`}
          >
            <IconLock size={16} />
          </ActionIcon>
        </Tooltip>
        <Tooltip label={tUsers("admin-panel-users:actions.viewTickets")}>
          <ActionIcon
            size="lg"
            variant="light"
            color="blue"
            onClick={() => setTicketsModalOpened(true)}
          >
            <IconTicket size={16} />
          </ActionIcon>
        </Tooltip>
        <Tooltip label={tUsers("admin-panel-users:actions.manageQueues")}>
          <ActionIcon
            size="lg"
            variant="light"
            color="teal"
            onClick={() => setQueuesModalOpened(true)}
          >
            <IconUsers size={16} />
          </ActionIcon>
        </Tooltip>
        {canDelete && (
          <Tooltip label={tUsers("admin-panel-users:actions.delete")}>
            <ActionIcon
              size="lg"
              variant="light"
              color="red"
              onClick={handleDelete}
            >
              <IconTrash size={16} />
            </ActionIcon>
          </Tooltip>
        )}
      </Group>
      <UserTicketsModal
        user={user}
        opened={ticketsModalOpened}
        onClose={() => setTicketsModalOpened(false)}
      />
      <UserQueuesModal
        user={user}
        opened={queuesModalOpened}
        onClose={() => setQueuesModalOpened(false)}
      />
    </>
  );
}

export default UserActions;
