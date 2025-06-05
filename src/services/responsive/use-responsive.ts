"use client";
import { useMediaQuery } from "@mantine/hooks";

/**
 * Hook for responsive design decisions
 * Returns boolean flags for different device sizes
 * Aligned with Mantine's breakpoint system
 */
export function useResponsive() {
  // Using Mantine's standard breakpoints
  const isMobile = useMediaQuery("(max-width: 48em)"); // 768px - matches 'sm' in Mantine
  const isTablet = useMediaQuery(
    "(min-width: 48.0625em) and (max-width: 64em)"
  );
  const isDesktop = useMediaQuery("(min-width: 64.0625em)");

  return { isMobile, isTablet, isDesktop };
}
