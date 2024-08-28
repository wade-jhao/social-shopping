import { useEffect } from "react";
import Box from "@mui/material/Box";
import Popper, { PopperPlacementType } from "@mui/material/Popper";
import Fade from "@mui/material/Fade";
import Typography from "@mui/material/Typography";
import CustomAccordion from "@components/CustomAccordion";
import CustomAccordionDetails from "@components/CustomAccordionDetails";
import CustomAccordionSummary from "@components/CustomAccordionSummary";
import Button from "@mui/material/Button";
import "driver.js/dist/driver.css";
interface PROPS {
  anchorEl: null | HTMLElement;
  placement: PopperPlacementType | undefined;
  onGuide: Function;
}

function GuidePopper(props: PROPS) {
  const { anchorEl, placement, onGuide } = props;
  const open = Boolean(anchorEl);
  const detailId = open ? `guide-popper` : undefined;
  useEffect(() => {}, []);

  return (
    <>
      <Popper
        id={detailId}
        open={open}
        anchorEl={anchorEl}
        placement={placement}
        transition
        sx={{ zIndex: 999 }}
      >
        {({ TransitionProps }) => (
          <Fade {...TransitionProps} timeout={350}>
            <Box
              sx={{
                p: 1,
                bgcolor: "background.paper",
                borderRadius: 1,
                boxShadow:
                  "0px 8px 10px -5px rgba(0, 0, 0, 0.20), 0px 16px 24px 2px rgba(0, 0, 0, 0.14), 0px 6px 30px 5px rgba(0, 0, 0, 0.12)",
              }}
            >
              <Box>
                <Typography variant="subtitle1">直播設定步驟</Typography>
              </Box>
              <CustomAccordion>
                <CustomAccordionSummary
                  aria-controls="panel1d-content"
                  id="panel1d-header"
                >
                  <Typography variant="subtitle2">1.新增直播商品</Typography>
                </CustomAccordionSummary>
                <CustomAccordionDetails>
                  <Typography variant="body2">
                    新增活動商品到當前直播
                  </Typography>
                  <Button
                    sx={{ mt: 1 }}
                    size="small"
                    variant="contained"
                    onClick={() =>
                      onGuide([
                        {
                          element: "#add-product-btn",
                          popover: {
                            title: `第一步：新增直播商品`,
                            description: "新增活動商品到當前直播",
                            side: "bottom",
                            align: "start",
                          },
                        },
                      ])
                    }
                  >
                    指引我
                  </Button>
                </CustomAccordionDetails>
              </CustomAccordion>
              <CustomAccordion>
                <CustomAccordionSummary
                  aria-controls="panel1d-content"
                  id="panel1d-header"
                >
                  <Typography variant="subtitle2">2.自動化關鍵字</Typography>
                </CustomAccordionSummary>
                <CustomAccordionDetails>
                  <Typography variant="body2">
                    輸入商品關鍵字前綴，快速編輯多個商品關鍵字
                  </Typography>
                  <Button
                    sx={{ mt: 1 }}
                    size="small"
                    variant="contained"
                    onClick={() =>
                      onGuide([
                        {
                          element: "#more-action-btn",
                          popover: {
                            title: "第二步：自動化關鍵字",
                            description:
                              "輸入商品關鍵字前綴，快速編輯多個商品關鍵字",
                            side: "bottom",
                            align: "start",
                          },
                        },
                      ])
                    }
                  >
                    指引我
                  </Button>
                </CustomAccordionDetails>
              </CustomAccordion>
              <CustomAccordion>
                <CustomAccordionSummary
                  aria-controls="panel1d-content"
                  id="panel1d-header"
                >
                  <Typography variant="subtitle2">3.設定直播折扣</Typography>
                </CustomAccordionSummary>
                <CustomAccordionDetails>
                  <Typography variant="body2">
                    設定直播下單折扣，消費者+1喊單可獲得折扣
                  </Typography>
                  <Button
                    sx={{ mt: 1 }}
                    size="small"
                    variant="contained"
                    onClick={() =>
                      onGuide([
                        {
                          element: "#discount-action",
                          popover: {
                            title: "第三步：設定直播折扣",
                            description:
                              "設定直播下單折扣，消費者+1喊單可獲得折扣",
                            side: "right",
                            align: "start",
                          },
                        },
                      ])
                    }
                  >
                    指引我
                  </Button>
                </CustomAccordionDetails>
              </CustomAccordion>
              <CustomAccordion>
                <CustomAccordionSummary
                  aria-controls="panel1d-content"
                  id="panel1d-header"
                >
                  <Typography variant="subtitle2">4.啟用+1活動</Typography>
                </CustomAccordionSummary>
                <CustomAccordionDetails>
                  <Typography variant="body2">
                    確定+1活動已經開啟，用戶可以開始下單
                  </Typography>
                  <Button
                    sx={{ mt: 1 }}
                    size="small"
                    variant="contained"
                    onClick={() =>
                      onGuide([
                        {
                          element: "#switch-activity",
                          popover: {
                            title: "第四步：啟用+1活動",
                            description: "確定+1活動已經開啟，用戶可以開始下單",
                            side: "right",
                            align: "start",
                          },
                        },
                      ])
                    }
                  >
                    指引我
                  </Button>
                </CustomAccordionDetails>
              </CustomAccordion>
              <CustomAccordion>
                <CustomAccordionSummary
                  aria-controls="panel1d-content"
                  id="panel1d-header"
                >
                  <Typography variant="subtitle2">5. 啟用直播貼文</Typography>
                </CustomAccordionSummary>
                <CustomAccordionDetails>
                  <Typography variant="body2">
                    關聯已開始直播社群貼文，啟用直播活動
                  </Typography>
                  <Button
                    sx={{ mt: 1 }}
                    size="small"
                    variant="contained"
                    onClick={() =>
                      onGuide([
                        {
                          element: "#enable-live-btn",
                          popover: {
                            title: "第五步：啟用直播貼文",
                            description: "關聯已開始直播社群貼文，啟用直播活動",
                            side: "top",
                            align: "start",
                          },
                        },
                      ])
                    }
                  >
                    指引我
                  </Button>
                </CustomAccordionDetails>
              </CustomAccordion>
            </Box>
          </Fade>
        )}
      </Popper>
    </>
  );
}

export default GuidePopper;
