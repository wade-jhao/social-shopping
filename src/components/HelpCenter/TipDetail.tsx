import { Box, Button, Typography } from "@mui/material";
import OpenInNewOutlinedIcon from "@mui/icons-material/OpenInNewOutlined";
import { HelpCenterTip } from "./types";

interface PROPS {
  tip: HelpCenterTip | null;
}
function TipDetail(props: PROPS) {
  const { tip } = props;
  return (
    <>
      <Typography variant="h6" sx={{ py: 1, px: 2 }} color="text.primary">
        {tip?.title}
      </Typography>
      <Typography variant="body1" sx={{ py: 1, px: 2 }} color="text.primary">
        {tip?.content}
      </Typography>
      {tip?.callToActionLink.isDisplay && (
        <Box sx={{ pt: 1, pb: 1, pl: 0.5 }}>
          <Button
            size="large"
            role="link"
            endIcon={<OpenInNewOutlinedIcon />}
            href={tip?.callToActionLink.href}
            target="_blank"
          >
            前往教學手冊
          </Button>
        </Box>
      )}
    </>
  );
}

export default TipDetail;
