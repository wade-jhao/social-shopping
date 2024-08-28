const path = require("path");

module.exports = {
  webpack: {
    alias: {
      "@components": path.resolve(__dirname, "src/components/"),
      "@apis": path.resolve(__dirname, "src/apis/"),
      "@assets": path.resolve(__dirname, "src/assets/"),
      "@hooks": path.resolve(__dirname, "src/hooks/"),
      "@pages": path.resolve(__dirname, "src/pages/"),
      "@router": path.resolve(__dirname, "src/router/"),
      "@store": path.resolve(__dirname, "src/store/"),
      "@style": path.resolve(__dirname, "src/style/"),
      "@utils": path.resolve(__dirname, "src/utils/"),
      "@mui/styled-engine": "@mui/styled-engine-sc",
    },
  },
};
