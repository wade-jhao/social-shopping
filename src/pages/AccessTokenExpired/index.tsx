import { useEffect, useState } from "react";
import { selectApis } from "@store/apiSlice";
import { useParams } from "react-router-dom";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import ExpiredToken from "@assets/expired-token.svg";
import Container from "@mui/material/Container";
import { getUrls } from "./apis/legacy";
import { useAppSelector } from "@store/hooks";

function AccessTokenExpired() {
  const apis = useAppSelector(selectApis);
  const [error, setError] = useState("");
  const [url, setUrl] = useState("");
  let { type } = useParams();
  console.log(error);
  useEffect(() => {
    if (type) {
      setError(type);
      getUrls(apis?.urls as string).then((res: any) => {
        setUrl(res.platforms);
      });
    }
  }, []);

  const getErrorTitle = (error: string) => {
    switch (error) {
      case "accessTokenExpired":
        return {
          title: "帳號授權已過期",
          description: "您的社群帳號授權已過期，請前往矽羽後台更新授權。",
        };
      default:
        return {
          title: "",
          description: "",
        };
    }
  };

  return (
    <Container
      id="live-room-container-id"
      disableGutters
      maxWidth="md"
      sx={{ maxHeight: 450, background: "#fff", mt: 3, pt: 4, pb: 4 }}
    >
      <Box
        sx={{
          display: "flex",
          background: "#fff",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <img style={{ width: 200 }} src={ExpiredToken}></img>
        <Typography variant="h6" sx={{ color: "#000" }}>
          {getErrorTitle(error).title}
        </Typography>
        <Typography
          variant="body2"
          sx={{ mt: 1, color: "rgba(0, 0, 0, 0.60)" }}
        >
          {getErrorTitle(error).description}
        </Typography>
        <Link
          sx={{
            cursor: "pointer",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            mt: 2,
          }}
          href={url}
          target="_"
        >
          <Button variant="contained">前往外部網站</Button>
        </Link>
      </Box>
    </Container>
  );
}

export default AccessTokenExpired;
