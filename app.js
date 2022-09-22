const express = require('express');
const morgan = require('morgan');
const path = require('path');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet'); // set security headers
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./Routes/tourRoutes');
const userRouter = require('./Routes/userRoutes');
const reviewRouter = require('./Routes/reviewRoutes');
const bookingRouter = require('./Routes/bookingRoutes');
const viewRouter = require('./Routes/viewRoutes');
const app = express();

// view template

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
// express.json()
// a middleware
// middleware actually a function that can modify incoming request data
// it is a middleware that stands between request and response

// Middlewares
//serving static files
app.use(express.static(path.join(__dirname, 'public')));
/* 
Third party middleware function  npm install morgan 
In order to make development life bit easier
Morgan is a very popular logging middleware. It will information about the request
like GET /api/v1/tours 200 23.251 ms - 8622
So, a middleware that's gonna allow us to see request data in the console.

this logging middleware is gonna make our development life a bit easier.

But it still is code that we will actually include in our application

and so, that's why it's not a development dependency but just a simple regular dependency

*/

/* How Morgan Function works 

morgan function return a function like our own middleware function
*/
// arugument specify that how will the logging looks like

// security http headers
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'", 'http://127.0.0.1:3000/*'],
        baseUri: ["'self'"],
        fontSrc: ["'self'", 'https:', 'data:'],
        scriptSrc: [
          "'self'",
          'https://js.stripe.com',
          'https://checkout.stripe.com',
        ],
        frameSrc: [
          "'self'",
          'https://js.stripe.com',
          'https://checkout.stripe.com',
          'https://hooks.stripe.com',
        ],
        connectSrc: [
          "'self'",
          'https://js.stripe.com',
          'https://api.stripe.com',
          'https://checkout.stripe.com',
        ],
        // imgSrc: ['https://*.stripe.com'],
        upgradeInsecureRequests: [],
      },
    },
  })
);

// app.use(
//   helmet({
//     contentSecurityPolicy: {
//       directives: {
//         defaultSrc: ["'self'", 'http://127.0.0.1:3000/*'],
//         baseUri: ["'self'"],
//         fontSrc: ["'self'", 'https:', 'data:'],
//         scriptSrc: [
//           "'self'",
//           'https://*.stripe.com',
//           'https://cdnjs.cloudflare.com/ajax/libs/axios/0.27.2/axios.min.js',
//         ],
//         frameSrc: ["'self'", 'https://*.stripe.com'],
//         objectSrc: ["'none'"],
//         styleSrc: ["'self'", 'https:', "'unsafe-inline'"],
//         upgradeInsecureRequests: [],
//       },
//     },
//   })
// );
app.use((req, res, next) => {
  res.removeHeader('Cross-Origin-Embedder-Policy');
  next();
});
// app.use(helmet({ contentSecurityPolicy: false }));
// development logger

// console.log('Environment', process.env.NODE_ENV);
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// rate limit
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP,please try again after one ',
});

app.use('/api', limiter);
// body parser . reading data from the request body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// data sanitization againt noSQL Query injection
//mongosanitize return middleware function it looks the request body, request query string, and params and it filter out
// all of the dollar signs and quotes
app.use(mongoSanitize());

// and sanitization against XSS
// it cleans any user input from the malicious html code
/* imagine an attacker would try to inserts a malicious html code
with some javascript code attached to it ,so that later 
it would be injected into html site it could really damage then
*/
// this xss middleware convert html code into html entities
app.use(xss());

// prevent paramater pollution

// app.use(hpp());
/* 
we can also pass whitelist 
when you use duplicates in our query string


*/
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsAverage',
      'maxGroupSize',
      'ratingsQuantity',
      'difficulty',
      'price',
    ],
  })
);

/* our own middlewares
middleware functions have access to req, response objext and next 
next is used to call the next middleware in the stack 
if you don't call next() then req and res cycle will be stuck in middleware 
so don't forget to call next()
 */
//test middleware
app.use((req, res, next) => {
  // console.log('Hello from Middleware 👋👋');
  next();
});
app.use(compression());
app.use((req, res, next) => {
  req.requestedTime = new Date().toISOString();
  // console.log(req.cookies);
  next();
});

// routes

// app.get('/', (req, res) => {
//   // res.status(200).send('Hello from Server Side');
//   res.status(200).json({
//     message: 'Hello from server side',
//     author: 'Jhansi',
//   });
// });

// Tours Routes

// app.get('/api/v1/tours', getAllTours);

// app.get('/api/v1/tours/:id', getTour);

// app.post('/api/v1/tours', createNewTour);

// app.patch('/api/v1/tours/:id', updateTour);

// app.delete('/api/v1/tours/:id', deleteTour);

// instead of adding individual route we can combine it and used for get and post

/* Previously all routes on single app Router Instead of maintaing single router
we can add separate router for each Resource
app.route('/api/v1/tours').get(getAllTours).post(createNewTour);
app
  .route('/api/v1/tours/:id')
  .get(getTour)
  .patch(updateTour)
  .delete(deleteTour);

  */

// Creating router for each of resources
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);
app.all('*', (req, res, next) => {
  // res.status(404).json({
  //   status: 'fail',
  //   message: `Can't find ${req.originalUrl} on this server`,
  // });
  // const err = new Error(`Can't find ${req.originalUrl} on this server`);
  // err.status = 'fail';
  // err.statusCode = 404;
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

// global error handling middleware
app.use(globalErrorHandler);

module.exports = app;
