const crypto = require("crypto");

const sendResponse = require("../helpers/sendResponse");

const OAuthClient = require("intuit-oauth");

const StateStack = require("../utils/stateStack");
const TokenQueue = require("../utils/tokenQueue");

const { clientUri, redirectUri } = require("./../utils/urls");

const {
  CLIENT_ID: clientId,
  CLIENT_SECRET: clientSecret,
  INTUIT_ENVIRONMENT: environment,
} = process.env;

let initOAuth = null;

const requestAuthorizeUrl = (req, res) => {
  const uniqueState = crypto.randomBytes(32).toString("hex");

  if (req.method !== "GET") {
    return sendResponse({
      message: "Method Not Allowed.",
      status: false,
      statusCode: 405,
      res,
    });
  }

  try {
    initOAuth = new OAuthClient({
      clientId,
      clientSecret,
      environment,
      redirectUri,
    });

    StateStack.add(uniqueState);

    const authUri = initOAuth.authorizeUri({
      scope: [OAuthClient.scopes.Accounting, OAuthClient.scopes.OpenId],
      state: uniqueState,
    });

    return sendResponse({
      message: "success",
      status: true,
      statusCode: 200,
      data: authUri,
      res,
    });
  } catch (e) {
    StateStack.remove(uniqueState);

    return sendResponse({
      message: "Internal Server Error.",
      status: false,
      statusCode: 500,
      res,
    });
  }
};

const generateToken = (req, res) => {
  const {
    url: parseRedirect,
    query: { realmId: companyId, state: stateQuery },
  } = req;

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
        console.log({generateTokenError: e});
        StateStack.remove(stateQuery);

        return res.redirect(`${clientUri}?token=false`);
      });

    return;
  } else {
    console.log('err: no valid state and intuit instance');
    StateStack.remove(stateQuery);
    return res.redirect(`${clientUri}?token=false`);
  }
};

const retrieveToken = (req, res) => {
  if (req.method !== "GET")
    return sendResponse({
      message: "Method Not Allowed.",
      status: false,
      statusCode: 405,
      res,
    });

  const state = req.query.state;

  const isToken = state in TokenQueue.tokens;

  if (!state || !isToken) {
    return sendResponse({
      message: "Forbidden Access.",
      status: false,
      statusCode: 403,
      res,
    });
  }

  const token = TokenQueue.getToken(state);

  if (!token) {
    initOAuth = null;

    return sendResponse({
      message: "failed",
      status: false,
      statusCode: 404,
      res,
    });
  }

  TokenQueue.dequeueToken(state);

  initOAuth = null;

  return sendResponse({
    message: "success",
    status: true,
    statusCode: 200,
    data: token,
    res,
  });
};

module.exports = {
  requestAuthorizeUrl,
  generateToken,
  retrieveToken,
};
