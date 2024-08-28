import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CommentIcon from "@assets/commentIcon.svg";

function DraftComment() {
  return (
    <>
      <Box
        sx={{
          width: "100%",
          background: "#fff",
          textAlign: "center",
          pb: 2,
        }}
      >
        <img style={{ marginTop: 64 }} src={CommentIcon}></img>
        <Typography variant="h6" sx={{ color: "#000" }}>
          目前沒有留言
        </Typography>
        <Typography
          variant="body2"
          sx={{ color: "rgba(0, 0, 0, 0.60)", mt: 1 }}
        >
          連接直播後，您將能夠即時看到觀眾留言，並在此進行互動。
        </Typography>
      </Box>
    </>
  );
}

export default DraftComment;
