export const getSizeContent = (sizeTable: string) => {
  const arrSizeTable: string[] = sizeTable?.split("\r\n");
  let info = "";
  if (!arrSizeTable || arrSizeTable.length < 2) {
    return;
  }
  const arrHeader: string[] = arrSizeTable[0].split(",");
  arrSizeTable.shift();
  if (arrSizeTable) {
    arrSizeTable.forEach((item) => {
      const values: string[] = item.split(",");

      let temp: string = "";
      for (let i = 0; i < arrHeader.length; i++) {
        temp += `${arrHeader[i]}${values[i]} `;
      }
      temp += "\n";
      info += temp;
    });
  }
  return info;
};
