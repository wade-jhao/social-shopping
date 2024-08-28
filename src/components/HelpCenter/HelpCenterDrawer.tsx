import {
  Box,
  Button,
  Divider,
  Drawer,
  Grid,
  IconButton,
  InputAdornment,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Slide,
  TextField,
  Typography,
} from "@mui/material";
import useHelpCenterGuideDrivers from "./useGuideDrivers";
import { useLocation } from "react-router";
import { useCallback, useRef, useState } from "react";
import Search from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import OpenInNewOutlinedIcon from "@mui/icons-material/OpenInNewOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import ArrowForwardOutlinedIcon from "@mui/icons-material/ArrowForwardOutlined";
import helpTips from "./helpTips.json";
import TipDetail from "./TipDetail";
import TipList from "./TipList";
import { HelpCenterTip } from "./types";
import "driver.js/dist/driver.css";
import { driver } from "driver.js";
import SearchEmptyState from "./SearchEmptyState";
import _ from "lodash";
import { HELP_CENTER_LINK } from "@components/HelpCenter/outerLink";

interface PROPS {
  anchorEl: null | HTMLElement;
  onClose: Function;
}
function HelpCenterDrawer(props: PROPS) {
  const { pathname } = useLocation();
  const { anchorEl, onClose } = props;
  const open = Boolean(anchorEl);
  const { draftDrivers, liveRoomDrivers } = useHelpCenterGuideDrivers();
  const [currentPage, setCurrentPage] = useState<
    "home" | "tipList" | "tipDetail"
  >("home");
  const [backToPage, setBackToPage] = useState<
    "home" | "tipList" | "tipDetail"
  >("home");
  const [searchInputValue, setSearchInputValue] = useState<string>("");
  const [searchContent, setSearchContent] = useState<string>("");
  const [currentTip, setCurrentTip] = useState<HelpCenterTip | null>(null);

  function onClickTipListItem(tip: HelpCenterTip) {
    setCurrentTip(tip);
    setCurrentPage("tipDetail");
  }
  const tipListSlideDirection = currentPage === "tipDetail" ? "right" : "left";
  const drivers = () => {
    if (pathname.includes("/draft")) {
      return draftDrivers;
    }
    if (pathname.includes("/posts")) {
      return liveRoomDrivers;
    }
    return [];
  };
  const refDriverObj = useRef(
    driver({
      allowClose: true,
      showButtons: [],
    })
  );
  const driverResult =
    searchContent === ""
      ? drivers()
      : drivers().filter((driver) => driver.title.includes(searchContent));

  const tipsResult =
    searchContent === ""
      ? helpTips.contents
      : helpTips.contents.filter(
          (tip) =>
            tip.title.includes(searchContent) ||
            tip.content.includes(searchContent)
        );

  const debounceSearch = _.debounce((val: string) => {
    setSearchContent(val);
  }, 300);

  const searchedCallback = useCallback(
    (val: string) => {
      debounceSearch(val);
    },
    [debounceSearch]
  );

  return (
    <Drawer anchor={"right"} open={open} onClose={() => onClose()} hideBackdrop>
      <Box component="section" sx={{ textAlign: "center" }}>
        <Grid container alignItems="center">
          <Grid item xs="auto">
            <IconButton
              aria-label="back"
              onClick={() => {
                setCurrentPage(backToPage);
                if (backToPage === "tipList") {
                  setBackToPage("home");
                }
              }}
              sx={{
                visibility: currentPage === "home" ? "hidden" : "visible",
              }}
            >
              <ArrowBackOutlinedIcon />
            </IconButton>
          </Grid>
          <Grid item xs>
            <Typography variant="body1" color="text.primary">
              幫助中心
            </Typography>
          </Grid>
          <Grid item xs="auto">
            <IconButton aria-label="close" onClick={() => onClose()}>
              <CloseOutlinedIcon />
            </IconButton>
          </Grid>
        </Grid>
        <Box component="section" sx={{ p: 1, px: 2 }}>
          <TextField
            id="help-center-search"
            label="幫助中心"
            variant="outlined"
            fullWidth
            size="small"
            placeholder="輸入您的問題..."
            value={searchInputValue}
            onChange={(e) => {
              setSearchInputValue(e.target.value);
              searchedCallback(e.target.value);
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
              endAdornment: searchContent.length > 0 && (
                <IconButton
                  onClick={() => {
                    setSearchInputValue("");
                    setSearchContent("");
                  }}
                >
                  <CloseIcon />
                </IconButton>
              ),
            }}
          />
        </Box>
      </Box>
      <Grid component="section" container wrap="nowrap" sx={{ width: 320 }}>
        <Grid item xs>
          <Slide
            direction="right"
            in={currentPage === "home"}
            mountOnEnter
            unmountOnExit
          >
            <Box sx={{ width: 320 }} role="presentation">
              {driverResult.length > 0 && (
                <>
                  <Typography
                    variant="body2"
                    sx={{ pt: 2, pb: 1, pl: 2 }}
                    color="text.secondary"
                  >
                    功能指引
                  </Typography>
                  <List>
                    {driverResult.map((driver) => (
                      <ListItemButton
                        component="a"
                        key={driver.title}
                        disabled={driver.disabled}
                        onClick={() => {
                          refDriverObj.current.highlight(
                            driver.popoverConfiguration
                          );
                        }}
                      >
                        <ListItemIcon>
                          <driver.icon />
                        </ListItemIcon>
                        <ListItemText>{driver.title}</ListItemText>
                      </ListItemButton>
                    ))}
                  </List>
                  <Divider />
                </>
              )}
              {tipsResult.length > 0 && (
                <>
                  <Typography
                    variant="body2"
                    sx={{ pt: 3, pb: 1, pl: 2 }}
                    color="text.secondary"
                  >
                    常見問題
                  </Typography>
                  <List>
                    {tipsResult
                      .filter((tip, index) => {
                        if (searchContent !== "") return true;
                        return index < 5;
                      })
                      .map((tip: HelpCenterTip) => (
                        <ListItemButton
                          component="button"
                          key={tip.title}
                          onClick={() => {
                            onClickTipListItem(tip);
                            setBackToPage("home");
                          }}
                          sx={{ width: "100%" }}
                        >
                          <ListItemText>{tip.title}</ListItemText>
                          <ListItemIcon sx={{ minWidth: 0 }}>
                            <ArrowForwardOutlinedIcon />
                          </ListItemIcon>
                        </ListItemButton>
                      ))}
                  </List>
                </>
              )}
              {searchContent === "" && (
                <Box sx={{ pb: 1, pl: 1 }}>
                  <Button
                    onClick={() => {
                      setCurrentPage("tipList");
                    }}
                  >
                    顯示全部
                  </Button>
                </Box>
              )}
              {driverResult.length === 0 && tipsResult.length === 0 && (
                <SearchEmptyState />
              )}
              <Divider />
              <Box sx={{ pt: 1, pb: 1, pl: 0.5 }}>
                <Button
                  size="large"
                  endIcon={<OpenInNewOutlinedIcon />}
                  role="link"
                  href={HELP_CENTER_LINK}
                  target="_blank"
                >
                  前往教學手冊
                </Button>
              </Box>
            </Box>
          </Slide>
        </Grid>
        <Grid item xs>
          <Slide
            direction={tipListSlideDirection}
            in={currentPage === "tipList"}
            mountOnEnter
            unmountOnExit
          >
            <Box sx={{ width: 320 }} role="presentation">
              <TipList
                onClickListItem={(tip: HelpCenterTip) => {
                  onClickTipListItem(tip);
                  setBackToPage("tipList");
                }}
                tips={tipsResult}
              />
            </Box>
          </Slide>
        </Grid>
        <Grid item xs>
          <Slide
            direction="left"
            in={currentPage === "tipDetail"}
            mountOnEnter
            unmountOnExit
          >
            <Box sx={{ width: 320 }} role="presentation">
              <TipDetail tip={currentTip} />
            </Box>
          </Slide>
        </Grid>
      </Grid>
    </Drawer>
  );
}
export default HelpCenterDrawer;
