const mongoose = require('mongoose');

const dotenv = require('dotenv');

process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION 🔥 Shutting down');
  console.log(err.name, err.message);
  process.exit(1);
});

dotenv.config({ path: './config.env' });
const app = require('./app');
// will gives current environment in which our node app is running
// console.log(app.get('env')); // this env one is sets by express
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASEPASSWORD
);
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then((con) => {
    console.log('DB Connection is successful');
  })
  .catch((err) => console.log('ERROR'));
// environment variables are global variables
// that are used to define the environment in which our node app is running

// node js actually sets lot of environment variables
// these are located at process.env

// console.log(process.env);
/* 
Now these variables, they come from the process core module and we're set at the moment that the process started.
And as you see, we didn't have to require the process module right. It is simply available everywhere automatically.

Now in Express, many packages depend on a special variable

called node N.

So it's a variable that's kind of a convention

which should define whether we're in development

or in production mode okay.

However Express does not really define this variable,

and so we have to do that manually.
*/

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  console.log('App running on port 3000');
});
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION 🔥 Shutting down');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
