import { useEffect } from "react";
import TextField, { TextFieldVariants } from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import { PRODUCT_CATEGORY } from "@pages/LiveRoom/apis/legacy";

interface PROPS {
  categories: PRODUCT_CATEGORY[] | null;
  onChange: Function;
  value?: string;
  variant?: TextFieldVariants;
  margin?: "none" | "dense" | "normal";
}

CategoriesSelector.defaultProps = {
  variant: "outlined",
  margin: "none",
};

function CategoriesSelector(props: PROPS) {
  const { categories, value, onChange, variant, margin } = props;
  useEffect(() => {}, []);

  const generateOptions = () => {
    if (!categories) {
      return [];
    } else {
      return categories
        .map((category) => {
          return {
            label: category.title,
            id: category.id,
          };
        })
        .filter((item, index, array) => {
          const sameIdItems = array.filter((i) => i.id === item.id);
          return sameIdItems.length === 1;
        });
    }
  };
  const getCurValue = () => {
    if (!generateOptions().length) {
      return undefined;
    } else {
      const curIndex = generateOptions().findIndex(
        (category) => category.id === value
      );
      return curIndex !== -1 ? generateOptions()[curIndex] : undefined;
    }
  };

  return (
    <Autocomplete
      disablePortal
      sx={{ width: "100%" }}
      id="product-categories-id"
      options={generateOptions()}
      value={getCurValue()}
      disableClearable={true}
      onChange={(event: React.SyntheticEvent, value: any) => {
        onChange(value.id);
      }}
      renderOption={(props, option) => {
        return (
          <li {...props} key={option.id}>
            {option.label}
          </li>
        );
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label="商品分類"
          variant={variant ?? "outlined"}
          margin={margin ?? "none"}
        />
      )}
    />
  );
}

export default CategoriesSelector;
