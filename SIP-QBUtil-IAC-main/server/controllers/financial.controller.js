const sendResponse = require("../helpers/sendResponse");
const OAuthClient = require("intuit-oauth");

const { redirectUri, intuitUrl } = require("./../utils/urls");

const {
  CLIENT_ID: clientId,
  CLIENT_SECRET: clientSecret,
  INTUIT_ENVIRONMENT: environment,
} = process.env;

const getProfitAndLoss = async (req, res) => {
  if (req.method !== "GET")
    return sendResponse({
      message: "Method Not Allowed.",
      status: false,
      statusCode: 405,
      res,
    });

  try {
    const {
      end_date: endDate,
      start_date: startDate,
      companyId,
      department,
    } = req.query;

    if (!endDate || !startDate || !companyId || !department) {
      return sendResponse({
        message: "Provided required query parameters.",
        status: false,
        statusCode: 400,
        data: null,
        res,
      });
    }

    const token = req.headers.authorization;

    const url = new URL(
      `${intuitUrl}/v3/company/${companyId}/reports/ProfitAndLoss`
    );

    url.searchParams.set("end_date", endDate);
    url.searchParams.set("start_date", startDate);
    url.searchParams.set("department", department);
    url.searchParams.set("summarize_column_by", "Month");

    const oauthClient = new OAuthClient({
      clientId,
      clientSecret,
      environment,
      redirectUri,
    });

    oauthClient.setToken({
      access_token: token,
    });


    const data = await oauthClient.makeApiCall({
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
      data,
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

module.exports = {
  getProfitAndLoss,
};
