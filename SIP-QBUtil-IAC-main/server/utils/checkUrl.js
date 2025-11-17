const checkIntuitUrl = (intuitUrls, url) => {
  if (!intuitUrls.some((intuitUrl) => url.includes(intuitUrl)))
    throw new Error("Invalid url");
};

module.exports = checkIntuitUrl;
