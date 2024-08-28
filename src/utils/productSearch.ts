import { PRODUCT, PRODUCT_CATEGORY } from "@pages/LiveRoom/apis/legacy";

export function filterProducts(
  products: PRODUCT[] | null,
  activityProducts: PRODUCT[] | null,
  categories: PRODUCT_CATEGORY[] | null,
  filterOptions: {
    name: string;
    sn: string;
    curCategoryId: string;
    status: PRODUCT["status"][];
  }
): PRODUCT[] {
  const { name, sn, curCategoryId, status } = filterOptions;
  if (!products) {
    return [];
  }

  let filterProducts = activityProducts
    ? products.filter(
        (item1) => !activityProducts?.some((item2) => item1.id === item2.id)
      )
    : products;
  const isNameInput = name && name !== "";
  const isSnInput = sn && sn !== "";
  const curCategory: string =
    categories?.find((category) => category.id === curCategoryId)?.title || "";

  if (curCategory !== "" && curCategoryId !== "default") {
    filterProducts = filterProducts.filter(
      (product) =>
        product.main_category?.includes(curCategory) ||
        checkSubCategory(product.sub_categories, curCategory)
    );
  }

  if (status.length > 0) {
    filterProducts = filterProducts.filter((product) => {
      return status.includes(product.status);
    });
  }

  if (isNameInput && isSnInput) {
    filterProducts = filterProducts.filter((product) => {
      return (
        product.name.includes(name) &&
        product.sn.toUpperCase().includes(sn.toUpperCase())
      );
    });
  } else {
    if (name && name !== "") {
      filterProducts = filterProducts.filter((product) => {
        return product.name.includes(name);
      });
    }
    if (sn && sn !== "") {
      filterProducts = filterProducts.filter((product) => {
        return product.sn.toUpperCase().includes(sn.toUpperCase());
      });
    }
  }

  return filterProducts;
}

const checkSubCategory = (subCategories: string[] | null, category: string) => {
  if (!subCategories) {
    return false;
  }
  for (let i = 0; i < subCategories.length; i++) {
    if (subCategories[i].includes(category)) {
      return true;
    }
  }
  return false;
};
