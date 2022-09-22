const Booking = require('../Models/bookingModel');
const Tour = require('../Models/tourModel');
const User = require('../Models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
exports.getOverview = catchAsync(async (req, res) => {
  // 1) Get tours data from collection
  const tours = await Tour.find();
  res.status(200).render('overview', { title: 'All Tours', tours: tours });
});
exports.getTour = catchAsync(async (req, res, next) => {
  // 1) get data from the requested tour (including reviews and tourGuides)
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });
  // 2)Build template
  if (!tour) {
    return next(new AppError('There is no tour found with that name', 404));
  }

  // 3) render template using Data from step 1

  res.status(200).render('tour', { title: tour.name, tour: tour });
});

exports.getLoginForm = catchAsync(async (req, res, next) => {
  res.status(200).render('login', { title: 'Login' });
});

exports.getAccount = (req, res) => {
  res.status(200).render('account', { title: 'Your Account' });
};

exports.getMyTours = catchAsync(async (req, res, nect) => {
  // 1) Find all booked tours

  const bookings = await Booking.find({ user: req.user.id });

  // 2) Find all tours with the returned IDS

  const tourIDS = bookings.map((el) => el.tour);
  const tours = await Tour.find({ _id: { $in: tourIDS } });
  res.status(200).render('overview', {
    title: 'My Tours',
    tours,
  });
});
exports.updateUserData = catchAsync(async (req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email,
    },
    {
      new: true,
      runValidators: true,
    }
  );
  res.status(200).render('account', {
    title: 'Your account',
    user: updatedUser,
  });
});
