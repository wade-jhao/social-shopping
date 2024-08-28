import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import EmptyActivityIcon from "@assets/emptyActivity.svg";
import Button from "@mui/material/Button";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import { useMediaQuery } from "@mui/material";

interface PROPS {
  onAddProducts: Function;
  onNewLive: Function;
  isDisable: boolean;
  activityListHeight: number;
}

function EmptyActivity(props: PROPS) {
  const { onAddProducts, onNewLive, activityListHeight } = props;
  const matches = useMediaQuery("(min-width:600px)");
  return (
    <Box
      sx={{
        padding: 1,
        transition: " box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms",
        borderRadius: 4,
        boxShadow:
          "rgba(0, 0, 0, 0.2) 0px 2px 1px -1px, rgba(0, 0, 0, 0.14) 0px 1px 1px 0px, rgba(0, 0, 0, 0.12) 0px 1px 3px 0px",
        mb: 2,
        textAlign: "center",
        height: activityListHeight - 24,
        overflowY: "auto",
      }}
    >
      <img
        src={EmptyActivityIcon}
        style={{ width: matches ? "300px" : "150px" }}
      ></img>
      <Typography variant="h6">建立您在此活動的第一場直播</Typography>
      <Typography
        variant="body2"
        sx={{ mt: 2, mb: 2, color: "rgba(0, 0, 0, 0.60)" }}
      >
        開啟全新的直播體驗，輕鬆管理商品與直播互動。
      </Typography>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mb: 1,
        }}
      >
        <Button
          size="medium"
          variant={"outlined"}
          startIcon={<AddCircleOutlineIcon />}
          onClick={() => onAddProducts()}
          sx={{ textAlign: "center", display: "none" }}
        >
          新增活動商品
        </Button>
        <Button
          size="medium"
          variant={"outlined"}
          startIcon={<AddCircleOutlineIcon />}
          onClick={() => onNewLive()}
          sx={{ textAlign: "center", ml: 1 }}
        >
          新增直播
        </Button>
      </Box>
    </Box>
  );
}

export default EmptyActivity;
