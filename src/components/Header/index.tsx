import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
// import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
// import Menu from "@mui/material/Menu";
// import MenuIcon from "@mui/icons-material/Menu";
import Container from "@mui/material/Container";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
// import Button from "@mui/material/Button";
// import MenuItem from "@mui/material/MenuItem";
import sysfeatherIcon from "@assets/new-sysfeather.png";
// import Divider from "@mui/material/Divider";
import { useAppSelector } from "@store/hooks";
// import { selectUserInfo } from "@store/userSlice";
import { selectIsFullscreen } from "@store/commonSlice";
import style from "./index.module.scss";
import { createTheme, ThemeProvider } from "@mui/material/styles";

// Create a custom theme
const theme = createTheme({
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          // Add padding here to create the desired space between the icon and indicator
          backgroundColor: "#fff", // adjust this value as necessary
        },
      },
    },
  },
});

interface HEADER_ITEM {
  name: string;
  onClick?: Function;
}

interface PROPS {
  pageList?: HEADER_ITEM[];
  settingList: HEADER_ITEM[];
}

function Header(props: PROPS) {
  // const userInfo = useAppSelector(selectUserInfo);
  // const { settingList } = props;
  const isFullscreen = useAppSelector(selectIsFullscreen);
  // const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(
  //   null
  // );
  // const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(
  //   null
  // );

  // const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
  //   setAnchorElNav(event.currentTarget);
  // };
  // const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
  //   setAnchorElUser(event.currentTarget);
  // };

  // const handleCloseNavMenu = () => {
  //   setAnchorElNav(null);
  // };

  // const handleCloseUserMenu = (func?: Function) => {
  //   func && func();
  //   setAnchorElUser(null);
  // };

  return (
    <div
      className={style.header}
      id="header"
      style={{ display: isFullscreen ? "none" : "block" }}
    >
      <ThemeProvider theme={theme}>
        <AppBar position="static">
          <Container maxWidth={false}>
            <Toolbar disableGutters>
              <Box sx={{ display: { xs: "none", md: "flex" }, mr: 1 }}>
                <Avatar
                  sx={{ m: 1, bgcolor: "#fff", width: 32, height: 32 }}
                  src={sysfeatherIcon}
                />
              </Box>
              <Typography
                variant="h6"
                noWrap
                component="a"
                href="/"
                sx={{
                  mr: 2,
                  display: { xs: "none", md: "flex" },
                  fontFamily: "monospace",
                  fontWeight: 700,
                  letterSpacing: ".3rem",
                  color: "rgba(0, 0, 0, 0.87)",
                  textDecoration: "none",
                }}
              >
                矽羽直播主控台
              </Typography>

              <Box
                sx={{
                  display: {
                    xs: "flex",
                    md: "none",
                    // justifyContent: "space-between",
                  },
                }}
              >
                {/* <IconButton
                  size="large"
                  aria-label="account of current user"
                  aria-controls="menu-appbar"
                  aria-haspopup="true"
                  // onClick={handleOpenNavMenu}
                  color="inherit"
                >
                  <MenuIcon />
                </IconButton> */}

                {/* <Menu
                  id="menu-appbar"
                  anchorEl={anchorElNav}
                  anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "left",
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: "top",
                    horizontal: "left",
                  }}
                  open={Boolean(anchorElNav)}
                  onClose={handleCloseNavMenu}
                  sx={{
                    display: { xs: "block", md: "none" },
                  }}
                >
                  {pageList.map((page, index) => (
                    <MenuItem
                      key={index}
                      onClick={() => {
                        page.onClick && page.onClick();
                        handleCloseNavMenu();
                      }}
                    >
                      <Typography textAlign="center">{page.name}</Typography>
                    </MenuItem>
                  ))}
                </Menu> */}
              </Box>
              <Box
                sx={{
                  flexGrow: 1,
                  display: { xs: "flex", md: "none", alignItems: "center" },
                }}
              >
                <Avatar
                  sx={{ mr: 1, bgcolor: "#fff", width: 32, height: 32 }}
                  src={sysfeatherIcon}
                />
                <Typography
                  variant="h6"
                  noWrap
                  component="a"
                  href=""
                  sx={{
                    display: { xs: "flex", md: "none" },
                    mr: 1,
                    fontFamily: "monospace",
                    fontWeight: 700,
                    letterSpacing: ".3rem",
                    textDecoration: "none",
                    color: "rgba(0, 0, 0, 0.87)",
                  }}
                >
                  矽羽直播主控台
                </Typography>
                <Chip
                  sx={{
                    display: { xs: "flex", md: "none" },
                  }}
                  variant="outlined"
                  label="Beta"
                  color="warning"
                  size="small"
                />
              </Box>
              {/* <Box
                sx={{
                  display: { xs: "flex", md: "none", alignItems: "center" },
                }}
              >
                <Typography
                  variant="h6"
                  noWrap
                  component="a"
                  href=""
                  sx={{
                    display: { xs: "flex", md: "none" },
                    flexGrow: 1,
                    fontFamily: "monospace",
                    fontWeight: 700,
                    letterSpacing: ".3rem",
                    textDecoration: "none",
                    color: "rgba(0, 0, 0, 0.87)",
                  }}
                >
                  矽羽直播主控台
                </Typography>
                <Chip
                  variant="outlined"
                  label="Beta"
                  color="warning"
                  size="small"
                />
              </Box> */}
              <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
                <Chip
                  variant="outlined"
                  label="Beta"
                  color="warning"
                  size="small"
                />
              </Box>

              {/* <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
                {pageList.map((page, index) => (
                  <Button
                    key={index}
                    onClick={() => {
                      page.onClick && page.onClick();
                      handleCloseNavMenu();
                    }}
                    sx={{ my: 2, color: "white", display: "block" }}
                  >
                    {page.name}
                  </Button>
                ))}
              </Box> */}

              {/* <Box sx={{ flexGrow: 0 }}>
                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                  <Avatar
                    alt={userInfo?.facebook_account.username}
                    src={userInfo?.facebook_account.avatar_url}
                  >
                    {userInfo?.facebook_account.username.charAt(0) || ""}
                  </Avatar>
                </IconButton>
                <Menu
                  sx={{ mt: "45px" }}
                  id="menu-appbar"
                  anchorEl={anchorElUser}
                  anchorOrigin={{
                    vertical: "top",
                    horizontal: "right",
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: "top",
                    horizontal: "right",
                  }}
                  open={Boolean(anchorElUser)}
                  onClose={() => handleCloseUserMenu()}
                >
                  <MenuItem
                    key={-1}
                    children={
                      <>
                        <Avatar
                          alt={userInfo?.facebook_account.username}
                          src={userInfo?.facebook_account.avatar_url}
                          sx={{ mr: 1 }}
                        >
                          {userInfo?.facebook_account.username.charAt(0) || ""}
                        </Avatar>
                        <span>
                          <Typography variant="subtitle1">
                            {`${userInfo?.facebook_account.username} (${userInfo?.facebook_account.asid})`}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ color: "rgba(0,0,0,.55)" }}
                          >
                            {userInfo?.facebook_account.email}
                          </Typography>
                        </span>
                      </>
                    }
                  ></MenuItem>
                  <Divider />
                  {settingList.map((setting, index) => (
                    <MenuItem
                      key={index}
                      onClick={() => handleCloseUserMenu(setting.onClick)}
                    >
                      <Typography textAlign="center">{setting.name}</Typography>
                    </MenuItem>
                  ))}
                </Menu>
              </Box> */}
            </Toolbar>
          </Container>
        </AppBar>
      </ThemeProvider>
    </div>
  );
}
export default Header;
