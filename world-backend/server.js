//region Mongoose -- MongoDB Connection & Configuration
const mongoose = require("mongoose");
const mongodb_url = "mongodb://localhost:27017/world";
const collection_name = "countries1";
const mongo_opts = {
    "useNewUrlParser": true,
    "socketTimeoutMS": 0,
    "keepAlive": true,
    "useUnifiedTopology": true
};
mongoose.connect(mongodb_url, mongo_opts);
//endregion

//region Mongoose -- Country Schema
const countrySample = {
    "cities": [
    {
        "district": "–",
        "_id": 61,
        "name": "South Hill",
        "population": 961
    },
    {
        "district": "–",
        "_id": 62,
        "name": "The Valley",
        "population": 595
    }
   ],
};
const citySchema = new mongoose.Schema({
    "_id": {
        type: Number,
        required: true
    },
    "district": {
        type: String,
        required: true
    },
    "name": {
        type: String,
        required: true
    },
    "population": {
        type: Number,
        required: true,
        min: 0
    }
});

const countrySchema = new mongoose.Schema({
    "_id": {
        type: String,
        required: true,
        regexp: "^[A-Z]{3}$"
    },
    cities: [ citySchema ],
    "continent": {
        type: String,
        enum: ["Africa", "Antarctica", "Asia", "Europe", "North America", "Oceania", "South America"],
        required: true
    },
    "gnp": {
        type: Number,
        required: true,
        default: 0
    },
    "governmentForm": {
        type: String,
        required: true
    },
    "headOfState": {
        type: String,
        required: true
    },
    "lifeExpectancy": {
        type: Number,
        required: false
    },
    "localName": {
        type: String,
        required: true
    },
    "name": {
    type: String,
        required: true
    },
    "population": {
        type: Number,
        required: true,
        min: 0
    },
    "region": {
        type: String,
        enum: ["Antarctica", "Australia and New Zealand", "Baltic Countries", "British Islands", "Caribbean", "Central Africa", "Central America", "Eastern Africa", "Eastern Asia", "Eastern Europe", "Melanesia", "Micronesia", "Micronesia/Caribbean", "Middle East", "Nordic Countries", "North America", "Northern Africa", "Polynesia", "South America", "Southeast Asia", "Southern Africa", "Southern Europe", "Southern and Central Asia", "Western Africa", "Western Europe"]
    },
    "surfaceArea": {
        type: Number,
        required: false
    }
});

// Model -> Country -> Aggregate
const Country = mongoose.model(collection_name, countrySchema);
//endregion

//region Express.js Configuration
const port = 3100;
const express = require("express");
const bodyParser = require("body-parser");
const logger = require("morgan");

const api = express();
api.use(bodyParser.json({limit: "5kb"}))
api.use(logger('dev'));
const server = api.listen(port);
console.log(`Server is listening the port ${port}`);
//endregion

//region CORS
// CORS Filter
api.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "HEAD, POST, PUT, DELETE, PATCH, GET");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
})
//endregion

//region REST on http - Query
// GET http://localhost:3100/world/api/v1/countries/TUR
// curl -X GET "http://localhost:3100/world/api/v1/countries/TUR"
api.get("/world/api/v1/countries/:country_code", async (req, res) => {
        const countryCode = req.params.country_code;
        Country.findOne(
            {"_id": countryCode},
            {"cities": false},
            async (err, country) => {
                res.set("Content-Type", "application/json");
                if (err)
                    res.status(404).send({status: err});
                else
                    res.status(200).send(country);
            }
        );
    }
);

// GET http://localhost:3100/world/api/v1/countries/TUR/cities
// curl -X GET "http://localhost:3100/world/api/v1/countries/TUR/cities"
api.get("/world/api/v1/countries/:country_code/cities", async (req, res) => {
        const countryCode = req.params.country_code;
        Country.findOne(
            {"_id": countryCode},
            {"_id": false, "cities": true},
            async (err, country) => {
                res.set("Content-Type", "application/json");
                if (err)
                    res.status(404).send({status: err});
                else
                    res.status(200).send(country.cities);
            }
        );
    }
);

// GET http://localhost:3100/world/api/v1/continents
// curl -X GET "http://localhost:3100/world/api/v1/continents"
api.get("/world/api/v1/continents", async (req, res) => {
    Country.distinct("continent",async (err, continents) => {
        res.set("Content-Type", "application/json");
        if (err)
            res.status(404).send({status: err});
        else
            res.status(200).send(continents);
    });
});

// GET http://localhost:3100/world/api/v1/employees?page=10&size=25
// curl -X GET "http://localhost:3100/world/api/v1/countries?page=0&size=10"
api.get("/world/api/v1/countries", async (req, res) => {
        const page = Number(req.query.page || 0);
        const size = Number(req.query.size || 20);
        const offset = page * size;
        Country.find(
            {},
            {"cities": false},
            {skip: offset, limit: size},
            async (err, countries) => {
                res.set("Content-Type", "application/json");
                if (err)
                    res.status(404).send({status: err});
                else
                    res.status(200).send(countries);
            }
        );
    }
);
//endregion
