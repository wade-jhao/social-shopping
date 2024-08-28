import { Box, CircularProgress, Typography } from "@mui/material";

function EmptyPostState(props: {
  isLoadingPostList: boolean;
  type: "live" | "post";
}) {
  const { isLoadingPostList, type } = props;
  return (
    <Box sx={{ mt: 4, textAlign: "center" }}>
      <CircularProgress />
      <Typography color="rgba(0, 0, 0, 0.6)" variant="subtitle2" sx={{ py: 2 }}>
        {isLoadingPostList
          ? `正在載入${type === "live" ? "直播" : "貼文"}...`
          : `沒有任何${type === "live" ? "直播" : "貼文"}`}
      </Typography>
    </Box>
  );
}

export default EmptyPostState;
