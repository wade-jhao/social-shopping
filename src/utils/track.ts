// Send GA event
export const sendGaEvent = <T>(eventName: string, params: T) => {
  window.gtag("event", eventName, params);
};

// Send GA page view
export const sendGaPageView = (title: string) => {
  window.gtag("event", "page_view", {
    page_title: title,
    page_location: window.location.href,
  });
};
