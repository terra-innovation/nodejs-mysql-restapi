export const customResponseError = (res, status = 500, message) => {
  res.status(status).json({
    error: true,
    message,
  });
};
