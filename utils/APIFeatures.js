class APIFeatures {
  // query means Tour, queryString means Tour.find() -> query Object
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }
  filter() {
    // 1 Build Query

    // 1 Filtering
    const queryObj = { ...this.queryString };
    const excludedQuery = ['sort', 'limit', 'page', 'fields'];
    excludedQuery.forEach((el) => delete queryObj[el]);

    // 2 Advance filtering

    /* when we specify operators in filtering we need to use object
        filter object for filtering be like this
      {difficulty:"easy", duration: {$gte: 5}}
      in postman we need to specify query below  like this
      http://localhost:3000/api/v1/tours?duration[gte]=5&difficulty=easy
      after hitting the server it return query as below 
      { duration: { gte: '5' }, difficulty: 'easy' }

      it looks like filter object but mongoDB symbol is missing infront of operator
      so we need to add that operator.
    */

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    // console.log(JSON.parse(queryStr));

    this.query.find(JSON.parse(queryStr));
    return this;
  }
  sort() {
    // 1 sorting

    // need to send request to the server like this
    // Ascending Order http://localhost:3000/api/v1/tours?sort=price
    // Descending order Order http://localhost:3000/api/v1/tours?sort=-price
    if (this.queryString.sort) {
      /* If the field we specified for sorting having same value for two documents then we need to specify other field also

        Query be like this 
        http://localhost:3000/api/v1/tours?sort=price,ratingsAverage
      
        1. we need to split and add space to the fileds

      */
      const sortBy = this.queryString.sort.split(',').join(' ');
      // console.log(sortBy);
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }
  limitFields() {
    // 2 LIMIT FIELDS
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      // console.log(fields);
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }
  pagination() {
    // 3 Pagination and limiting

    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skipDocuments = (page - 1) * limit;

    this.query = this.query.skip(skipDocuments).limit(limit);
    return this;
  }
}
module.exports = APIFeatures;
