const mongoose = require("mongoose");
const {mongo} = require("mongoose");

const mongodb_url = "mongodb://localhost:27017/hrdb";
const collection_name = "employees";
const mongo_opts = {
  "useNewUrlParser": true,
  "socketTimeoutMS": 0,
  "keepAlive": true,
  "useCreateIndex": true,
  "useUnifiedTopology": true
};

mongoose.connect(mongodb_url, mongo_opts);

const employeeSchema = new mongoose.Schema({

});

// Model -> Employee
const Employee = mongoose.model(collection_name, employeeSchema);
