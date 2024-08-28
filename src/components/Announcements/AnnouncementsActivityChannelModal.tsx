import { Alert, AlertTitle, Stack } from "@mui/material";
import { useState } from "react";
function AnnouncementsActivityChannelModal() {
  const [isVisibleFirst, setIsVisibleFirst] = useState<boolean>(true);
  return (
    <Stack sx={{ width: "100%" }} spacing={2}>
      {isVisibleFirst ? (
        <Alert severity="warning" onClose={() => setIsVisibleFirst(false)}>
          <AlertTitle>Facebook 社團功能調整</AlertTitle>
          Facebook 將於 2024 年 4 月起停用社團的 +1 功能，此舉是因應 Facebook
          的政策調整。我們正密切關注進展。對於主要依賴社團運營的企業，建議及時尋找替代方案，例如利用公開粉絲專頁、Instagram
          或 Facebook 廣告進行流量導入，以降低對社團功能的依賴。
        </Alert>
      ) : (
        <></>
      )}
    </Stack>
  );
}

export default AnnouncementsActivityChannelModal;
