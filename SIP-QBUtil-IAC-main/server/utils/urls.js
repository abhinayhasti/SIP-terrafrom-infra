const {
  REDIRECT_URI_LOCAL,
  REDIRECT_URI_PROD,
  CLIENT_REDIRECT_PROD,
  CLIENT_REDIRECT_LOCAL,
  STATE,
} = process.env;

const redirectUri =
  process.env.NODE_ENV === "production"
    ? REDIRECT_URI_PROD
    : REDIRECT_URI_LOCAL;

const clientUri =
  process.env.NODE_ENV === "production"
    ? CLIENT_REDIRECT_PROD
    : CLIENT_REDIRECT_LOCAL;

const intuitUrl =
  process.env.INTUIT_ENVIRONMENT === "sandbox"
    ? process.env.INTUIT_SANDBOX_URL
    : process.env.INTUIT_PROD_URL;

const intuitUrls = [
  process.env.INTUIT_SANDBOX_URL,
  process.env.INTUIT_PROD_URL,
];

module.exports = {
  redirectUri,
  clientUri,
  STATE,
  intuitUrls,
  intuitUrl,
};
