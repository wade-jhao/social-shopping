import ExpiredToken from "@assets/expired-token.svg";

import { Container, Grid, Typography } from "@mui/material";
interface PROPS {
  error: {
    message: string;
    source?: string;
    lineno?: number;
    colno?: number;
    error?: Error;
  };
}
function ErrorBlock(props: PROPS) {
  const { error } = props;
  return (
    <Container maxWidth={"md"}>
      <Grid
        container
        justifyContent={"center"}
        alignItems={"center"}
        sx={{
          height: "100vh",
          textAlign: "center",
        }}
      >
        <Grid
          item
          sx={{
            width: "100%",
            backgroundColor: "background.paper",
            py: 5,
            px: 2,
          }}
        >
          <img
            style={{ width: "100%", maxWidth: 200 }}
            src={ExpiredToken}
            alt="Error Icon"
          />
          <Typography variant="h5" sx={{ mt: 2, mb: 1 }}>
            發生了一些問題！
          </Typography>
          <Typography variant="body1" sx={{ my: 1 }}>
            建議您回到後台切換使用
            {window.location.host.includes("prod") ? "最新版" : "穩定版"}
            ，如果問題仍存在請聯絡客服人員。
          </Typography>
          <Typography variant="body1" sx={{ color: "text.disabled" }}>
            message: {error.message}
          </Typography>
          <Typography variant="body2" sx={{ color: "text.disabled" }}>
            {error.source && `source: ${error.source}`}
          </Typography>
          <Typography variant="body2" sx={{ color: "text.disabled" }}>
            {(error.lineno || error.colno) &&
              `lineno: ${error.lineno}:${error.colno}`}
          </Typography>
          <Typography variant="body2" sx={{ color: "text.disabled" }}>
            {error.error && `error: ${JSON.stringify(error.error)}`}
          </Typography>
        </Grid>
      </Grid>
    </Container>
  );
}

export default ErrorBlock;
