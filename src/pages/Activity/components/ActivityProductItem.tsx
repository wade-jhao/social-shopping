import { useEffect, useState } from "react";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Collapse from "@mui/material/Collapse";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import ListItemText from "@mui/material/ListItemText";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Checkbox from "@mui/material/Checkbox";
import { PRODUCT } from "../../LiveRoom/apis/legacy";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import Divider from "@mui/material/Divider";
interface PROPS {
  product: PRODUCT;
  isChecked: boolean;
  onChange: Function;
  isAdded?: boolean;
}

function ActivityProductItem(props: PROPS) {
  const { product, isChecked, onChange, isAdded = false } = props;
  useEffect(() => {}, []);
  const [isOpenDetail, setIsOpenDetail] = useState(true);

  const renderDetailList = () => {
    return product?.variants?.map((item: any, index: any) => (
      <ListItem key={index} disablePadding disableGutters>
        <ListItemText
          primary={
            <Box>
              <Grid
                container
                spacing={0}
                sx={{ display: "flex", lineHeight: 24, pl: 7 }}
              >
                <Grid
                  item
                  xs={8}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <Typography variant="body2" sx={{ display: "flex" }}>
                    {`${item.color} / ${item.size}`}
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Stack
                    direction={"row"}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "end",
                      color: "rgb(25, 118, 210)",
                    }}
                    spacing={1}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        display: "flex",
                        color: "rgb(25, 118, 210)",
                      }}
                    >
                      NTD$
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        display: "flex",
                        color: "rgb(25, 118, 210)",
                      }}
                    >
                      {item.price}
                    </Typography>
                  </Stack>
                </Grid>
              </Grid>
              <Divider />
            </Box>
          }
        />
      </ListItem>
    ));
  };

  return (
    <>
      <ListItem
        sx={{
          padding: 0,
        }}
        disablePadding
        disableGutters
        secondaryAction={isOpenDetail ? <ExpandMoreIcon /> : <ExpandLessIcon />}
      >
        <ListItemButton
          role={undefined}
          onClick={() => setIsOpenDetail(!isOpenDetail)}
          dense
          disableGutters
        >
          {!isAdded && (
            <ListItemIcon sx={{ margin: 0, padding: 0 }}>
              <Checkbox
                edge="start"
                checked={isChecked}
                tabIndex={-1}
                disableRipple
                onChange={(e) => {
                  onChange(product.id);
                }}
                onClick={(e) => e.stopPropagation()}
                sx={{ margin: 0, padding: 0 }}
                // inputProps={{ "aria-labelledby": labelId }}
              />
            </ListItemIcon>
          )}
          <ListItemAvatar>
            <img
              style={{
                width: "80px",
                aspectRatio: 1,
                objectFit: "contain",
              }}
              src={product.media_url}
            />
          </ListItemAvatar>
          <ListItemText
            primary={
              <Box sx={{ display: "flex" }}>
                <Typography variant="subtitle1" sx={{ display: "inline" }}>
                  {product.name}
                  <Typography
                    variant="body2"
                    sx={{ display: "inline", color: "rgba(0, 0, 0, 0.60)" }}
                  >
                    （{product.sn}）
                  </Typography>
                </Typography>
              </Box>
            }
          />
        </ListItemButton>
      </ListItem>
      <Collapse in={isOpenDetail} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          {renderDetailList()}
        </List>
      </Collapse>
    </>
  );
}
export default ActivityProductItem;
