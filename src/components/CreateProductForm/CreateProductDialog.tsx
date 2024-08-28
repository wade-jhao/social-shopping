import CategoriesSelector from "@components/CategoriesSelector";
import {
  Autocomplete,
  Chip,
  FormControl,
  InputLabel,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  MenuItem,
  Dialog,
  DialogTitle,
  IconButton,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import { useAppDispatch, useAppSelector } from "@store/hooks";
import {
  addCurProductAsync,
  addNewShopProductToShopProducts,
  getProdsAsync,
  selectProductCategories,
} from "@store/liveroomSlice";
import { useEffect, useState } from "react";
import Paper from "@mui/material/Paper";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import { useForm, Controller, FieldErrors } from "react-hook-form";
import { LoadingButton } from "@mui/lab";
import { setNotice } from "@store/commonSlice";
import { createProductForm } from "./types";
import { selectApis } from "@store/apiSlice";
import {
  addActivityProducts,
  createProduct,
} from "@pages/LiveRoom/apis/legacy";
import { useParams } from "react-router";

interface PROPS {
  isVisible: boolean;
  onOk: Function;
  onCancel: Function;
}
interface VARIANT_SELECT_PROPS {
  variants: string[];
  setVariants: Function;
  label: string;
  errors: FieldErrors<createProductForm>;
}
function CreateProductDialog(props: PROPS) {
  const { activityId, postId } = useParams();
  const { isVisible, onOk, onCancel } = props;
  const dispatch = useAppDispatch();

  const apis = useAppSelector(selectApis);

  const categories = useAppSelector(selectProductCategories);
  const [sizes, setSizes] = useState<string[]>([]);
  const [colors, setColors] = useState<string[]>([]);
  const [variantSets, setVariantSets] = useState<createProductForm["variants"]>(
    []
  );
  const [isRequesting, setIsRequesting] = useState(false);

  const {
    setValue,
    control,
    reset: resetForm,
    handleSubmit,
    formState: { errors },
    setError,
    clearErrors,
  } = useForm<createProductForm>({
    defaultValues: {
      status: "上架",
      sn: "",
      name: "",
      price: undefined,
      category_id: "default",
      variants: variantSets,
    },
  });

  useEffect(() => {
    const newVariantSets = sizes
      .map((size) => {
        return colors.map((color) => ({
          color,
          size,
          preorder: true,
          disable: false,
          amount: 0,
        }));
      })
      .flat();
    setVariantSets((prev) => {
      return newVariantSets.map((newVariantSet) => {
        const prevValueSet = prev.find((prevValue) => {
          return (
            prevValue.color === newVariantSet.color &&
            prevValue.size === newVariantSet.size
          );
        });
        return prevValueSet ? prevValueSet : newVariantSet;
      });
    });
  }, [sizes, colors]);

  useEffect(() => {
    setValue("variants", variantSets);
    clearErrors("variants");
  }, [variantSets, setValue, clearErrors]);

  const clearForm = () => {
    resetForm();
    setSizes([]);
    setColors([]);
    setVariantSets([]);
  };

  const onSubmit = async (data: createProductForm) => {
    if (data.variants.length === 0) {
      setError("variants", {
        type: "manual",
        message: "請輸入至少一個顏色及尺寸",
      });
      return;
    }
    setIsRequesting(true);
    // Request create new product
    const createProductResult = await createProduct(
      apis?.products as string,
      data
    );

    if (createProductResult.error) {
      dispatch(
        setNotice({
          isErroring: true,
          message: createProductResult.error,
          type: "error",
        })
      );
      setIsRequesting(false);
      return;
    }
    dispatch(addNewShopProductToShopProducts(createProductResult));

    addActivityProducts(
      apis?.activity_create_product as string,
      activityId as string,
      createProductResult.id.toString()
    )
      .then(() => {
        dispatch(
          addCurProductAsync({
            url: apis?.activity_post_products as string,
            activityId: activityId as string,
            postId: postId as string,
            prodIds: createProductResult.id.toString(),
            onSuccess: () => {
              dispatch(
                getProdsAsync({
                  urlProd: apis?.activity_post_products as string,
                  urlNicknames: apis?.products_nicknames as string,
                  activityId: activityId as string,
                  postId: postId as string,
                })
              );
              dispatch(
                setNotice({
                  isErroring: true,
                  message: "新增直播商品成功",
                  type: "success",
                })
              );
              clearForm();
              setIsRequesting(false);
              onOk();
            },
          })
        ).catch(() => {
          setIsRequesting(false);
        });
      })
      .catch((e) => {
        setIsRequesting(false);
      });
  };
  return (
    <Dialog
      open={isVisible}
      scroll={"paper"}
      onClose={() => {
        clearForm();
        onCancel();
      }}
      maxWidth="lg"
    >
      <DialogTitle>
        建立新商品
        <IconButton
          aria-label="close"
          onClick={() => {
            clearForm();
            onCancel();
          }}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseOutlinedIcon />
        </IconButton>
      </DialogTitle>
      <form
        onSubmit={handleSubmit(onSubmit)}
        onKeyDown={(e) => {
          if (
            e.key === "Enter" &&
            (e.target as HTMLInputElement).getAttribute("type") !== "submit"
          ) {
            e.preventDefault();
          }
        }}
      >
        <DialogContent dividers={true} sx={{ p: 2 }}>
          <Typography variant="body1" gutterBottom component="div">
            狀態
          </Typography>

          <Controller
            control={control}
            name="status"
            render={({ field }) => (
              <ToggleButtonGroup
                color="primary"
                size="small"
                exclusive
                aria-label="text alignment"
                sx={{ mb: 1 }}
                {...field}
              >
                <ToggleButton value="上架" aria-label="left aligned">
                  上架
                </ToggleButton>
                <ToggleButton value="半隱藏" aria-label="centered">
                  半隱藏
                </ToggleButton>
              </ToggleButtonGroup>
            )}
          />
          <Controller
            control={control}
            name="sn"
            render={({ field }) => (
              <TextField
                variant="outlined"
                label="#編號"
                fullWidth
                helperText={
                  errors.sn
                    ? errors.sn.message
                    : "限輸入英文數字，與以下符號 -=_()+[]"
                }
                margin="dense"
                {...field}
                error={!!errors.sn}
              />
            )}
            rules={{
              required: "編號為必填欄位",
              pattern: {
                value: /^[a-zA-Z0-9-=_()+[\]]+$/,
                message: "限輸入英文數字，與以下符號 -=_()+[]",
              },
            }}
          />
          <Controller
            control={control}
            name="name"
            render={({ field }) => (
              <TextField
                variant="outlined"
                label="名稱"
                fullWidth
                {...field}
                error={!!errors.name}
                helperText={errors?.name?.message}
              />
            )}
            rules={{ required: "名稱為必填欄位" }}
          />
          <Controller
            control={control}
            name="price"
            render={({ field }) => (
              <TextField
                variant="outlined"
                label="售價"
                type="number"
                fullWidth
                margin="dense"
                {...field}
                onChange={(e) => {
                  const value = e.target.value;
                  field.onChange(
                    isNaN(parseInt(value)) ? undefined : parseInt(value)
                  );
                }}
                error={!!errors.price}
                helperText={errors?.price?.message}
              />
            )}
            rules={{
              required: "售價為必填欄位",
              min: {
                value: 1,
                message: "售價需大於0",
              },
            }}
          />
          <Controller
            control={control}
            name="category_id"
            render={({ field }) => (
              <CategoriesSelector
                variant="outlined"
                categories={
                  categories?.filter((category) => category.id !== "default") ||
                  []
                }
                value={field.value?.toString() || undefined}
                onChange={(val: number) => {
                  field.onChange(val);
                }}
                margin="dense"
              />
            )}
            rules={{ required: "請選擇商品分類" }}
          />

          {/* <TextField
        variant="outlined"
        label="說明"
        type="text"
        fullWidth
        multiline
        rows={4}
        maxRows={4}
      /> */}
          <Typography
            variant="body1"
            gutterBottom
            component="div"
            sx={{ mt: 2 }}
          >
            規格
          </Typography>
          {MultiAutocomplete({
            variants: sizes,
            setVariants: setSizes,
            label: "尺寸",
            errors,
          })}
          {MultiAutocomplete({
            variants: colors,
            setVariants: setColors,
            label: "顏色",
            errors,
          })}
          {variantSets.length > 0 && (
            <TableContainer component={Paper}>
              <Table aria-label="variant set table" size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>尺寸</TableCell>
                    <TableCell>顏色</TableCell>
                    <TableCell>數量</TableCell>
                    <TableCell>是否預購</TableCell>
                    <TableCell>是否上架</TableCell>
                  </TableRow>
                </TableHead>
                {variantSets.map((variantSet, index) => {
                  return (
                    <TableBody>
                      <TableRow>
                        <TableCell>{variantSet.size}</TableCell>
                        <TableCell>{variantSet.color}</TableCell>
                        <TableCell sx={{ minWidth: 120 }}>
                          <Controller
                            control={control}
                            name={`variants.${index}.amount`}
                            render={({ field }) => (
                              <TextField
                                variant="outlined"
                                label="數量"
                                type="number"
                                fullWidth
                                margin="dense"
                                size="small"
                                {...field}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  field.onChange(
                                    isNaN(parseInt(value))
                                      ? undefined
                                      : parseInt(value)
                                  );
                                  setVariantSets((prev) => {
                                    const newValue = [...prev];
                                    const prevValueSet = prev.find(
                                      (prevValue) => {
                                        return (
                                          prevValue.color ===
                                            variantSet.color &&
                                          prevValue.size === variantSet.size
                                        );
                                      }
                                    );
                                    const prevValueSetIndex = prev.findIndex(
                                      (prevValue) => {
                                        return (
                                          prevValue.color ===
                                            variantSet.color &&
                                          prevValue.size === variantSet.size
                                        );
                                      }
                                    );

                                    if (!prevValueSet) {
                                      return prev;
                                    }
                                    newValue[prevValueSetIndex] = {
                                      ...prevValueSet,
                                      amount: isNaN(parseInt(value))
                                        ? 0
                                        : parseInt(value),
                                    };
                                    return newValue;
                                  });
                                }}
                                error={!!errors.variants?.[index]?.amount}
                                helperText={
                                  errors.variants?.[index]?.amount?.message
                                }
                                InputProps={{ inputProps: { min: 0 } }}
                              />
                            )}
                            rules={{
                              required: "數量為必填欄位",
                              min: {
                                value: 0,
                                message: "數量需大於等於0",
                              },
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <FormControl
                            sx={{ minWidth: 60 }}
                            fullWidth
                            size="small"
                          >
                            <InputLabel id="demo-simple-select-standard-label">
                              是否預購
                            </InputLabel>
                            <Select
                              labelId="preorder"
                              id="demo-simple-select-standard"
                              value={variantSet.preorder}
                              onChange={(e) => {
                                setVariantSets((prev) => {
                                  const newValue = [...prev];
                                  const prevValueSet = prev.find(
                                    (prevValue) => {
                                      return (
                                        prevValue.color === variantSet.color &&
                                        prevValue.size === variantSet.size
                                      );
                                    }
                                  );
                                  const prevValueSetIndex = prev.findIndex(
                                    (prevValue) => {
                                      return (
                                        prevValue.color === variantSet.color &&
                                        prevValue.size === variantSet.size
                                      );
                                    }
                                  );
                                  if (!prevValueSet) {
                                    return prev;
                                  }
                                  newValue[prevValueSetIndex] = {
                                    ...prevValueSet,
                                    preorder:
                                      e.target.value === "true" ? true : false,
                                  };
                                  return newValue;
                                });
                              }}
                              label="是否預購"
                            >
                              <MenuItem value={"true"}>是</MenuItem>
                              <MenuItem value={"false"}>否</MenuItem>
                            </Select>
                          </FormControl>
                        </TableCell>
                        <TableCell>
                          <FormControl
                            sx={{ minWidth: 60 }}
                            fullWidth
                            size="small"
                          >
                            <InputLabel id="demo-simple-select-standard-label">
                              是否上架
                            </InputLabel>
                            <Select
                              labelId="disable"
                              id="demo-simple-select-standard"
                              value={variantSet.disable}
                              onChange={(e) => {
                                setVariantSets((prev) => {
                                  const newValue = [...prev];
                                  const prevValueSet = prev.find(
                                    (prevValue) => {
                                      return (
                                        prevValue.color === variantSet.color &&
                                        prevValue.size === variantSet.size
                                      );
                                    }
                                  );
                                  const prevValueSetIndex = prev.findIndex(
                                    (prevValue) => {
                                      return (
                                        prevValue.color === variantSet.color &&
                                        prevValue.size === variantSet.size
                                      );
                                    }
                                  );

                                  if (!prevValueSet) {
                                    return prev;
                                  }
                                  newValue[prevValueSetIndex] = {
                                    ...prevValueSet,
                                    disable:
                                      e.target.value === "true" ? true : false,
                                  };
                                  return newValue;
                                });
                              }}
                              label="是否上架"
                            >
                              <MenuItem value={"false"}>是</MenuItem>
                              <MenuItem value={"true"}>否</MenuItem>
                            </Select>
                          </FormControl>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  );
                })}
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              clearForm();
              onCancel();
            }}
          >
            取消
          </Button>
          <LoadingButton
            variant="contained"
            loading={isRequesting}
            type="submit"
          >
            確定
          </LoadingButton>
        </DialogActions>
      </form>
    </Dialog>
  );
}

const MultiAutocomplete = (props: VARIANT_SELECT_PROPS) => {
  const [isCompositioning, setIsCompositioning] = useState<boolean>(false);
  const { variants, setVariants, label, errors } = props;
  return (
    <Autocomplete
      fullWidth
      multiple
      options={variants}
      getOptionLabel={(option) => option}
      value={variants}
      disableCloseOnSelect
      filterSelectedOptions
      noOptionsText=""
      renderTags={(value: readonly string[], getTagProps) =>
        value.map((option: string, index: number) => (
          <Chip
            label={option}
            {...getTagProps({ index })}
            onDelete={() => {
              setVariants((prev: string[]) =>
                prev.filter((variant) => variant !== option)
              );
            }}
          />
        ))
      }
      renderInput={(params) => (
        <TextField
          {...params}
          variant="outlined"
          label={label}
          placeholder={`輸入${label}`}
          margin="dense"
          error={!!errors.variants && !errors.variants[0]}
          helperText={errors?.variants?.message}
          onCompositionStart={() => {
            setIsCompositioning(true);
          }}
          onCompositionEnd={() => {
            setIsCompositioning(false);
          }}
          onKeyDownCapture={(e: any) => {
            if (e.key === "Enter") {
              if (isCompositioning) {
                return;
              }
              const value = e.target.value;
              if (
                variants.some((variant) => variant === value) ||
                value === ""
              ) {
                return;
              }
              setVariants((prev: string[]) => [...prev, value]);
            }
            if (e.key === "Backspace") {
              if (isCompositioning || e.target.value !== "") {
                return;
              }
              setVariants((prev: string[]) =>
                prev.filter((variant, index, array) => index < array.length - 1)
              );
            }
          }}
        />
      )}
    />
  );
};

export default CreateProductDialog;
