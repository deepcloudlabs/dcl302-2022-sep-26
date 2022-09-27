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
    "_id": {
        type: String,
        required: true
    },
    "fullname": {
        type: String,
        required: true,
        minLength: 5
    },
    "identityNo": {
        type: String,
        required: true,
        unique: true,
        validate: [
            tcKimlikNoValidator,
            "You must provide a valid identity no."
        ]
    },
    "salary": {
        type: Number,
        required: true,
        min: 5500
    },
    "iban": {
        type: String,
        required: true,
        validate: [
            ibanValidator,
            "You must provide a valid iban."
        ]
    },
    "birthYear": {
        type: Number,
        required: true
    },
    "photo": {
        type: String,
        required: false,
        default: AppConfig.NO_IMAGE
    }
});

// Model -> Employee
const Employee = mongoose.model(collection_name, employeeSchema);
