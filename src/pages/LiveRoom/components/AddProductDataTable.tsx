import { useMemo, useState, useEffect } from "react";
import * as locales from "@mui/material/locale";
// import { alpha } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import Toolbar from "@mui/material/Toolbar";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import Typography from "@mui/material/Typography";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import TableSortLabel from "@mui/material/TableSortLabel";
import Paper from "@mui/material/Paper";
import Checkbox from "@mui/material/Checkbox";
import { PRODUCT } from "../apis/legacy";
import { visuallyHidden } from "@mui/utils";
import { createTheme, ThemeProvider, useTheme } from "@mui/material/styles";
import Thumbnail from "@assets/thumbnail.svg";

interface PROPS {
  onSelect: Function;
  products: PRODUCT[];
}
interface Data {
  id: string;
  image: string;
  name: string;
  sn: string;
  status: string;
  sort_key: number;
}

function createData(
  id: string,
  image: string,
  name: string,
  sn: string,
  status: string,
  sort_key: number
): Data {
  return {
    id,
    image,
    name,
    sn,
    status,
    sort_key,
  };
}

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

type Order = "asc" | "desc";
/* eslint-disable */
function getComparator<Key extends keyof any>(
  order: Order,
  orderBy: Key
): (
  a: { [key in Key]: number | string },
  b: { [key in Key]: number | string }
) => number {
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}
/* eslint-disable */
// Since 2020 all major browsers ensure sort stability with Array.prototype.sort().
// stableSort() brings sort stability to non-modern browsers (notably IE11). If you
// only support modern browsers you can replace stableSort(exampleArray, exampleComparator)
// with exampleArray.slice().sort(exampleComparator)
function stableSort<T>(
  array: readonly T[],
  comparator: (a: T, b: T) => number
) {
  const stabilizedThis = array.map((el, index) => [el, index] as [T, number]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) {
      return order;
    }
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

interface HeadCell {
  disablePadding: boolean;
  id: keyof Data;
  label: string;
  numeric: boolean;
}

const headCells: readonly HeadCell[] = [
  {
    id: "image",
    numeric: false,
    disablePadding: false,
    label: "商品圖片",
  },
  {
    id: "name",
    numeric: false,
    disablePadding: false,
    label: "商品名稱",
  },
  {
    id: "sn",
    numeric: false,
    disablePadding: false,
    label: "商品編號",
  },
  {
    id: "status",
    numeric: false,
    disablePadding: false,
    label: "商品狀態",
  },
  {
    id: "sort_key",
    numeric: true,
    disablePadding: false,
    label: "商品優先級",
  },
];

interface EnhancedTableProps {
  productLength: number;
  numSelected: number;
  onRequestSort: (
    event: React.MouseEvent<unknown>,
    property: keyof Data
  ) => void;
  onSelectAllClick: (event: React.ChangeEvent<HTMLInputElement>) => void;
  order: Order;
  orderBy: string;
  rowCount: number;
}

function EnhancedTableHead(props: EnhancedTableProps) {
  const {
    productLength,
    onSelectAllClick,
    order,
    orderBy,
    numSelected,
    rowCount,
    onRequestSort,
  } = props;
  const createSortHandler =
    (property: keyof Data) => (event: React.MouseEvent<unknown>) => {
      onRequestSort(event, property);
    };

  return (
    <TableHead>
      <TableRow>
        <TableCell
          padding="checkbox"
          sx={{ background: "rgb(248, 249, 250)", color: "rgb(47, 55, 70)" }}
        >
          <Checkbox
            color="primary"
            indeterminate={numSelected > 0 && numSelected < rowCount}
            checked={rowCount > 0 && numSelected === rowCount}
            onChange={onSelectAllClick}
            inputProps={{
              "aria-label": "select all desserts",
            }}
          />
        </TableCell>
        {headCells.map((headCell) => (
          <TableCell
            sx={{ background: "rgb(248, 249, 250)", color: "rgb(47, 55, 70)" }}
            key={headCell.id}
            align={"left"}
            padding={headCell.disablePadding ? "none" : "normal"}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : "asc"}
              onClick={createSortHandler(headCell.id)}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <Box component="span" sx={visuallyHidden}>
                  {order === "desc" ? "sorted descending" : "sorted ascending"}
                </Box>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

function EnhancedTableToolbar(props: {
  numSelected: number;
  productsLength: number;
}) {
  const { numSelected, productsLength } = props;

  return (
    <Toolbar
      disableGutters={true}
      sx={{
        pl: { sm: 2 },
        pr: { xs: 1, sm: 1 },
        // ...(numSelected > 0 && {
        //   bgcolor: (theme) =>
        //     alpha(
        //       theme.palette.primary.main,
        //       theme.palette.action.activatedOpacity
        //     ),
        // }),
      }}
    >
      <Typography
        sx={{ flex: "1 1 100%" }}
        color="inherit"
        variant="subtitle1"
        component="div"
      >
        {`已選擇${numSelected}個商品 / 總共${productsLength}個商品`}
      </Typography>
    </Toolbar>
  );
}

function AddProductDataTable(props: PROPS) {
  const { products, onSelect } = props;
  const [order, setOrder] = useState<Order>("desc");
  const [orderBy, setOrderBy] = useState<keyof Data>("sort_key");
  const [selected, setSelected] = useState<readonly string[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(100);
  const [curProducts, setCurProducts] = useState<Data[]>([]);
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(
    null
  );

  useEffect(() => {
    const newProds = createRow(products);
    if (JSON.stringify(newProds) !== JSON.stringify(curProducts)) {
      setCurProducts(newProds);
      setPage(0);
      setSelected([]);
    }
  }, [products]);

  const createRow = (prods: PRODUCT[]) => {
    if (!prods) {
      return [];
    }
    const newProd = prods?.map((product) =>
      createData(
        product.id,
        product.media_url || Thumbnail,
        product.name,
        product.sn,
        product.status,
        product.sort_key as number
      )
    );
    return newProd;
  };

  const handleRequestSort = (
    event: React.MouseEvent<unknown>,
    property: keyof Data
  ) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = curProducts.map((n) => n.id);
      setSelected(newSelected);
      onSelect(newSelected);
      return;
    }
    setSelected([]);
    onSelect([]);
  };

  const handleClick = (
    event: React.MouseEvent<unknown>,
    id: string,
    index: number
  ) => {
    const selectedIndex = selected.indexOf(id);

    let newSelected: string[] = [];
    if (event.shiftKey && lastSelectedIndex !== null) {
      const start = Math.min(lastSelectedIndex, index);
      const end = Math.max(lastSelectedIndex, index);
      newSelected = [
        ...selected,
        ...visibleRows.slice(start, end + 1).map((row) => row.id),
      ];
      newSelected = [...new Set(newSelected)];
    } else {
      if (selectedIndex === -1) {
        newSelected = newSelected.concat(selected, id);
      } else if (selectedIndex === 0) {
        newSelected = newSelected.concat(selected.slice(1));
      } else if (selectedIndex === selected.length - 1) {
        newSelected = newSelected.concat(selected.slice(0, -1));
      } else if (selectedIndex > 0) {
        newSelected = newSelected.concat(
          selected.slice(0, selectedIndex),
          selected.slice(selectedIndex + 1)
        );
      }
      setLastSelectedIndex(index);
    }
    onSelect(newSelected);
    setSelected(newSelected);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const isSelected = (id: string) => selected.indexOf(id) !== -1;

  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - curProducts.length) : 0;

  const visibleRows = useMemo(
    () =>
      stableSort(curProducts, getComparator(order, orderBy)).slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
      ),
    [order, orderBy, page, rowsPerPage, curProducts]
  );
  const theme = useTheme();
  const themeWithLocale = useMemo(
    () => createTheme(theme, locales["zhTW"]),
    []
  );

  return (
    <Box sx={{ width: "100%" }}>
      <Paper sx={{ width: "100%", mb: 2 }}>
        <ThemeProvider theme={themeWithLocale}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <EnhancedTableToolbar
              numSelected={selected.length}
              productsLength={curProducts.length}
            />
            <TablePagination
              rowsPerPageOptions={[100, 500]}
              component="div"
              count={curProducts.length}
              rowsPerPage={rowsPerPage}
              page={page}
              labelRowsPerPage="每頁數量:"
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </Box>
        </ThemeProvider>

        <TableContainer>
          <Table
            stickyHeader
            sx={{ minWidth: 750 }}
            aria-labelledby="tableTitle"
            size={"small"}
          >
            <EnhancedTableHead
              productLength={curProducts.length}
              numSelected={selected.length}
              order={order}
              orderBy={orderBy}
              onSelectAllClick={handleSelectAllClick}
              onRequestSort={handleRequestSort}
              rowCount={curProducts.length}
            />
            <TableBody sx={{ maxHeight: 100 }}>
              {visibleRows.map((row, index) => {
                const isItemSelected = isSelected(row.id);
                const labelId = `enhanced-table-checkbox-${index}`;
                return (
                  <TableRow
                    hover
                    onClick={(event) => handleClick(event, row.id, index)}
                    role="checkbox"
                    aria-checked={isItemSelected}
                    tabIndex={-1}
                    key={index}
                    selected={isItemSelected}
                    sx={{ cursor: "pointer" }}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        color="primary"
                        checked={isItemSelected}
                        inputProps={{
                          "aria-labelledby": labelId,
                        }}
                      />
                    </TableCell>
                    <TableCell
                      component="th"
                      id={labelId}
                      scope="row"
                      padding="none"
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        pt: 1,
                        pb: 1,
                      }}
                    >
                      <img
                        style={{
                          width: "80px",
                          aspectRatio: 1,
                          objectFit: "contain",
                        }}
                        src={row.image}
                      />
                    </TableCell>
                    <TableCell
                      component="th"
                      id={labelId}
                      scope="row"
                      padding="none"
                    >
                      {row.name}
                    </TableCell>
                    <TableCell>{row.sn}</TableCell>
                    <TableCell>{row.status}</TableCell>
                    <TableCell>{row.sort_key}</TableCell>
                  </TableRow>
                );
              })}
              {emptyRows > 0 && (
                <TableRow
                  style={{
                    height: 33 * emptyRows,
                  }}
                >
                  <TableCell colSpan={6} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <ThemeProvider theme={themeWithLocale}>
          <TablePagination
            rowsPerPageOptions={[100, 500]}
            component="div"
            count={curProducts.length}
            rowsPerPage={rowsPerPage}
            page={page}
            labelRowsPerPage="每頁數量:"
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </ThemeProvider>
      </Paper>
    </Box>
  );
}

export default AddProductDataTable;
