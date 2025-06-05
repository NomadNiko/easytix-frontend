import { useMantineTheme } from "@mantine/core";
import { BRAND_COLORS, MANTINE_SEMANTIC_COLORS } from "@/config/branding";

export type TicketStatus = "opened" | "inProgress" | "resolved" | "closed";
export type TicketPriority = "high" | "medium" | "low";
export type SemanticColor =
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "neutral"
  | "primary";

/**
 * Custom hook to access centralized theme colors
 * Provides easy access to brand colors, status colors, and semantic colors
 */
export function useThemeColors() {
  const theme = useMantineTheme();

  return {
    // Direct access to brand colors
    brand: BRAND_COLORS,

    // Status color helpers
    getStatusColor: (status: TicketStatus): string => {
      return BRAND_COLORS.status[status];
    },

    getStatusMantineColor: (status: TicketStatus): string => {
      return MANTINE_SEMANTIC_COLORS.status[status];
    },

    // Priority color helpers
    getPriorityColor: (priority: TicketPriority): string => {
      return BRAND_COLORS.priority[priority];
    },

    getPriorityMantineColor: (priority: TicketPriority): string => {
      return MANTINE_SEMANTIC_COLORS.priority[priority];
    },

    // Semantic color helpers
    getSemanticColor: (type: SemanticColor): string => {
      switch (type) {
        case "success":
          return BRAND_COLORS.semantic.success;
        case "warning":
          return BRAND_COLORS.semantic.warning;
        case "danger":
          return BRAND_COLORS.semantic.danger;
        case "info":
          return BRAND_COLORS.semantic.info;
        case "primary":
          return BRAND_COLORS.primary[500];
        case "neutral":
          return BRAND_COLORS.charts.neutral;
        default:
          return BRAND_COLORS.primary[500];
      }
    },

    getSemanticMantineColor: (type: SemanticColor): string => {
      return MANTINE_SEMANTIC_COLORS.actions[type];
    },

    // Chart color helpers
    getChartColor: (index: number): string => {
      const chartColors = [
        BRAND_COLORS.charts.primary,
        BRAND_COLORS.charts.secondary,
        BRAND_COLORS.charts.tertiary,
        BRAND_COLORS.charts.quaternary,
        BRAND_COLORS.charts.accent1,
        BRAND_COLORS.charts.accent2,
        BRAND_COLORS.charts.accent3,
        BRAND_COLORS.charts.accent4,
      ];
      return chartColors[index % chartColors.length];
    },

    // UI color helpers
    ui: {
      border: BRAND_COLORS.ui.border,
      borderLight: BRAND_COLORS.ui.borderLight,
      borderDark: BRAND_COLORS.ui.borderDark,
      overlay: (opacity: "light" | "medium" | "dark" | "subtle" = "medium") => {
        switch (opacity) {
          case "light":
            return BRAND_COLORS.ui.overlayLight;
          case "medium":
            return BRAND_COLORS.ui.overlayMedium;
          case "dark":
            return BRAND_COLORS.ui.overlayDark;
          case "subtle":
            return BRAND_COLORS.ui.overlaySubtle;
          default:
            return BRAND_COLORS.ui.overlayMedium;
        }
      },
      shadow: (intensity: "light" | "medium" | "dark" | "heavy" = "medium") => {
        switch (intensity) {
          case "light":
            return BRAND_COLORS.ui.shadowLight;
          case "medium":
            return BRAND_COLORS.ui.shadowMedium;
          case "dark":
            return BRAND_COLORS.ui.shadowDark;
          case "heavy":
            return BRAND_COLORS.ui.shadowHeavy;
          default:
            return BRAND_COLORS.ui.shadowMedium;
        }
      },
    },

    // Access to Mantine theme colors
    mantine: theme.colors,
  };
}

/**
 * Hook to get status badge color variant
 */
export function useStatusBadgeProps(status: TicketStatus) {
  const { getStatusMantineColor } = useThemeColors();

  return {
    color: getStatusMantineColor(status),
    variant: "filled" as const,
  };
}

/**
 * Hook to get priority badge color variant
 */
export function usePriorityBadgeProps(priority: TicketPriority) {
  const { getPriorityMantineColor } = useThemeColors();

  return {
    color: getPriorityMantineColor(priority),
    variant: "filled" as const,
  };
}
