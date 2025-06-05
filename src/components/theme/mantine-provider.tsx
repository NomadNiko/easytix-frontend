import {
  MantineProvider,
  createTheme,
  ColorSchemeScript,
  rem,
} from "@mantine/core";
import { oxanium } from "@/config/fonts";
import { BRAND_COLORS, MANTINE_SEMANTIC_COLORS } from "@/config/branding";
import "@mantine/core/styles.css";

const theme = createTheme({
  primaryColor: "blue",
  colors: {
    blue: [
      BRAND_COLORS.primary[50],
      BRAND_COLORS.primary[100],
      BRAND_COLORS.primary[200],
      BRAND_COLORS.primary[300],
      BRAND_COLORS.primary[400],
      BRAND_COLORS.primary[500],
      BRAND_COLORS.primary[600],
      BRAND_COLORS.primary[700],
      BRAND_COLORS.primary[800],
      BRAND_COLORS.primary[900],
    ],
  },
  fontFamily: `${oxanium.style.fontFamily}, system-ui, sans-serif`,
  fontSizes: {
    xs: rem(12),
    sm: rem(14),
    md: rem(16),
    lg: rem(18),
    xl: rem(20),
  },
  spacing: {
    xs: rem(4),
    sm: rem(8),
    md: rem(16),
    lg: rem(24),
    xl: rem(32),
  },
  radius: {
    xs: rem(2),
    sm: rem(4),
    md: rem(8),
    lg: rem(16),
    xl: rem(32),
  },
  shadows: {
    xs: `0 1px 3px ${BRAND_COLORS.ui.shadowLight}, 0 1px 2px ${BRAND_COLORS.ui.shadowMedium}`,
    sm: `0 2px 4px ${BRAND_COLORS.ui.shadowLight}, 0 1px 2px ${BRAND_COLORS.ui.shadowMedium}`,
    md: `0 4px 12px ${BRAND_COLORS.ui.shadowDark}`,
    lg: `0 8px 16px ${BRAND_COLORS.ui.shadowDark}`,
    xl: `0 12px 24px ${BRAND_COLORS.ui.shadowHeavy}`,
  },
  other: {
    // Custom spacing values
    spacing: {
      "2": rem(2),
      "4": rem(4),
      "6": rem(6),
      "8": rem(8),
      "10": rem(10),
      "12": rem(12),
      "16": rem(16),
      "20": rem(20),
      "24": rem(24),
      "32": rem(32),
      "40": rem(40),
      "48": rem(48),
      "56": rem(56),
      "64": rem(64),
    },
    // Icon sizes
    iconSizes: {
      xs: rem(10),
      sm: rem(12),
      md: rem(16),
      lg: rem(18),
      xl: rem(24),
    },
    // Icon sizes for Tabler icons (pixel values)
    iconSizesPixels: {
      xs: 10,
      sm: 12,
      md: 16,
      lg: 18,
      xl: 24,
    },
    // Z-index values
    zIndex: {
      base: 0,
      dropdown: 5,
      sticky: 10,
      fixed: 20,
      modalBackdrop: 30,
      modal: 40,
      popover: 50,
      tooltip: 60,
      dragging: 9999,
    },
    // Transitions
    transitions: {
      fast: "0.1s ease",
      base: "0.2s ease",
      slow: "0.3s ease",
      verySlow: "0.5s ease",
    },
    // Border styles using brand colors
    borders: {
      default: `1px solid ${BRAND_COLORS.ui.border}`,
      light: `1px solid ${BRAND_COLORS.ui.borderLight}`,
      dark: `1px solid ${BRAND_COLORS.ui.borderDark}`,
    },
    // Opacity values
    opacity: {
      disabled: 0.6,
      hover: 0.8,
      subtle: 0.5,
      overlay: 0.5,
    },
    // Centralized Brand Colors
    brandColors: BRAND_COLORS,

    // Semantic Color Mappings
    semanticColors: MANTINE_SEMANTIC_COLORS,

    // Custom colors (legacy support)
    customColors: {
      overlayDark: BRAND_COLORS.ui.overlayMedium,
      overlayMedium: BRAND_COLORS.ui.overlayLight,
      overlayLight: BRAND_COLORS.ui.overlaySubtle,
      border: BRAND_COLORS.ui.border,
    },
    // Table widths
    tableWidths: {
      checkbox: rem(60),
      name: rem(200),
      email: rem(180),
      status: rem(120),
      avatar: rem(100),
      actions: rem(450),
    },
    // Component heights
    heights: {
      ticket: rem(74),
      full: "100%",
      screen: "100vh",
    },
    // Priority indicator
    priorityIndicator: {
      size: rem(8),
    },
  },
  components: {
    Button: {
      defaultProps: {
        size: "md",
      },
    },
    Text: {
      defaultProps: {
        size: "sm",
      },
    },
    Title: {
      defaultProps: {
        order: 3,
      },
    },
    Paper: {
      defaultProps: {
        shadow: "xs",
        radius: "md",
        p: "md",
      },
    },
    Card: {
      defaultProps: {
        shadow: "xs",
        radius: "md",
        padding: "md",
      },
    },
    Modal: {
      defaultProps: {
        radius: "md",
        shadow: "lg",
      },
    },
    Table: {
      defaultProps: {
        verticalSpacing: "sm",
        horizontalSpacing: "md",
      },
    },
  },
});

export function MantineProviders({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ColorSchemeScript defaultColorScheme="light" />
      <MantineProvider theme={theme} defaultColorScheme="light">
        {children}
      </MantineProvider>
    </>
  );
}

// Replace InitColorSchemeScript with this component
export function InitColorSchemeScript() {
  return <ColorSchemeScript defaultColorScheme="light" />;
}

// Export theme and brand colors for use in components
export { theme, BRAND_COLORS, MANTINE_SEMANTIC_COLORS };
