# EasyTix Branding & Theme Customization Guide

This guide explains how to customize the visual appearance of EasyTix for different clients and brands.

## Overview

EasyTix uses a centralized theming system that allows you to easily customize:

- Brand colors (primary, secondary, accent colors)
- Status indicators (opened, in-progress, resolved, closed)
- Priority colors (high, medium, low)
- Chart and analytics colors
- UI elements (borders, shadows, overlays)

## Quick Start

### 1. Changing the Active Theme

Edit `/src/config/branding.ts`:

```typescript
// Change this line to switch themes
export const ACTIVE_THEME = "corporateBlue"; // or 'ecoGreen', 'professionalPurple', etc.
```

### 2. Creating a Custom Theme

Add your custom theme to the `BRAND_THEMES` object in `/src/config/branding.ts`:

```typescript
export const BRAND_THEMES = {
  // ... existing themes

  myCompany: {
    name: "My Company Theme",
    colors: {
      primary: {
        50: "#F0F9FF", // Lightest shade
        100: "#E0F2FE",
        200: "#BAE6FD",
        300: "#7DD3FC",
        400: "#38BDF8",
        500: "#0EA5E9", // Main brand color
        600: "#0284C7",
        700: "#0369A1",
        800: "#075985",
        900: "#0C4A6E", // Darkest shade
      },
      semantic: {
        success: "#10B981", // Green for success states
        warning: "#F59E0B", // Orange/Yellow for warnings
        danger: "#EF4444", // Red for errors/danger
        info: "#3B82F6", // Blue for information
      },
      status: {
        opened: "#3B82F6", // Blue - new tickets
        inProgress: "#F59E0B", // Orange - being worked on
        resolved: "#10B981", // Green - completed
        closed: "#6B7280", // Gray - archived
      },
      priority: {
        high: "#EF4444", // Red - urgent
        medium: "#F59E0B", // Orange - important
        low: "#10B981", // Green - low priority
      },
      charts: {
        primary: "#0EA5E9",
        secondary: "#10B981",
        tertiary: "#F59E0B",
        quaternary: "#EF4444",
        accent1: "#8B5CF6",
        accent2: "#06B6D4",
        accent3: "#F97316",
        accent4: "#EC4899",
        neutral: "#6B7280",
        chartFill: "#3B82F6",
      },
    },
  },
};
```

### 3. Update the Active Theme

```typescript
export const ACTIVE_THEME = "myCompany";
```

### 4. Rebuild the Application

```bash
npm run build
# or
yarn build
```

## Color Usage Guide

### Primary Colors

- **Purpose**: Main brand identity, primary buttons, navigation
- **Shades**: Use 500 for main color, lighter shades for backgrounds, darker for hover states

### Semantic Colors

- **Success**: Confirmation messages, success buttons, positive indicators
- **Warning**: Alert messages, caution states, medium priority items
- **Danger**: Error messages, delete buttons, high priority items
- **Info**: Information messages, help text, neutral actions

### Status Colors

- **Opened**: New tickets waiting for assignment
- **In Progress**: Tickets currently being worked on
- **Resolved**: Tickets that have been completed
- **Closed**: Tickets that are archived/finished

### Priority Colors

- **High**: Urgent tickets requiring immediate attention
- **Medium**: Important tickets with normal priority
- **Low**: Non-urgent tickets that can wait

## Components Using Theme Colors

### Automatically Updated Components

When you change the theme, these components automatically update:

1. **Reports & Analytics**

   - Charts and graphs
   - Priority distribution
   - Status flow diagrams
   - Performance metrics

2. **Ticket Management**

   - Status badges
   - Priority indicators
   - Board columns
   - Timeline views

3. **UI Elements**
   - Buttons and links
   - Form elements
   - Cards and papers
   - Modals and overlays

## Advanced Customization

### Environment-Specific Themes

You can set different themes for different environments using environment variables:

```bash
# .env.local
NEXT_PUBLIC_BRAND_THEME=corporateBlue

# .env.production
NEXT_PUBLIC_BRAND_THEME=myCompany
```

Then modify `/src/config/branding.ts`:

```typescript
export const ACTIVE_THEME = process.env.NEXT_PUBLIC_BRAND_THEME || "default";
```

### Using Theme Colors in Components

Use the `useThemeColors` hook to access colors in your components:

```typescript
import { useThemeColors } from '@/hooks/use-theme-colors';

function MyComponent() {
  const colors = useThemeColors();

  return (
    <div style={{
      backgroundColor: colors.brand.primary[500],
      borderColor: colors.getStatusColor('opened'),
      color: colors.getSemanticColor('success')
    }}>
      {/* Your content */}
    </div>
  );
}
```

### Color Helper Functions

```typescript
const colors = useThemeColors();

// Get status colors
colors.getStatusColor("opened"); // Returns hex color
colors.getStatusMantineColor("opened"); // Returns Mantine color name

// Get priority colors
colors.getPriorityColor("high"); // Returns hex color
colors.getPriorityMantineColor("high"); // Returns Mantine color name

// Get semantic colors
colors.getSemanticColor("success"); // Returns hex color
colors.getSemanticMantineColor("success"); // Returns Mantine color name

// Get chart colors
colors.getChartColor(0); // Returns first chart color
colors.getChartColor(1); // Returns second chart color

// Get UI colors
colors.ui.border; // Border color
colors.ui.overlay("medium"); // Overlay with opacity
colors.ui.shadow("light"); // Shadow color
```

## Pre-built Themes

### 1. Default (EasyTix Blue)

- **Primary**: Blue (#1890FF)
- **Use Case**: Standard EasyTix branding
- **Best For**: General purpose, tech companies

### 2. Corporate Blue

- **Primary**: Material Blue (#2196F3)
- **Use Case**: Professional corporate environments
- **Best For**: Enterprise clients, financial services

### 3. Eco Green

- **Primary**: Material Green (#4CAF50)
- **Use Case**: Environmental, sustainability-focused organizations
- **Best For**: Green companies, non-profits, outdoor industries

### 4. Professional Purple

- **Primary**: Material Purple (#9C27B0)
- **Use Case**: Creative, modern professional services
- **Best For**: Design agencies, consulting firms, startups

## Deployment Instructions

### For Different Clients

1. **Single Client Deployment**

   - Modify `ACTIVE_THEME` in `/src/config/branding.ts`
   - Build and deploy

2. **Multi-Client Deployment**

   - Use environment variables to set themes
   - Deploy different builds for different clients
   - Or implement runtime theme switching

3. **White Label Solutions**
   - Create client-specific theme objects
   - Use build-time or runtime theme selection
   - Customize logos and other assets alongside colors

### Build Process

```bash
# 1. Update theme configuration
# Edit /src/config/branding.ts

# 2. Install dependencies
npm install

# 3. Build application
npm run build

# 4. Deploy
npm start
```

## Best Practices

### Color Selection

1. **Accessibility**: Ensure sufficient contrast ratios (WCAG 2.1 AA)
2. **Consistency**: Use colors consistently across all components
3. **Brand Alignment**: Match client's existing brand guidelines
4. **Semantic Meaning**: Maintain intuitive color meanings (red=danger, green=success)

### Testing

1. **Visual Testing**: Check all pages and components
2. **Accessibility Testing**: Verify contrast ratios and color blindness compatibility
3. **Cross-browser Testing**: Ensure colors render consistently
4. **Device Testing**: Test on different screen sizes and types

### Maintenance

1. **Documentation**: Document custom themes and their purposes
2. **Version Control**: Keep theme configurations in source control
3. **Backup**: Maintain backups of working theme configurations
4. **Updates**: Test theme compatibility when updating dependencies

## Troubleshooting

### Common Issues

1. **Colors Not Updating**

   - Clear browser cache
   - Verify theme is imported correctly
   - Check for TypeScript errors
   - Rebuild the application

2. **Accessibility Issues**

   - Use online contrast checkers
   - Test with screen readers
   - Verify color-blind accessibility

3. **Component Inconsistencies**
   - Check if component uses theme colors
   - Verify color mapping is correct
   - Update component to use `useThemeColors` hook

### Getting Help

1. Check the browser console for errors
2. Verify all imports are correct
3. Test with the default theme first
4. Review the component implementation
5. Check if colors are being overridden by CSS

## Future Enhancements

### Planned Features

1. **Runtime Theme Switching**: Allow users to switch themes without rebuilding
2. **Theme Builder UI**: Visual interface for creating custom themes
3. **Advanced Color Tools**: Color palette generators and accessibility checkers
4. **Theme Marketplace**: Shared themes from the community
5. **Brand Asset Management**: Logo, fonts, and other brand elements

This system provides a solid foundation for customizing EasyTix to match any brand or client requirements while maintaining consistency and accessibility.
