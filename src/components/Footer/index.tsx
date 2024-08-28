import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Copyright from "@components/Copyright";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import line from "@assets/line.svg";
import style from "./index.module.scss";
import { useAppSelector } from "@store/hooks";
import { selectIsFullscreen } from "@store/commonSlice";

function StickyFooter() {
  const isFullscreen = useAppSelector(selectIsFullscreen);
  return (
    <Box
      id="footer"
      className={style.footer}
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: "auto",
        backgroundColor: (theme) =>
          theme.palette.mode === "light"
            ? theme.palette.grey[200]
            : theme.palette.grey[800],
        display: isFullscreen ? "none" : "block",
      }}
    >
      <Container maxWidth="sm">
        <Box
          sx={{
            mb: 1,
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Box
            sx={{
              minWidth: "170px",
              display: "flex",
              justifyContent: "space-between",
              opacity: 0.6,
            }}
          >
            <FacebookIcon
              sx={{ cursor: "pointer" }}
              onClick={() => {
                window.open("https://www.facebook.com/Sysfeather", "_blank");
              }}
            />

            <InstagramIcon
              sx={{ cursor: "pointer" }}
              onClick={() => {
                window.open("https://www.facebook.com/Sysfeather", "_blank");
              }}
            />
            <LinkedInIcon
              sx={{ cursor: "pointer" }}
              onClick={() => {
                window.open(
                  "https://tw.linkedin.com/company/sysfeather-co",
                  "_blank"
                );
              }}
            />
            <img
              className={style.line}
              src={line}
              onClick={() => {
                window.open(
                  "https://page.line.me/vqc4618m?openQrModal=true",
                  "_blank"
                );
              }}
            />
          </Box>
        </Box>
        <Copyright link="https://www.sysfeather.com/" title="矽羽智慧電商" />
      </Container>
    </Box>
  );
}

export default StickyFooter;
