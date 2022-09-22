const AppError = require('../utils/appError');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};
const handleTokenExpiredError = (err) => {
  const message = `Token Expired !!! ${err.expiredAt}, please login again`;
  return new AppError(message, 401);
};
const handleJsonWebTokenError = (err) => {
  const message = `Invalid Token, please login again`;
  return new AppError(message, 401);
};
const handleDuplicateErrorDB = (err) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Duplicate field value:${value} `;
  return new AppError(message, 400);
};
const handleInValidInputDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid Input. ${errors.join('. ')}`;
  return new AppError(message, 400);
};
const sendErrorDev = (err, req, res) => {
  //API
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }
  // RENDERED website
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong',
    msg: err.message,
  });
};
const sendErrorProd = (err, req, res) => {
  //API
  if (req.originalUrl.startsWith('/api')) {
    //Operational ,  trusted error , send message to client
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });

      // programming or other unknown error;don't leak error details
    }
    console.log('Error', err);
    // send general error message
    return res.status(500).json({
      status: 'error',
      message: 'Something went very wrong',
    });
  }
  // RENDERED website
  if (err.isOperational) {
    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong',
      msg: err.message,
    });

    // programming or other unknown error;don't leak error details
  }
  console.log('Error ', err);
  // send general error message
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong',
    msg: 'Please try again later',
  });
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV.trim() == 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV.trim() == 'production') {
    let error = { ...err };
    error.message = err.message;

    if (err.name == 'CastError') {
      error = handleCastErrorDB(error);
    } else if (err.code == 11000) {
      error = handleDuplicateErrorDB(error);
    } else if (err.name == 'ValidationError') {
      error = handleInValidInputDB(error);
    } else if (err.name == 'JsonWebTokenError') {
      error = handleJsonWebTokenError(error);
    } else if (err.name == 'TokenExpiredError') {
      error = handleTokenExpiredError(error);
    }

    sendErrorProd(error, req, res);
  }
};
