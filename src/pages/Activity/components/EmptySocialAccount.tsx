import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import ExpiredToken from "@assets/expired-token.svg";

import Button from "@mui/material/Button";
import { useAppSelector } from "@store/hooks";
import { selectApis } from "@store/apiSlice";
import { useEffect, useState } from "react";
import { getUrls } from "@pages/AccessTokenExpired/apis/legacy";

interface PROPS {}

function EmptySocialAccount(props: PROPS) {
  const apis = useAppSelector(selectApis);
  const [url, setUrl] = useState("");
  useEffect(() => {
    getUrls(apis?.urls as string).then((res: any) => {
      setUrl(res.platforms);
    });
  }, [apis]);

  return (
    <Box
      sx={{
        px: 5,
        py: 3,
        transition: " box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms",
        borderRadius: 4,
        background: "#fff",
        boxShadow:
          "rgba(0, 0, 0, 0.2) 0px 2px 1px -1px, rgba(0, 0, 0, 0.14) 0px 1px 1px 0px, rgba(0, 0, 0, 0.12) 0px 1px 3px 0px",
        mt: 3,
        mb: 2,
        textAlign: "center",
      }}
    >
      <Box sx={{ width: "100%", textAlign: "center" }}>
        <Box sx={{ py: 3 }}>
          <img src={ExpiredToken}></img>
        </Box>
        <Typography variant="h6">尚未綁定外部網站</Typography>
        <Typography
          variant="body2"
          sx={{ mt: 2, mb: 2, color: "rgba(0, 0, 0, 0.60)" }}
        >
          您尚未綁定任何外部網站，請前往矽羽後台進行綁定。
        </Typography>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mt: 1,
            mb: 3,
          }}
        >
          <Button
            variant={"contained"}
            sx={{ textAlign: "center", ml: 1 }}
            onClick={() => {
              window.location.href = url;
            }}
          >
            前往外部網站
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

export default EmptySocialAccount;
