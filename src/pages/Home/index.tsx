import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import HomeIcon from "@assets/home.svg";
import Container from "@mui/material/Container";
import useMediaQuery from "@mui/material/useMediaQuery";
import AnnouncementsActivity from "@components/Announcements/AnnouncementsActivity";

function Home() {
  const matches = useMediaQuery("(min-width:600px)");
  return (
    <>
      <Container
        maxWidth="md"
        sx={{
          mt: 3,
          px: {
            md: 2,
            lg: 0,
            xl: 0,
          },
        }}
      >
        <AnnouncementsActivity />
      </Container>
      <Container
        id="live-room-container-id"
        disableGutters
        maxWidth="md"
        sx={{
          maxHeight: 450,
          background: "#fff",
          mt: 3,
          pt: 4,
          pb: 4,
          pl: matches ? 15 : 4,
          pr: matches ? 15 : 4,
        }}
      >
        <Box
          sx={{
            display: "flex",
            background: "#fff",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <img style={{ width: 200 }} src={HomeIcon}></img>
          <Typography variant="h6" sx={{ color: "#000" }}>
            歡迎來到矽羽直播主控台！
          </Typography>
          <Typography
            variant="body2"
            sx={{ mt: 1, color: "rgba(0, 0, 0, 0.60)", textAlign: "center" }}
          >
            您的全方位直播管理中心！輕鬆掌握排程、互動、商品和數據分析等功能。請從矽羽後台開啟「+1活動管理」並點選「直播主控台」，以查看完整資料內容。
          </Typography>
          <Box sx={{ display: "inline-block", textAlign: "center", mt: 1 }}>
            <Typography
              variant="body2"
              sx={{
                color: "rgba(0, 0, 0, 0.60)",
                display: "inline",
              }}
            >
              若您尚未擁有矽羽後台，請至
            </Typography>
            <Link
              sx={{
                cursor: "pointer",
                display: "inline",
              }}
              href={"https://www.sysfeather.com/"}
              target="_"
            >
              官網
            </Link>
            <Typography
              variant="body2"
              sx={{
                color: "rgba(0, 0, 0, 0.60)",
                display: "inline",
              }}
            >
              了解詳情並聯繫矽羽服務人員。
            </Typography>
          </Box>
        </Box>
      </Container>
    </>
  );
}

export default Home;
