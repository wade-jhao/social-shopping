import {
  Box,
  Button,
  Divider,
  Grid,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import OpenInNewOutlinedIcon from "@mui/icons-material/OpenInNewOutlined";
import ArrowForwardOutlinedIcon from "@mui/icons-material/ArrowForwardOutlined";
import { HelpCenterTip } from "./types";
import SearchEmptyState from "./SearchEmptyState";
import { HELP_CENTER_LINK } from "@components/HelpCenter/outerLink";

interface PROPS {
  onClickListItem: Function;
  tips: HelpCenterTip[];
}
function TipList(props: PROPS) {
  const { onClickListItem, tips } = props;
  return (
    <>
      <Grid container direction={"column"}>
        <Grid item xs>
          {tips.length > 0 && (
            <>
              <Typography
                variant="body2"
                sx={{ pt: 1, pb: 1, pl: 2 }}
                color="text.secondary"
              >
                常見問題
              </Typography>
              <List>
                {tips.map((tip) => (
                  <ListItemButton
                    component="button"
                    key={tip.title}
                    onClick={() => onClickListItem(tip)}
                    sx={{ width: "100%" }}
                  >
                    <ListItemText>{tip.title}</ListItemText>
                    <ListItemIcon sx={{ minWidth: 0 }}>
                      <ArrowForwardOutlinedIcon />
                    </ListItemIcon>
                  </ListItemButton>
                ))}
              </List>
            </>
          )}
          {tips.length === 0 && <SearchEmptyState />}
        </Grid>
        <Grid item xs={"auto"}>
          <Divider />
          <Box sx={{ pt: 1, pb: 1, pl: 0.5 }}>
            <Button
              size="large"
              endIcon={<OpenInNewOutlinedIcon />}
              href={HELP_CENTER_LINK}
              target="_blank"
            >
              前往教學手冊
            </Button>
          </Box>
        </Grid>
      </Grid>
    </>
  );
}

export default TipList;
