export type createProductForm = {
  status: "上架" | "半隱藏";
  sn: string;
  name: string;
  price: number;
  category_id: number | "default" | undefined;
  variants: {
    size: string;
    color: string;
    amount: number;
    preorder: boolean;
    disable: boolean;
  }[];
};
