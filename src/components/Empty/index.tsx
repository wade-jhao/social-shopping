import empty from "@assets/empty.png";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

interface PROPS {
  message: string;
  image?: string;
  width?: number;
}

function Empty(props: PROPS) {
  const { message, image = empty, width = 120 } = props;

  return (
    <>
      <Box sx={{ minWidth: "200px", textAlign: "center" }}>
        <img src={image} style={{ width: `${width}px` }} />
        <Typography color="rgba(0, 0, 0, 0.6)" variant="subtitle2">
          {message}
        </Typography>
      </Box>
    </>
  );
}

export default Empty;
