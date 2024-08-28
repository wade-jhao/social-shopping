import Request from "@utils/request";

const request = new Request({
  baseURL: "",
});

export const api = request.instance;

interface GRAPHQL_PARAMS {
  query: string;
  variables?: { [key: string]: any };
}

export const requestInGraphql = (params: GRAPHQL_PARAMS, accessToken: any) => {
  return api.post("graphql/", params, {
    headers: {
      identity: "TENANT_STAFF",
      Authorization: accessToken,
    },
  });
};
