const crypto = require("crypto");

const responseMsg = require("../helpers/response");

const OAuthClient = require("intuit-oauth");

const checkIntuitUrl = require("../utils/checkUrl");

const StateStack = require("../utils/stateStack");

const TokenQueue = require("../utils/tokenQueue");

const { clientUri, redirectUri, intuitUrls } = require("./../utils/urls");

let initOAuth = null;

const credentialsController = (req, res) => {
  try {
    if (req.method === "POST") {
      const {
        body: { clientId, clientSecret, environment },
      } = req;

      if (clientId && clientSecret && environment) {
        initOAuth = new OAuthClient({
          clientId: clientId,
          clientSecret: clientSecret,
          environment,
          redirectUri,
        });

        const uniqueState = crypto.randomBytes(32).toString("hex");

        StateStack.add(uniqueState);

        const authUri = initOAuth.authorizeUri({
          scope: [OAuthClient.scopes.Accounting, OAuthClient.scopes.OpenId],
          state: uniqueState,
        });

        return responseMsg({
          message: "success",
          status: true,
          statusCode: 200,
          data: authUri,
          res,
        });
      }

      return responseMsg({
        message: "All fields are required",
        status: false,
        statusCode: 400,
        res,
      });
    }
    return responseMsg({
      message: "Method not allowed",
      status: false,
      statusCode: 405,
      res,
    });
  } catch (e) {
    StateStack.remove(uniqueState);

    return responseMsg({
      message: "Internal server error",
      status: false,
      statusCode: 500,
      res,
    });
  }
};

const generateTokenController = (req, res) => {
  const parseRedirect = req.url;

  const companyId = req.query.realmId;

  const stateQuery = req.query.state;

  const isStateValid = StateStack.getState().includes(stateQuery);

  if (initOAuth && isStateValid) {
    initOAuth
      .createToken(parseRedirect)
      .then(function (authResponse) {
        TokenQueue.enqueueToken(stateQuery, {
          ...authResponse.getJson(),
          companyId,
        });

        StateStack.remove(stateQuery);

        return res.redirect(`${clientUri}?token=true&state=${stateQuery}`);
      })
      .catch(function (e) {
        StateStack.remove(stateQuery);

        return res.redirect(`${clientUri}?token=false`);
      });

    return;
  } else {
    StateStack.remove(stateQuery);
    return res.redirect(`${clientUri}?token=false`);
  }
};

const retrieveTokenController = (req, res) => {
  if (req.method === "GET") {
    const state = req.query.state;

    const isToken = state in TokenQueue.tokens;

    if (!state || !isToken) {
      return responseMsg({
        message: "Forbidden access.",
        status: false,
        statusCode: 403,
        res,
      });
    }

    const token = TokenQueue.getToken(state);

    if (token) {
      responseMsg({
        message: "success",
        status: true,
        statusCode: 200,
        data: token,
        res,
      });

      TokenQueue.dequeueToken(state);
      initOAuth = null;
    } else {
      responseMsg({
        message: "failed",
        status: false,
        statusCode: 404,
        res,
      });

      initOAuth = null;
    }
  } else {
    return responseMsg({
      message: "Method not allowed only GET",
      status: false,
      statusCode: 405,
      res,
    });
  }
};

const postDataToQuickBook = (req, res) => {
  if (req.method === "POST") {
    try {
      const { url, query, values, token } = req.body;

      if (url && query && values && token && redirectUri) {
        checkIntuitUrl(intuitUrls, url);

        const oauthClient = new OAuthClient({
          clientId: values.clientId,
          clientSecret: values.clientSecret,
          environment: values.environment,
          redirectUri,
        });

        oauthClient.setToken(token);

        oauthClient
          .makeApiCall({
            url: `${url}?query=${query}`,
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Cache-Control": "no-cache, no-store",
            },
          })
          .then(function (response) {
            return responseMsg({
              message: "success",
              status: true,
              statusCode: 200,
              data: response,
              res,
            });
          })
          .catch(function (e) {
            return responseMsg({
              message: "Internal server error",
              status: false,
              statusCode: 500,
              res,
            });
          });
      } else
        return responseMsg({
          message: "All fields are required",
          status: false,
          statusCode: 400,
          res,
        });
    } catch (e) {
      return responseMsg({
        message: "Internal server error",
        status: false,
        statusCode: 500,
        res,
      });
    }
  } else
    return responseMsg({
      message: "Method not allowed only POST",
      status: false,
      statusCode: 405,
      res,
    });
};

const getDataFromQuickBook = (req, res) => {
  if (req.method === "GET") {
    try {
      const queries = req.query;

      let url = queries?.["url"];
      let parsedToken = queries?.["token"];
      let parsedValues = queries?.["value"];
      let startDate = queries?.["start_date"];
      let endDate = queries?.["end_date"];

      if (
        url &&
        parsedToken !== "" &&
        parsedValues !== "" &&
        startDate &&
        endDate
      ) {
        checkIntuitUrl(intuitUrls, url);

        parsedToken = JSON.parse(queries["token"]);
        parsedValues = JSON.parse(queries["value"]);

        const finalUrl = `${String(url).trim()}?start_date=${String(
          startDate
        ).trim()}&end_date=${String(endDate).trim()}`;

        const oauthClient = new OAuthClient({
          clientId: parsedValues.clientId,
          clientSecret: parsedValues.clientSecret,
          environment: parsedValues.environment,
          redirectUri,
        });

        oauthClient.setToken(parsedToken);

        oauthClient
          .makeApiCall({
            url: finalUrl,
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "Cache-Control": "no-cache, no-store",
            },
          })
          .then(function (response) {
            return responseMsg({
              message: "success",
              status: true,
              statusCode: 200,
              data: response,
              res,
            });
          })
          .catch(function (e) {
            return responseMsg({
              message: e.error ? e.error : "failed",
              status: true,
              statusCode: e.error === "Unauthorized" ? 401 : 500,
              data: null,
              res,
            });
          });
      } else
        return responseMsg({
          message: "All fields are required",
          status: false,
          statusCode: 400,
          res,
        });
    } catch (e) {
      return responseMsg({
        message: "Internal server error",
        status: false,
        statusCode: 500,
        res,
      });
    }
  } else
    return responseMsg({
      message: "Method not allowed only GET",
      status: false,
      statusCode: 405,
      res,
    });
};

const getDataByDepartment = (req, res) => {
  if (req.method === "GET") {
    try {
      const queries = req.query;

      let parsedToken = queries?.["token"] || "";
      let parsedValues = queries?.["value"] || "";

      const url = queries?.["url"];
      const startDate = queries?.["start_date"];
      const endDate = queries?.["end_date"];
      const department = queries?.["department"];

      if (
        department &&
        url &&
        parsedToken !== "" &&
        parsedValues !== "" &&
        startDate &&
        endDate
      ) {
        checkIntuitUrl(intuitUrls, url);

        parsedToken = JSON.parse(queries["token"]);
        parsedValues = JSON.parse(queries["value"]);

        const finalUrl = `${String(url).trim()}?start_date=${String(
          startDate
        ).trim()}&end_date=${String(endDate).trim()}&department=${department}`;

        const oauthClient = new OAuthClient({
          clientId: parsedValues.clientId,
          clientSecret: parsedValues.clientSecret,
          environment: parsedValues.environment,
          redirectUri,
        });

        oauthClient.setToken(parsedToken);

        oauthClient
          .makeApiCall({
            url: finalUrl,
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "Cache-Control": "no-cache, no-store",
            },
          })
          .then(function (response) {
            return responseMsg({
              message: "success",
              status: true,
              statusCode: 200,
              data: response,
              res,
            });
          })
          .catch(function (e) {
            return responseMsg({
              message: e.error ? e.error : "failed",
              status: true,
              statusCode: e.error === "Unauthorized" ? 401 : 500,
              data: null,
              res,
            });
          });
      } else
        return responseMsg({
          message: "All fields are required",
          status: false,
          statusCode: 400,
          res,
        });
    } catch (e) {
      return responseMsg({
        message: "Internal server error",
        status: false,
        statusCode: 500,
        res,
      });
    }
  } else
    return responseMsg({
      message: "Method not allowed only GET",
      status: false,
      statusCode: 405,
      res,
    });
};

const getData = (req, res) => {
  if (req.method === "GET") {
    try {
      const queries = req.query;

      let url = queries?.["url"];
      let parsedToken = queries?.["token"] || "";
      let parsedValues = queries?.["value"] || "";

      if (url && parsedToken !== "" && parsedValues !== "") {
        checkIntuitUrl(intuitUrls, url);

        parsedToken = JSON.parse(queries["token"]);
        parsedValues = JSON.parse(queries["value"]);

        const oauthClient = new OAuthClient({
          clientId: parsedValues.clientId,
          clientSecret: parsedValues.clientSecret,
          environment: parsedValues.environment,
          redirectUri,
        });

        oauthClient.setToken(parsedToken);

        oauthClient
          .makeApiCall({
            url: `${url}?query=select * from Department`,
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "Cache-Control": "no-cache, no-store",
            },
          })
          .then(function (response) {
            return responseMsg({
              message: "success",
              status: true,
              statusCode: 200,
              data: response,
              res,
            });
          })
          .catch(function (e) {
            return responseMsg({
              message: e.error ? e.error : "failed",
              status: true,
              statusCode: e.error === "Unauthorized" ? 401 : 500,
              data: null,
              res,
            });
          });
      } else
        return responseMsg({
          message: "All fields are required",
          status: false,
          statusCode: 400,
          res,
        });
    } catch (e) {
      return responseMsg({
        message: "Internal server error",
        status: false,
        statusCode: 500,
        res,
      });
    }
  } else
    return responseMsg({
      message: "Method not allowed only GET",
      status: false,
      statusCode: 405,
      res,
    });
};

module.exports = {
  credentialsController,
  generateTokenController,
  retrieveTokenController,
  getDataFromQuickBook,
  postDataToQuickBook,
  getData,
  getDataByDepartment,
};

