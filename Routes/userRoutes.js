const express = require('express');

const userController = require(`../controllers/userController`);
const authController = require('../controllers/authController');
const router = express.Router();

router.post('/signup', authController.signUp);
router.post('/login', authController.login);
router.get('/logout', authController.logout);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

// middleware
// this authcontroller.protect will be added to middleware stack
// this will be added to each route which comes after this middleware
// protect all routes
router.use(authController.protect);

// router.patch(
//   '/updatePassword',
//   authController.protect,
//   authController.updatePassword
// );
// router.get(
//   '/me',
//   authController.protect,
//   userController.getMe,
//   userController.getUser
// );
// router.patch('/updateMe', authController.protect, userController.updateMe);
// router.delete('/deleteMe', authController.protect, userController.deleteMe);
// router
//   .route('/')
//   .get(authController.protect, userController.getAllUsers)
//   .post(userController.createNewUser);
// router
//   .route('/:id')
//   .get(authController.protect, userController.getUser)
//   .patch(authController.protect, userController.updateUser)
//   .delete(authController.protect, userController.deleteUser);

router.patch('/updatePassword', authController.updatePassword);
router.get('/me', userController.getMe, userController.getUser);
router.patch(
  '/updateMe',
  userController.uploadUserPhoto,
  userController.resizeUserPhoto,
  userController.updateMe
);
router.delete('/deleteMe', userController.deleteMe);

// restrict to admin
router.use(authController.restrictTo('admin'));
router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createNewUser);
router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);
module.exports = router;
