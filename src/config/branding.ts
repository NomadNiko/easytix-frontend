/**
 * EASYTIX BRANDING CONFIGURATION
 *
 * This file contains all visual branding elements that can be customized
 * for different clients or deployment environments.
 *
 * To customize for a client:
 * 1. Update the color values in BRAND_THEMES
 * 2. Select the appropriate theme in ACTIVE_THEME
 * 3. Rebuild the application
 */

// Define different brand themes for various clients
export const BRAND_THEMES = {
  // Default EasyTix branding
  default: {
    name: "EasyTix Default",
    colors: {
      primary: {
        50: "#E6F7FF",
        100: "#BAE7FF",
        200: "#91D5FF",
        300: "#69C0FF",
        400: "#40A9FF",
        500: "#1890FF", // Main brand color
        600: "#096DD9",
        700: "#0050B3",
        800: "#003A8C",
        900: "#002766",
      },
      semantic: {
        success: "#40c057",
        warning: "#fab005",
        danger: "#fa5252",
        info: "#15aabf",
      },
      status: {
        opened: "#228be6",
        inProgress: "#fab005",
        resolved: "#40c057",
        closed: "#868e96",
      },
      priority: {
        high: "#fa5252",
        medium: "#fab005",
        low: "#40c057",
      },
      charts: {
        primary: "#228be6",
        secondary: "#40c057",
        tertiary: "#fab005",
        quaternary: "#fa5252",
        accent1: "#15aabf",
        accent2: "#7950f2",
        accent3: "#fd7e14",
        accent4: "#e64980",
        neutral: "#868e96",
        chartFill: "#8884d8",
      },
    },
  },

  // Example: Corporate Blue theme
  corporateBlue: {
    name: "Corporate Blue",
    colors: {
      primary: {
        50: "#E3F2FD",
        100: "#BBDEFB",
        200: "#90CAF9",
        300: "#64B5F6",
        400: "#42A5F5",
        500: "#2196F3", // Main brand color
        600: "#1E88E5",
        700: "#1976D2",
        800: "#1565C0",
        900: "#0D47A1",
      },
      semantic: {
        success: "#4CAF50",
        warning: "#FF9800",
        danger: "#F44336",
        info: "#00BCD4",
      },
      status: {
        opened: "#2196F3",
        inProgress: "#FF9800",
        resolved: "#4CAF50",
        closed: "#9E9E9E",
      },
      priority: {
        high: "#F44336",
        medium: "#FF9800",
        low: "#4CAF50",
      },
      charts: {
        primary: "#2196F3",
        secondary: "#4CAF50",
        tertiary: "#FF9800",
        quaternary: "#F44336",
        accent1: "#00BCD4",
        accent2: "#9C27B0",
        accent3: "#FF5722",
        accent4: "#E91E63",
        neutral: "#9E9E9E",
        chartFill: "#3F51B5",
      },
    },
  },

  // Example: Green/Eco theme
  ecoGreen: {
    name: "Eco Green",
    colors: {
      primary: {
        50: "#E8F5E8",
        100: "#C8E6C8",
        200: "#A5D6A5",
        300: "#81C784",
        400: "#66BB6A",
        500: "#4CAF50", // Main brand color
        600: "#43A047",
        700: "#388E3C",
        800: "#2E7D32",
        900: "#1B5E20",
      },
      semantic: {
        success: "#4CAF50",
        warning: "#FFC107",
        danger: "#F44336",
        info: "#2196F3",
      },
      status: {
        opened: "#2196F3",
        inProgress: "#FFC107",
        resolved: "#4CAF50",
        closed: "#757575",
      },
      priority: {
        high: "#F44336",
        medium: "#FFC107",
        low: "#4CAF50",
      },
      charts: {
        primary: "#4CAF50",
        secondary: "#8BC34A",
        tertiary: "#CDDC39",
        quaternary: "#FFC107",
        accent1: "#00BCD4",
        accent2: "#9C27B0",
        accent3: "#FF5722",
        accent4: "#E91E63",
        neutral: "#757575",
        chartFill: "#689F38",
      },
    },
  },

  // Example: Professional Purple theme
  professionalPurple: {
    name: "Professional Purple",
    colors: {
      primary: {
        50: "#F3E5F5",
        100: "#E1BEE7",
        200: "#CE93D8",
        300: "#BA68C8",
        400: "#AB47BC",
        500: "#9C27B0", // Main brand color
        600: "#8E24AA",
        700: "#7B1FA2",
        800: "#6A1B9A",
        900: "#4A148C",
      },
      semantic: {
        success: "#4CAF50",
        warning: "#FF9800",
        danger: "#F44336",
        info: "#2196F3",
      },
      status: {
        opened: "#2196F3",
        inProgress: "#FF9800",
        resolved: "#4CAF50",
        closed: "#757575",
      },
      priority: {
        high: "#F44336",
        medium: "#FF9800",
        low: "#4CAF50",
      },
      charts: {
        primary: "#9C27B0",
        secondary: "#673AB7",
        tertiary: "#3F51B5",
        quaternary: "#F44336",
        accent1: "#00BCD4",
        accent2: "#4CAF50",
        accent3: "#FF5722",
        accent4: "#E91E63",
        neutral: "#757575",
        chartFill: "#7B1FA2",
      },
    },
  },
};

// CONFIGURATION: Select the active theme here
export const ACTIVE_THEME = "default"; // Change this to switch themes

// Get the current active theme colors
export const getActiveBrandTheme = () => {
  return (
    BRAND_THEMES[ACTIVE_THEME as keyof typeof BRAND_THEMES] ||
    BRAND_THEMES.default
  );
};

// UI color constants (theme-independent)
export const UI_COLORS = {
  border: "#ddd",
  borderLight: "#e9ecef",
  borderDark: "#adb5bd",
  overlayDark: "rgba(0, 0, 0, 0.7)",
  overlayMedium: "rgba(0, 0, 0, 0.5)",
  overlayLight: "rgba(0, 0, 0, 0.3)",
  overlaySubtle: "rgba(0, 0, 0, 0.15)",
  shadowLight: "rgba(0, 0, 0, 0.05)",
  shadowMedium: "rgba(0, 0, 0, 0.1)",
  shadowDark: "rgba(0, 0, 0, 0.15)",
  shadowHeavy: "rgba(0, 0, 0, 0.2)",

  // Avatar & User Colors
  avatarShadowLight: "rgba(0, 100, 255, 0.4)",
  avatarShadowDark: "rgba(114, 180, 255, 0.4)",
};

// Export the active brand colors (this is what components should use)
export const BRAND_COLORS = {
  ...getActiveBrandTheme().colors,
  ui: UI_COLORS,
  user: {
    avatarShadowLight: UI_COLORS.avatarShadowLight,
    avatarShadowDark: UI_COLORS.avatarShadowDark,
  },
};

// Mantine Color Mappings for consistent theming
export const MANTINE_SEMANTIC_COLORS = {
  status: {
    opened: "blue",
    inProgress: "yellow",
    resolved: "green",
    closed: "gray",
  },
  priority: {
    high: "red",
    medium: "yellow",
    low: "green",
  },
  actions: {
    success: "green",
    warning: "yellow",
    danger: "red",
    info: "blue",
    neutral: "gray",
    primary: "blue",
  },
};

/**
 * DEPLOYMENT INSTRUCTIONS FOR DIFFERENT CLIENTS:
 *
 * 1. For a new client theme:
 *    - Add a new theme object to BRAND_THEMES
 *    - Update ACTIVE_THEME to point to your new theme
 *    - Rebuild the application
 *
 * 2. For environment-specific themes:
 *    - Use environment variables to set ACTIVE_THEME
 *    - Example: NEXT_PUBLIC_BRAND_THEME=corporateBlue
 *
 * 3. For runtime theme switching:
 *    - Implement theme context provider
 *    - Allow users to select from available themes
 *
 * 4. Color customization guidelines:
 *    - Primary colors: Main brand identity (buttons, links, headers)
 *    - Semantic colors: Success, warning, danger, info states
 *    - Status colors: Ticket status indicators
 *    - Priority colors: Ticket priority indicators
 *    - Chart colors: Analytics and reporting visualizations
 */
