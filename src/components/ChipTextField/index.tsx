import { useState, useRef, useEffect } from "react";
import Chip from "@mui/material/Chip";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";

interface PROPS<T> {
  label: string;
  placeholder: string;
  values: T[];
  onAdd: Function;
  onDelete: Function;
  type: "PRODUCT" | "FORMAT";
}

const ChipTextField = <T extends any>(props: PROPS<T>) => {
  const { label, placeholder, values, onAdd, onDelete, type } = props;
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<any>();
  const handleKeyDown = (event: any) => {
    event.stopPropagation();
    if (event.key === "Enter" && inputValue) {
      onAdd(inputValue);
      setInputValue("");
    }
  };

  const handleDelete = (chipToDelete: any) => () => {
    onDelete(chipToDelete);
  };

  const handleBlur = () => {
    if (inputValue) {
      onAdd(inputValue);
      setInputValue("");
    }
  };

  useEffect(() => {
    inputRef.current.focus();
  }, [values]);

  return (
    <TextField
      size="small"
      value={inputValue}
      onChange={(e) => setInputValue(e.target.value)}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
      variant="outlined"
      fullWidth
      label={label}
      placeholder={placeholder}
      ref={type === "FORMAT" ? inputRef : null}
      InputProps={{
        startAdornment: values.map((data, index) => (
          <Box key={index} component="span" m={0.5}>
            <Chip
              size="small"
              label={data as string}
              onDelete={handleDelete(data)}
              color="default"
            />
          </Box>
        )),
        inputRef: type === "PRODUCT" ? inputRef : null,
      }}
    />
  );
};

export default ChipTextField;
