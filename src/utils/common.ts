// Get query string param from url
export const getQueryParam = (key: string) => {
  return new URLSearchParams(window.location.search).get(key);
};

export const isMobileBrowser = () => {
  return /Mobi|Android|iPhone|iPad|iPod|Windows Phone|Mobile|Opera Mini|BlackBerry|IEMobile|Silk/i.test(
    navigator.userAgent
  );
};
