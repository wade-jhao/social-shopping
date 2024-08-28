import { DISCOUNT, PRODUCT } from "@pages/LiveRoom/apis/legacy";
import { useAppSelector } from "@store/hooks";
import { selectDiscount } from "@store/liveroomSlice";
import { getSizeContent } from "@utils/sizeTable";
import dayjs from "dayjs";
export default function useBroadcastContent() {
  const curDiscount = useAppSelector(selectDiscount);

  const getSingleProductContent = (
    product: PRODUCT,
    options: {
      isAddSizeList: boolean;
      isAddLiveDiscountPrice: boolean;
      isAddPullOffVariants: boolean;
    }
  ) => {
    const mainContent = getBroadcastContent(product, options);
    const exampleContent = getProductsExamples([product]);
    return `${mainContent}\n\n${exampleContent}`;
  };

  const getMultipleProductContent = (
    products: PRODUCT[],
    options: {
      isAddSizeList: boolean;
      isAddLiveDiscountPrice: boolean;
      isAddPullOffVariants: boolean;
    }
  ) => {
    const mainContents = products
      .map((product) => {
        return getBroadcastContent(product, options);
      })
      .join("\n\n");
    const exampleContent = getProductsExamples(products);
    return `${mainContents}\n\n${exampleContent}`.trim();
  };

  const getBroadcastContent = (
    product: PRODUCT,
    options: {
      isAddSizeList: boolean;
      isAddLiveDiscountPrice: boolean;
      isAddPullOffVariants: boolean;
    }
  ) => {
    const { isAddSizeList, isAddLiveDiscountPrice, isAddPullOffVariants } =
      options;
    const nicknames = getBroadCastNickName(product);
    const productPrizes = getBroadCastPrice(product);
    const colorFormat = getBroadCastFormat(product, "color");
    const sizeFormat = getBroadCastFormat(product, "size");
    const sizeListContent =
      product?.size_table === ""
        ? ""
        : getSizeContent(product?.size_table || "");
    const pullOffVariants = getPullOffVariantsContent(product);
    const discountContent = broadcastDiscountContent(
      productPrizes,
      curDiscount
    );
    return `${nicknames} ${
      product.name
    } ${colorFormat} ${sizeFormat} 售價 $${productPrizes}${
      isAddLiveDiscountPrice ? ` ${discountContent}` : ""
    }${
      isAddPullOffVariants && pullOffVariants !== ""
        ? `\n**${pullOffVariants} 已下架，請勿喊單**`
        : ""
    }${
      isAddSizeList && sizeListContent !== "" ? `\n${sizeListContent}` : ""
    }`.trim();
  };

  const getProductsExamples = (products: PRODUCT[]) => {
    const examples = products.map((product) => {
      const nicknames = getBroadCastNickName(product);
      const colorFormat = getBroadCastFormat(product, "color");
      const sizeFormat = getBroadCastFormat(product, "size");
      const example = getBroadCastExample(
        nicknames,
        product.sn,
        colorFormat,
        sizeFormat
      );
      return `${example}`;
    });
    return `留言範例：${examples.join(" ")}`.trim();
  };
  const getDiscountContent = (product: PRODUCT) => {
    const productPrizes = getBroadCastPrice(product);
    const discountContent = broadcastDiscountContent(
      productPrizes,
      curDiscount
    );
    return discountContent;
  };
  return {
    getSingleProductContent,
    getMultipleProductContent,
    getDiscountContent,
  };
}

const getBroadCastNickName = (product: PRODUCT) => {
  let res = "";
  if (product?.nicknames && product?.nicknames?.length > 0) {
    product?.nicknames?.forEach((nickname) => {
      res = res === "" ? res.concat(nickname) : res.concat(`/${nickname}`);
    });
  } else {
    res = product.sn;
  }
  return res;
};

export const getBroadCastPrice = (product: PRODUCT) => {
  if (!product?.variants || !product?.variants.length) {
    return "";
  }
  const price = [Number(product?.variants[0].price)];
  product?.variants?.forEach((variant) => {
    if (!price.find((item) => item === Number(variant.price))) {
      price.push(Number(variant.price));
    }
  });
  price.sort((a, b) => a - b);
  return price.join("/$");
};

export const getPullOffVariantsContent = (product: PRODUCT) => {
  if (!product?.variants || !product?.variants.length) {
    return "";
  }
  const pullOffVariants: string[] = [];
  product?.variants?.forEach((variant) => {
    if (variant.status === "下架") {
      pullOffVariants.push(`${variant.color}${variant.size}`);
    }
  });

  return pullOffVariants.join(" ");
};

export const getBroadCastFormat = (
  product: PRODUCT,
  type: "color" | "size"
) => {
  if (!product?.variants || !product?.variants.length) {
    return "";
  }
  const res: string[] = [];
  const colors: string[] = product?.variants.map((variant) => {
    const index = variant.color.indexOf("(");
    const curColor =
      index === -1 ? variant.color.trim() : variant.color.substring(0, index);
    return curColor;
  });
  const sizes: string[] = product?.variants.map((variant) => {
    const index = variant.size.indexOf("(");
    const curSize =
      index === -1 ? variant.size.trim() : variant.size.substring(0, index);
    return curSize;
  });

  if (type === "color") {
    res.push(colors[0].trim());
  } else {
    res.push(sizes[0].trim());
  }

  if (type === "color") {
    colors?.forEach((color) => {
      if (!res.find((item) => item === color)) {
        res.push(color);
      }
    });
  } else {
    sizes?.forEach((size) => {
      if (!res.find((item) => item === size)) {
        res.push(size);
      }
    });
    const sizeOrder: any = {
      XS: 1,
      S: 2,
      M: 3,
      L: 4,
      XL: 5,
      XXL: 6,
    };
    res.sort((a, b) => sizeOrder[a] - sizeOrder[b]);
  }
  return res.join("/");
};

const getBroadCastExample = (
  nicknames: string,
  product: string,
  color: string,
  size: string
) => {
  let res: string =
    nicknames !== "" ? `${nicknames.split("/")[0]} ` : `${product} `;
  const colorList = color.split("/");
  const sizeList = size.split("/");
  if (colorList.length > 1) {
    res = res.concat(color.split("/")[0]);
  }
  if (sizeList.length > 1) {
    res = res.concat(size.split("/")[0]);
  }
  res = res.concat("+1");
  return res;
};

const broadcastDiscountContent = (
  productPrizes: string,
  curDiscount: DISCOUNT | null
) => {
  const isCurrentDiscountAvailable = () => {
    const curTime = dayjs();
    const discountEndTime = dayjs(curDiscount?.end_time);
    return (
      curDiscount &&
      curDiscount.type !== "none" &&
      !isNaN(parseInt(curDiscount.value)) &&
      curTime.isBefore(discountEndTime) &&
      parseInt(curDiscount.value) > 0
    );
  };

  const pricesArray = productPrizes.split("/$");

  const discountAmounts = pricesArray.map((price) => {
    const discountAmount =
      parseInt(price) - parseInt(curDiscount?.value || "0") > 0
        ? parseInt(price) - parseInt(curDiscount?.value || "0")
        : 0;
    return discountAmount;
  });

  return isCurrentDiscountAvailable()
    ? `直播價 $${discountAmounts.join("/$")}`
    : "";
};
