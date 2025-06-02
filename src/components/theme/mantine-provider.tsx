import {
  MantineProvider,
  createTheme,
  ColorSchemeScript,
  rem,
} from "@mantine/core";
import { oxanium } from "@/config/fonts";
import "@mantine/core/styles.css";

const theme = createTheme({
  primaryColor: "blue",
  colors: {
    blue: [
      "#E6F7FF",
      "#BAE7FF",
      "#91D5FF",
      "#69C0FF",
      "#40A9FF",
      "#1890FF",
      "#096DD9",
      "#0050B3",
      "#003A8C",
      "#002766",
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
    xs: "0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.1)",
    sm: "0 2px 4px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.1)",
    md: "0 4px 12px rgba(0, 0, 0, 0.15)",
    lg: "0 8px 16px rgba(0, 0, 0, 0.15)",
    xl: "0 12px 24px rgba(0, 0, 0, 0.2)",
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
    // Border styles
    borders: {
      default: "1px solid var(--mantine-color-gray-3)",
      light: "1px solid var(--mantine-color-gray-2)",
      dark: "1px solid var(--mantine-color-gray-4)",
    },
    // Opacity values
    opacity: {
      disabled: 0.6,
      hover: 0.8,
      subtle: 0.5,
      overlay: 0.5,
    },
    // Custom colors
    customColors: {
      overlayDark: "rgba(0, 0, 0, 0.5)",
      overlayMedium: "rgba(0, 0, 0, 0.3)",
      overlayLight: "rgba(0, 0, 0, 0.15)",
      border: "#ddd",
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

// Export theme for use in components
export { theme };
