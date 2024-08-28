import { RefObject } from "react";
import TextField from "@mui/material/TextField";
import { PRODUCT } from "@pages/LiveRoom/apis/legacy";
import SearchIcon from "@mui/icons-material/Search";
import InputAdornment from "@mui/material/InputAdornment";

interface PROPS<T> {
  label: string;
  options: T[];
  onSelect: Function;
  placeholder?: string;
  width?: number;
  isAutoFocus?: boolean;
  forwardRef?: RefObject<HTMLInputElement>;
  value?: string;
  setValue?: Function;
}

const AutoCompleteSearchBar = (props: PROPS<PRODUCT>) => {
  const {
    label,
    onSelect,
    placeholder,
    width,
    isAutoFocus = true,
    value,
    setValue,
  } = props;

  const handleInputChange = (event: any) => {
    setValue && setValue(event.target.value);
    onSelect(event.target.value);
  };
  return (
    <TextField
      sx={{ width: width || "100%" }}
      autoFocus={isAutoFocus}
      label={label}
      variant="outlined"
      value={value}
      onChange={handleInputChange}
      placeholder={placeholder || "請輸入商品名稱"}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon />
          </InputAdornment>
        ),
      }}
    />
  );
};

export default AutoCompleteSearchBar;
