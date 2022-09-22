const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');
// const User = require('./userModel');
// each time we output josn data we need virtuals too
// we also want to say to object.

// So basically when the data gets outputted as an object.

const tourSchema = new mongoose.Schema(
  {
    // schema type options
    name: {
      type: String,

      reqired: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      // validator is a simple function that returns true or false
      maxLength: [
        40,
        'A tour name must have less or  equal than 40 characters',
      ],
      minLength: [
        10,
        'A tour name must have greater or  equal than 10 characters',
      ],
      // validate: [validator.isAlpha, 'Name should have characters'],
    },
    slug: {
      type: String,
    },
    duration: {
      type: Number,
      required: [true, 'A Tour have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, ' A tour must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Diffuculty is either easy or medium or difficult',
      },
    },
    summary: {
      type: String,
      trim: true,
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, ' Rating must be above 1'],
      max: [5, ' Rating must be below 5'],
      set: (val) => Math.round(val * 10) / 10,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      unique: false,
      required: [true, 'A tour must have a Price'],
    },

    priceDiscount: {
      type: Number,

      // won't work on update
      // this only pomits to current document on New document creation
      validate: {
        validator: function (val) {
          return val < this.price; // 100 < 200
        },
        message: ' Price discount {VALUE} must be below the regular price',
      },
    },
    description: {
      type: String,
      trim: true,
      require: [true, 'A tour must have a description'],
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      /* MongoDB uses geospatial data out of the box
      Geospatial data is basically data that describes
      places on earth using latitude and longitude coordinates.
      we can describe simple points or also describes more complex geometrics
      like lones or even polygons or even multi polygons
      geoJSON use to specify geospatial data
       */

      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    // guides: Array, we use embedding
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
tourSchema.index({ price: 1, ratingsAverage: 1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' });
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});
// virtual populate
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});
// save event
// DOCUMENT Middleware: runs before  .save() and .create() not on insertMany
// each middleware function pre save function have access to  next

// we can have more than one pre save hooks
tourSchema.pre('save', function (next) {
  // this will points to current document
  this.slug = slugify(this.name, { lower: true });
  next();
});
// embeding users into tours
// tourSchema.pre('save', async function (next) {
//   const guidesPromises = this.guides.map(async (id) => await User.findById(id));
//   this.guides = await Promise.all(guidesPromises);
//   next();
// });
// tourSchema.pre('save', function (next) {
//   console.log('will save document');
//   next();
// });
// // doc that just saved
// tourSchema.post('save', function (doc, next) {
//   console.log(doc);
//   next();
// });
// Query Middleware
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  next();
});
tourSchema.pre(/^find/, function (next) {
  // console.log(docs);
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt',
  });
  next();
});
tourSchema.post(/^find/, function (docs, next) {
  // console.log(docs);

  next();
});
// aggregation Middleware
tourSchema.pre('aggregate', function (next) {
  // this.pipeline().unshift({
  //   $match: { secretTour: { $ne: true } },
  // });
  // console.log(this);
  next();
});
const Tour = mongoose.model('Tour', tourSchema);
module.exports = Tour;
