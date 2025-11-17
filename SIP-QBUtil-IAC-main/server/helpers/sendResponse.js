const sendResponse = ({ res, message, statusCode, status, ...rest }) => {
  res
    .status(statusCode)
    .json({ success: status, statusCode, message, ...rest });
};

module.exports = sendResponse;
