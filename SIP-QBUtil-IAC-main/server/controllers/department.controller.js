const OAuthClient = require("intuit-oauth");

const { intuitUrl, redirectUri } = require("./../utils/urls");

const sendResponse = require("../helpers/sendResponse");

const {
  CLIENT_ID: clientId,
  CLIENT_SECRET: clientSecret,
  INTUIT_ENVIRONMENT: environment,
} = process.env;

const getDepartments = async (req, res) => {
  const { companyId } = req.query;

  if (req.method !== "GET")
    return sendResponse({
      message: "Method Not Allowed",
      status: false,
      statusCode: 405,
      res,
    });

  try {
    const oauthClient = new OAuthClient({
      clientId,
      clientSecret,
      environment,
      redirectUri,
    });

    const token = req.headers.authorization;

    oauthClient.setToken({
      access_token: token,
    });

    const url = new URL(`${intuitUrl}/v3/company/${companyId}/query`);

    url.searchParams.set("query", "select * from Department");

    const departments = await oauthClient.makeApiCall({
      url: url.href,
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache, no-store",
      },
    });

    return sendResponse({
      message: "success",
      status: true,
      statusCode: 200,
      data: departments,
      res,
    });
  } catch (e) {
    return sendResponse({
      message:
        e.error === "Unauthorized" ? "Authorized Access!" : "Request Failed!",
      status: false,
      statusCode: e.error === "Unauthorized" ? 401 : 500,
      data: null,
      res,
    });
  }
};

module.exports = { getDepartments };
