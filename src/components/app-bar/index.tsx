// src/components/app-bar/index.tsx
"use client";
import {
  AppShell,
  Burger,
  Group,
  Container,
  useMantineTheme,
} from "@mantine/core";
import { useState } from "react";
import { SwitchThemeButton } from "@/components/theme/SwitchThemeButton";
import Logo from "./logo";
import DesktopNavigation from "./desktop-navigation";
import MobileNavigation from "./mobile-navigation";
import AuthSection from "./auth-section";
import NotificationIcon from "./notification-icon";

const ResponsiveAppBar = ({ children }: { children: React.ReactNode }) => {
  const [opened, setOpened] = useState(false);
  const theme = useMantineTheme();

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: { base: 240, sm: 300 },
        breakpoint: "sm", // Using 'sm' to match our useResponsive hook's isMobile (48em/768px)
        collapsed: { desktop: true, mobile: !opened },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Container size="xl" py="md">
          <Group justify="space-between">
            {/* Left side: Burger (mobile), Logo, Navigation Links */}
            <Group>
              {/* Mobile Burger - hide on sm and above */}
              <Burger
                opened={opened}
                onClick={() => setOpened((o) => !o)}
                hiddenFrom="sm"
                size="sm"
                data-testid="mobile-menu-burger"
              />
              {/* Desktop Logo - hide on mobile */}
              <Logo visibleFrom="sm" />
              {/* Desktop Navigation - hide on mobile */}
              <DesktopNavigation onCloseMenu={() => setOpened(false)} />
            </Group>

            {/* Mobile Logo - hide on desktop */}
            <Logo isMobile hiddenFrom="sm" />

            {/* Right side: Notification Icon, Theme Switch and Auth Section */}
            <Group>
              {/* Notification Icon */}
              <NotificationIcon />
              {/* Theme Switch Button */}
              <SwitchThemeButton />
              {/* Authentication Section */}
              <AuthSection />
            </Group>
          </Group>
        </Container>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <MobileNavigation onCloseMenu={() => setOpened(false)} />
      </AppShell.Navbar>

      <AppShell.Main>{children}</AppShell.Main>

      {/* Overlay to allow clicking outside navbar to close it */}
      {opened && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: theme.other.customColors.overlayMedium,
            zIndex: theme.other.zIndex.dropdown,
            cursor: "pointer",
          }}
          onClick={() => setOpened(false)}
        />
      )}
    </AppShell>
  );
};

export default ResponsiveAppBar;
