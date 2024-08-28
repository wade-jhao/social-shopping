import { Box, Typography } from "@mui/material";

function SearchEmptyState() {
  return (
    <Box
      sx={{
        textAlign: "center",
        m: 2,
        py: 2,
        borderRadius: 2,
        bgcolor: "#f0f0f0",
      }}
    >
      <Typography variant="h6">沒有搜尋結果</Typography>
      <Typography variant="body2">請嘗試其他關鍵字或清空搜尋內容</Typography>
    </Box>
  );
}

export default SearchEmptyState;
