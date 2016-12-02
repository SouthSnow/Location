var mongoose = require('mongoose');
var uri = 'mongodb://localhost:27017/MYDBS';
mongoose.Promise = global.Promise;
mongoose.connect(uri);
module.exports = mongoose;