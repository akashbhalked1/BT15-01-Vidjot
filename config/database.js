let db = {};
if(process.env.NODE_ENV === 'production') {
  // see https://mlab.com
  db = {mongoURI: "mongodb://abbie:123456@ds257627.mlab.com:57627/vidjot-prod"};
} else {
  db = {mongoURI: "mongodb://localhost:27017/vidjot-dev"};
}
module.exports = db;