import { Box, LoadingOverlay, useMantineTheme } from "@mantine/core";

function Loading() {
  const theme = useMantineTheme();
  
  return (
    <Box style={{ width: theme.other.heights.full, height: theme.other.heights.screen, position: "relative" }}>
      <LoadingOverlay visible={true} />
    </Box>
  );
}

export default Loading;
