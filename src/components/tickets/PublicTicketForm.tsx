"use client";

import { useForm, Controller } from "react-hook-form";
import {
  TextInput,
  Textarea,
  Select,
  Button,
  Stack,
  Title,
  Card,
  Text,
  Box,
  Container,
  LoadingOverlay,
} from "@mantine/core";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useTranslation } from "@/services/i18n/client";
import { useSnackbar } from "@/components/mantine/feedback/notification-service";
import { useRouter } from "next/navigation";
// Removed queue and category queries since we'll use defaults
import {
  TicketPriority,
  useCreatePublicTicketService,
  PublicTicketCreateRequest,
} from "@/services/api/services/tickets";

type FormData = Omit<
  PublicTicketCreateRequest,
  "documentIds" | "queueId" | "categoryId"
>;

const useValidationSchema = () => {
  const { t } = useTranslation("tickets");
  return yup.object().shape({
    // Ticket fields - queue and category will be set by backend defaults
    title: yup.string().required(t("tickets:inputs.title.validation.required")),
    details: yup
      .string()
      .required(t("tickets:inputs.details.validation.required")),
    priority: yup
      .mixed<TicketPriority>()
      .oneOf(Object.values(TicketPriority))
      .required(t("tickets:inputs.priority.validation.required")),
    // User fields
    firstName: yup
      .string()
      .required(t("tickets:inputs.firstName.validation.required")),
    lastName: yup
      .string()
      .required(t("tickets:inputs.lastName.validation.required")),
    email: yup
      .string()
      .email(t("tickets:inputs.email.validation.invalid"))
      .required(t("tickets:inputs.email.validation.required")),
    phoneNumber: yup
      .string()
      .required(t("tickets:inputs.phoneNumber.validation.required")),
  });
};

export function PublicTicketForm() {
  const { t } = useTranslation("tickets");
  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();
  // Note: File attachments will be handled after ticket creation
  const createPublicTicket = useCreatePublicTicketService();

  const validationSchema = useValidationSchema();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormData>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      title: "",
      details: "",
      priority: TicketPriority.MEDIUM,
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
    },
  });

  // No queue/category selection needed - backend will use defaults

  const onSubmit = handleSubmit(async (data) => {
    const { status } = await createPublicTicket({
      ...data,
      // Backend will set queueId and categoryId to defaults
      queueId: "", // Will be overridden by backend
      categoryId: "", // Will be overridden by backend
      documentIds: [], // No file uploads for public tickets initially
    });

    if (status === 201) {
      enqueueSnackbar(t("tickets:alerts.publicTicketCreated"), {
        variant: "success",
      });

      // Show additional info about account creation
      enqueueSnackbar(t("tickets:alerts.accountCreated"), { variant: "info" });

      // Reset form
      reset();

      // Redirect to home or login page after a delay
      setTimeout(() => {
        router.push("/sign-in");
      }, 3000);
    }
  });

  return (
    <Container size="md">
      <Box pos="relative">
        <LoadingOverlay visible={isSubmitting} />

        <form onSubmit={onSubmit}>
          <Stack gap="lg">
            <Card withBorder shadow="sm" p="lg">
              <Title order={3} mb="md">
                {t("tickets:publicForm.ticketInfo")}
              </Title>

              <Stack gap="md">
                <Controller
                  name="title"
                  control={control}
                  render={({ field }) => (
                    <TextInput
                      {...field}
                      label={t("tickets:inputs.title.label")}
                      placeholder={t("tickets:inputs.title.placeholder")}
                      error={errors.title?.message}
                      data-testid="title-input"
                    />
                  )}
                />

                <Controller
                  name="details"
                  control={control}
                  render={({ field }) => (
                    <Textarea
                      {...field}
                      label={t("tickets:inputs.details.label")}
                      placeholder={t("tickets:inputs.details.placeholder")}
                      minRows={4}
                      error={errors.details?.message}
                      data-testid="details-input"
                    />
                  )}
                />

                <Controller
                  name="priority"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      label={t("tickets:inputs.priority.label")}
                      data={[
                        {
                          value: TicketPriority.HIGH,
                          label: t("tickets:priority.high"),
                        },
                        {
                          value: TicketPriority.MEDIUM,
                          label: t("tickets:priority.medium"),
                        },
                        {
                          value: TicketPriority.LOW,
                          label: t("tickets:priority.low"),
                        },
                      ]}
                      error={errors.priority?.message}
                      data-testid="priority-select"
                    />
                  )}
                />

                <Box>
                  <Text size="sm" fw={500} mb="xs">
                    {t("tickets:inputs.attachments.label")}
                  </Text>
                  <Text size="xs" color="dimmed" mb="xs">
                    File uploads can be added after ticket creation
                  </Text>
                </Box>
              </Stack>
            </Card>

            <Card withBorder shadow="sm" p="lg">
              <Title order={3} mb="md">
                {t("tickets:publicForm.contactInfo")}
              </Title>

              <Text size="sm" color="dimmed" mb="md">
                {t("tickets:publicForm.contactInfoDescription")}
              </Text>

              <Stack gap="md">
                <Controller
                  name="firstName"
                  control={control}
                  render={({ field }) => (
                    <TextInput
                      {...field}
                      label={t("tickets:inputs.firstName.label")}
                      placeholder={t("tickets:inputs.firstName.placeholder")}
                      error={errors.firstName?.message}
                      data-testid="first-name-input"
                    />
                  )}
                />

                <Controller
                  name="lastName"
                  control={control}
                  render={({ field }) => (
                    <TextInput
                      {...field}
                      label={t("tickets:inputs.lastName.label")}
                      placeholder={t("tickets:inputs.lastName.placeholder")}
                      error={errors.lastName?.message}
                      data-testid="last-name-input"
                    />
                  )}
                />

                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <TextInput
                      {...field}
                      label={t("tickets:inputs.email.label")}
                      placeholder={t("tickets:inputs.email.placeholder")}
                      type="email"
                      error={errors.email?.message}
                      data-testid="email-input"
                    />
                  )}
                />

                <Controller
                  name="phoneNumber"
                  control={control}
                  render={({ field }) => (
                    <TextInput
                      {...field}
                      label={t("tickets:inputs.phoneNumber.label")}
                      placeholder={t("tickets:inputs.phoneNumber.placeholder")}
                      error={errors.phoneNumber?.message}
                      data-testid="phone-number-input"
                    />
                  )}
                />
              </Stack>
            </Card>

            <Box>
              <Button
                type="submit"
                size="md"
                fullWidth
                loading={isSubmitting}
                data-testid="submit-button"
              >
                {t("tickets:actions.submitTicket")}
              </Button>

              <Text size="xs" color="dimmed" mt="xs" ta="center">
                {t("tickets:publicForm.disclaimer")}
              </Text>
            </Box>
          </Stack>
        </form>
      </Box>
    </Container>
  );
}
