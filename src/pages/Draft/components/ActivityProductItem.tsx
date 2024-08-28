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
import Stack from "@mui/material/Stack";
import Checkbox from "@mui/material/Checkbox";
import { PRODUCT } from "../../LiveRoom/apis/legacy";

interface PROPS {
  product: PRODUCT;
  isChecked: boolean;
  onChange: Function;
}

function ActivityProductItem(props: PROPS) {
  const { product, isChecked, onChange } = props;
  useEffect(() => {}, []);
  const [isOpenDetail, setIsOpenDetail] = useState(false);

  const renderDetailList = () => {
    return product?.variants?.map((item: any, index: any) => (
      <ListItem key={index} disablePadding disableGutters>
        <ListItemText
          primary={
            <Grid
              container
              spacing={0}
              sx={{ display: "flex", lineHeight: 24 }}
            >
              <Grid
                item
                xs={4}
                sx={{
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <Typography variant="body2" sx={{ display: "flex" }}>
                  {`${item.color}`}
                </Typography>
              </Grid>
              <Grid
                item
                xs={4}
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Stack
                  direction={"row"}
                  sx={{ display: "flex", alignItems: "center" }}
                  spacing={1}
                >
                  <Typography variant="body2" sx={{ display: "flex" }}>
                    {`${item.size}`}
                  </Typography>
                </Stack>
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
      >
        <ListItemButton
          role={undefined}
          onClick={() => setIsOpenDetail(!isOpenDetail)}
          dense
          disableGutters
        >
          <ListItemIcon>
            <Checkbox
              edge="start"
              checked={isChecked}
              tabIndex={-1}
              disableRipple
              onChange={(e) => {
                onChange(product.id);
              }}
              onClick={(e) => e.stopPropagation()}
              // inputProps={{ "aria-labelledby": labelId }}
            />
          </ListItemIcon>
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
              <Stack
                direction={"row"}
                sx={{ display: "flex", alignItems: "center" }}
                spacing={1}
              >
                <Typography variant="subtitle1" sx={{ display: "flex" }}>
                  {product.name}
                </Typography>
              </Stack>
            }
            secondary={
              <Typography
                variant="body2"
                sx={{
                  color: "rgba(0,0,0,.55)",
                }}
              >
                {product?.main_category || ""}
              </Typography>
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
