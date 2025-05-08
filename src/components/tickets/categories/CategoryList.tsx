// src/components/tickets/categories/CategoryList.tsx
import React from "react";
import { Table, Group, ActionIcon, Text, Card } from "@mantine/core";
import { IconEdit, IconTrash } from "@tabler/icons-react";
import { useTranslation } from "@/services/i18n/client";
import { Category } from "@/services/api/services/categories";
import useConfirmDialog from "@/components/confirm-dialog/use-confirm-dialog";

interface CategoryListProps {
  categories: Category[];
  onEdit: (category: Category) => void;
  onDelete: (id: string) => void;
}

export function CategoryList({
  categories,
  onEdit,
  onDelete,
}: CategoryListProps) {
  const { t } = useTranslation("tickets");
  const { confirmDialog } = useConfirmDialog();

  const handleDelete = async (category: Category) => {
    const confirmed = await confirmDialog({
      title: t("tickets:categories.confirmDelete.title"),
      message: t("tickets:categories.confirmDelete.message", {
        name: category.name,
      }),
    });

    if (confirmed) {
      onDelete(category.id);
    }
  };

  if (categories.length === 0) {
    return (
      <Card withBorder p="xl" radius="md" my="md">
        <Text ta="center" fw={500} c="dimmed">
          {t("tickets:categories.empty")}
        </Text>
      </Card>
    );
  }

  return (
    <div>
      <Table horizontalSpacing="sm" verticalSpacing="sm">
        <Table.Thead>
          <Table.Tr>
            <Table.Th>{t("tickets:categories.fields.name")}</Table.Th>
            <Table.Th>{t("common:fields.actions")}</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {categories.map((category) => (
            <Table.Tr key={category.id}>
              <Table.Td>
                <Text size="sm" fw={500}>
                  {category.name}
                </Text>
              </Table.Td>
              <Table.Td>
                <Group gap="xs">
                  <ActionIcon
                    size="sm"
                    variant="light"
                    onClick={() => onEdit(category)}
                  >
                    <IconEdit size={16} />
                  </ActionIcon>
                  <ActionIcon
                    size="sm"
                    variant="light"
                    color="red"
                    onClick={() => handleDelete(category)}
                  >
                    <IconTrash size={16} />
                  </ActionIcon>
                </Group>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </div>
  );
}
