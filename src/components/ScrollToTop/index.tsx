import * as React from "react";
import useScrollTrigger from "@mui/material/useScrollTrigger";
import Box from "@mui/material/Box";
import Fade from "@mui/material/Fade";

interface Props {
  /**
   * Injected by the documentation to work in an iframe.
   * You won't need it on your project.
   */
  window?: () => Window;
  children: React.ReactElement;
}

function ScrollTop(props: Props) {
  const { children, window } = props;
  // Note that you normally won't need to set the window ref as useScrollTrigger
  // will default to window.
  // This is only being set here because the demo is in an iframe.
  const trigger = useScrollTrigger({
    target: window ? window() : undefined,
    disableHysteresis: true,
    threshold: 100,
  });

  const handleClick = (
    event: React.MouseEvent<HTMLDivElement>,
    elementId: string = "mobile-header"
  ) => {
    if (elementId) {
      const anchor = (
        (event.target as HTMLDivElement).ownerDocument || document
      ).querySelector("#mobile-header");
      if (anchor) {
        anchor.scrollIntoView({
          behavior: "smooth",
          block: "end",
        });
      }
    }
  };

  return (
    <Fade in={trigger}>
      <Box
        onClick={handleClick}
        role="presentation"
        sx={{ position: "fixed", bottom: 100, right: 25 }}
      >
        {children}
      </Box>
    </Fade>
  );
}

export default ScrollTop;
