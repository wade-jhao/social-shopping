import { api } from "@apis/index";

interface LONG_TERM_TOKEN_PARAMS {
  fb_id: string;
  fb_access_token: string;
  user_identity: string;
}

export const getLongTermAccessToken = (params: LONG_TERM_TOKEN_PARAMS) => {
  return api.post("account/login_or_register/", params, {
    headers: {
      identity: "TENANT_STAFF",
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });
};
