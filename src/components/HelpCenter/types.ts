export interface HelpCenterTip {
  title: string;
  content: string;
  sortKey: number;
  callToActionLink: {
    isDisplay: boolean;
    href: string;
    text: string;
  };
}
