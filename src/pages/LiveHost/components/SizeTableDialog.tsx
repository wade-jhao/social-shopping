// import { useEffect } from "react";
import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
// import Grid from "@mui/material/Grid";
import Empty from "@components/Empty";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Textarea from "@mui/joy/Textarea";
import Paper from "@mui/material/Paper";
import { PRODUCT } from "../apis/legacy";
import { getSizeContent } from "@utils/sizeTable";

interface PROPS {
  isVisible: boolean;
  onCancel: Function;
  product: PRODUCT;
}

function SizeTableDialog(props: PROPS) {
  const { isVisible, onCancel, product } = props;

  const getTableRow = (sizeTable: string, type?: "header" | "content") => {
    const arrSizeTable: string[] = sizeTable.split("\r\n");
    if (!arrSizeTable || arrSizeTable.length < 2) {
      return;
    }
    if (arrSizeTable.length > 0) {
      if (type === "header") {
        return arrSizeTable[0].split(",").map((item, index) => (
          <TableCell key={index} component="th" scope="row" variant="head">
            {item}
          </TableCell>
        ));
      } else {
        arrSizeTable.shift();
        if (arrSizeTable) {
          return arrSizeTable.map((item, index) => (
            <TableRow
              key={index}
              sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
            >
              {item.split(",").map((item, idx) => (
                <TableCell
                  key={`${item}-${idx}`}
                  align="left"
                  component="th"
                  scope="row"
                  variant="body"
                  size="medium"
                  padding="normal"
                >
                  {item.toLocaleUpperCase()}
                </TableCell>
              ))}
            </TableRow>
          ));
        }
      }
    }
  };

  return (
    <Dialog fullWidth={true} open={isVisible} onClose={() => onCancel()}>
      <DialogTitle>{product.name}</DialogTitle>
      <DialogContent dividers={true} sx={{ pt: 2 }}>
        {product.size_table !== "" && (
          <>
            <TableContainer component={Paper}>
              <Table
                sx={{ minWidth: 650 }}
                aria-label="size table"
                stickyHeader
              >
                <TableHead>
                  <TableRow
                    sx={{
                      "& th": {
                        color: "rgb(47, 55, 70)",
                        backgroundColor: "rgb(248, 249, 250)",
                      },
                    }}
                  >
                    {getTableRow(product?.size_table as string, "header")}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {getTableRow(product?.size_table as string, "content")}
                </TableBody>
              </Table>
            </TableContainer>
            <Box
              noValidate
              component="form"
              sx={{
                display: "flex",
                flexDirection: "column",
                margin: "auto",
                width: "100%",
              }}
            >
              <Textarea
                sx={{
                  width: "100%",
                  backgroundColor: "rgba(0, 0, 0, 0.08)",
                  padding: 1,
                  mt: 2,
                }}
                autoFocus
                size="lg"
                placeholder=""
                variant="outlined"
                minRows={3}
                maxRows={10}
                color="neutral"
                value={getSizeContent(product?.size_table as string)}
              />
            </Box>
          </>
        )}
        {product.size_table === "" && (
          <Box sx={{ pt: 2 }}>
            <Empty message="沒有設定尺寸表" />
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button variant="contained" onClick={() => onCancel()}>
          確定
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default SizeTableDialog;
