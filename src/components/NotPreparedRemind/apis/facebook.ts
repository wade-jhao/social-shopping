export const checkIgConversationAuthValid = async (
  accessToken: string,
  pageId: string,
  onSuccess: Function
) => {
  const endpoint = `/${pageId}/conversations?access_token=${accessToken}&platform=instagram`;
  await FB.api(endpoint, "GET", {}, (response: any) => {
    if (response.error && response.error.code === 200) {
      onSuccess && onSuccess(false);
      return;
    }
    if (response) {
      onSuccess && onSuccess(true);
      return;
    }
    throw Error(response?.error?.message || "FB API Error");
  });
};
