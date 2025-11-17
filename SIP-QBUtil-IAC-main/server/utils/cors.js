const { CLIENT_REDIRECT_LOCAL, CLIENT_REDIRECT_PROD } = process.env;

const allowedOriginsDev = [CLIENT_REDIRECT_LOCAL, "http://localhost:3001"];

const allowedOriginsProd = [CLIENT_REDIRECT_PROD];

const origins =
  process.env.NODE_ENV === "production"
    ? allowedOriginsProd
    : allowedOriginsDev;

const corsFn = (req, cb) => {
  let corsOption;

  const isDomainAllowed = origins.indexOf(req.header("Origin")) !== -1;

  if (isDomainAllowed) corsOption = { origin: true };
  else corsOption = { origin: false };

  cb(null, corsOption);
};

module.exports = corsFn;
