import DeleteForeverOutlinedIcon from "@mui/icons-material/DeleteForeverOutlined";

import { Box, Typography } from "@mui/material";

interface PROPS {
  liveRoomHeight?: number;
  activityHeight?: number;
}
function PostIsDeleteRemind(props: PROPS) {
  const { liveRoomHeight, activityHeight } = props;
  return (
    <Box
      sx={{
        height:
          liveRoomHeight && activityHeight
            ? Math.floor(liveRoomHeight - activityHeight)
            : "calc(100vh - 48px)",
        width: "100%",
        background: "#000000",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <DeleteForeverOutlinedIcon sx={{ color: "white", mb: 2 }} />
      <Typography sx={{ color: "white" }}>直播已刪除</Typography>
    </Box>
  );
}

export default PostIsDeleteRemind;
