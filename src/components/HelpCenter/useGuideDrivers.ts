import { useStreamStatus } from "@hooks/streamStatus";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";
import CampaignOutlinedIcon from "@mui/icons-material/CampaignOutlined";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import TextRotationNoneOutlinedIcon from "@mui/icons-material/TextRotationNoneOutlined";
import LinkOutlinedIcon from "@mui/icons-material/LinkOutlined";
import StopCircleOutlinedIcon from "@mui/icons-material/StopCircleOutlined";
import PercentOutlinedIcon from "@mui/icons-material/PercentOutlined";
import ChatOutlinedIcon from "@mui/icons-material/ChatOutlined";
import BarChartOutlinedIcon from "@mui/icons-material/BarChartOutlined";
import PermIdentityOutlinedIcon from "@mui/icons-material/PermIdentityOutlined";
import { useAppSelector } from "@store/hooks";
import {
  selectComments,
  selectIgMediaComments,
  selectProducts,
} from "@store/liveroomSlice";

type HELP_CENTER_DRIVER_TYPE = "draft" | "liveRoom";
interface HelpCenterDriver {
  icon: React.ElementType;
  title: string;
  type: HELP_CENTER_DRIVER_TYPE;
  sortKey: number;
  disabled: boolean;
  popoverConfiguration: {
    element: string;
    popover: {
      description: string;
      side: "top" | "right" | "bottom" | "left" | "over";
      align: "start" | "center" | "end";
    };
  };
}

export default function useHelpCenterGuideDrivers() {
  const { IS_STREAM_ENDED } = useStreamStatus();
  const curCommments = useAppSelector(selectComments);
  const curIgCommments = useAppSelector(selectIgMediaComments);
  const productList = useAppSelector(selectProducts);
  const draftDrivers: HelpCenterDriver[] = [
    {
      icon: AddOutlinedIcon,
      title: "新增商品",
      type: "draft",
      sortKey: 0,
      disabled: false,
      popoverConfiguration: {
        element: "#add-product-btn",
        popover: {
          description: "新增活動商品到當前直播",
          side: "bottom",
          align: "center",
        },
      },
    },
    {
      icon: TextRotationNoneOutlinedIcon,
      title: "設定關鍵字",
      type: "draft",
      sortKey: 1,
      disabled: productList?.length === 0,
      popoverConfiguration: {
        element: "#more-action-btn",
        popover: {
          description:
            "透過自動化關鍵字，輸入商品關鍵字前綴，快速編輯多個商品關鍵字，或單獨編輯商品關鍵字",
          side: "bottom",
          align: "center",
        },
      },
    },
    {
      icon: LinkOutlinedIcon,
      title: "連結直播",
      type: "draft",
      sortKey: 2,
      disabled: false,
      popoverConfiguration: {
        element: "#enable-live-btn",
        popover: {
          description:
            "確定+1活動已經開啟，關聯已開始直播社群貼文，啟用直播活動",
          side: "bottom",
          align: "center",
        },
      },
    },
  ];
  const liveRoomDrivers: HelpCenterDriver[] = [
    {
      icon: CampaignOutlinedIcon,
      title: "曝光商品",
      type: "liveRoom",
      sortKey: 0,
      disabled: false,
      popoverConfiguration: {
        element: "[aria-label='broadCast']",
        popover: {
          description: "點擊「曝光」。",
          side: "bottom",
          align: "center",
        },
      },
    },
    {
      icon: TextRotationNoneOutlinedIcon,
      title: "編輯規格關鍵字",
      type: "liveRoom",
      sortKey: 1,
      disabled: false,
      popoverConfiguration: {
        element: "[aria-label='edit-custom-variant-name']",
        popover: {
          description: "編輯規格關鍵字",
          side: "bottom",
          align: "center",
        },
      },
    },
    {
      icon: StopCircleOutlinedIcon,
      title: "結束直播",
      type: "liveRoom",
      sortKey: 2,
      disabled: IS_STREAM_ENDED,
      popoverConfiguration: {
        element: "#driver-1",
        popover: {
          description: "點擊「結束直播」，可直接在主控台上關閉直播。",
          side: "bottom",
          align: "center",
        },
      },
    },
    {
      icon: PercentOutlinedIcon,
      title: "編輯折扣",
      type: "liveRoom",
      sortKey: 3,
      disabled: false,
      popoverConfiguration: {
        element: "#discount-action",
        popover: {
          description: "點擊「折扣設定」。",
          side: "right",
          align: "center",
        },
      },
    },
    {
      icon: ChatOutlinedIcon,
      title: "查看留言總覽",
      type: "liveRoom",
      sortKey: 4,
      disabled: false,
      popoverConfiguration: {
        element: "#comments-action",
        popover: {
          description: "點擊「留言總覽」。",
          side: "right",
          align: "center",
        },
      },
    },
    {
      icon: BarChartOutlinedIcon,
      title: "查看商品統計",
      type: "liveRoom",
      sortKey: 5,
      disabled: false,
      popoverConfiguration: {
        element: "#order-action",
        popover: {
          description: "點擊「商品統計」。",
          side: "right",
          align: "center",
        },
      },
    },
    {
      icon: PermIdentityOutlinedIcon,
      title: "查看會員資料",
      type: "liveRoom",
      sortKey: 6,
      disabled:
        (curCommments !== null && curCommments.length === 0) ||
        (curIgCommments !== null && curIgCommments.length === 0),
      popoverConfiguration: {
        element: "[aria-describedby*='detail-popper-']",
        popover: {
          description: "點擊大頭貼或名字可以查看消費者會員等級",
          side: "bottom",
          align: "center",
        },
      },
    },
    {
      icon: SendOutlinedIcon,
      title: "發送付款提醒",
      type: "liveRoom",
      sortKey: 7,
      disabled: !IS_STREAM_ENDED,
      popoverConfiguration: {
        element: "#notify-action",
        popover: {
          description: "點擊「發送通知」。",
          side: "right",
          align: "center",
        },
      },
    },
  ];
  return { draftDrivers, liveRoomDrivers };
}
