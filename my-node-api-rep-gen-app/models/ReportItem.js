
// models/ReportItem.js
const mongoose = require('mongoose');

// Create a separate connection for "mydb"
const reportDb = mongoose.createConnection('mongodb://localhost:27017/mydb', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const ReportItemSchema = new mongoose.Schema({
  report_id: String,
  parameter: String,
});

// Export the model using reportDb connection
module.exports = reportDb.model('ReportItem', ReportItemSchema, 'items');


//const mongoose = require('mongoose');
//
//const ReportItemSchema = new mongoose.Schema({
//  report_id: String,
//  parameter: String
//});
////module.exports = mongoose.model('ReportItem', ReportItemSchema);
//module.exports = mongoose.model('ReportItem', ReportItemSchema, 'items');