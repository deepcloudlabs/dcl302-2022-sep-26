require("./utils")
//region mongoose and mongodb
const mongoose = require("mongoose");
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
    },
    "fulltime": {
        type: Boolean,
        required: false,
        default: true
    },
    "department": {
        type: String,
        enum: ["Sales", "Finance", "IT", "HR"],
        required: false,
        default: "Sales"
    },
    "version": {
        type: String,
        required: false,
        default: "1.2.0"
    }
});

// Model -> Employee
const Employee = mongoose.model(collection_name, employeeSchema);
//endregion

//region express configuration
const port = 8100;
const express = require("express");
const bodyParser = require("body-parser");
const logger = require("morgan");

const api = express();
api.use(bodyParser.json({limit: "5mb"}))
api.use(logger('dev'));
api.listen(port);
console.log(`Server is listening the port ${port}`);
//endregion

//region swagger-ui configuration
// rest api documentation
// https://www.w3.org/Submission/wadl/
// https://raml.org/
// https://swagger.io/tools/swagger-ui/
// https://www.openapis.org/

const swaggerUi = require("swagger-ui-express");
const openApiDoc = require("./swagger-hr.json");
api.use("/api-docs",swaggerUi.serve, swaggerUi.setup(openApiDoc));

//endregion

//region http get endpoints
api.get("/hr/api/v1/employees/:identity",async (req,res) =>
    {
        const identity = req.params.identity;
        Employee.findOne(
            {"identityNo": identity},
            {"_id": false, "photo": false},
            async (err,emp) => {
                res.set("Content-Type", "application/json");
                if (err)
                    res.status(404).send({status: err});
                else
                    res.status(200).send(emp);
            }
        );
    }
);

api.get("/hr/api/v1/employees/:identity/photo",async (req,res) =>
    {
        const identity = req.params.identity;
        Employee.findOne(
            {"identityNo": identity},
            {"_id": false, "photo": true},
            async (err,emp) => {
                res.set("Content-Type", "application/json");
                if (err)
                    res.status(404).send({status: err});
                else
                    res.status(200).send(emp);
            }
        );
    }
);

// GET http://localhost:8100/hr/api/v1/employees?page=10&size=25
api.get("/hr/api/v1/employees",async (req,res) =>
    {
        const page = Number(req.query.page || 0);
        const size = Number(req.query.size || 20);
        const offset = page * size;
        Employee.find(
            {},
            {"_id": false, "photo": false},
            {skip: offset, limit: size},
            async (err,employees) => {
                res.set("Content-Type", "application/json");
                if (err)
                    res.status(404).send({status: err});
                else
                    res.status(200).send(employees);
            }
        );
    }
);

//endregion

//region REST on http API
// 1. Resource-oriented API: Employee <- resource
// ✘ Hire employee -> POST Employee
// ✘ Fire employee -> DELETE tcKimlikNo -> Employee
// ✔ Get info about employee(s) -> GET tcKimlikNo
// ✘ Update employee's salary/iban/department/photo/fulltime -> PUT/PATCH
api.post("/hr/api/v1/employees", async (req,res)=>
    {
        const emp = req.body;
        emp._id = emp.identityNo;
        let employee = new Employee(emp);
        employee.save((err,hiredEmployee)=>
            {
               res.set("Content-Type","application/json");
               if (err){
                   res.status(400).send({status: err});
               } else {
                   res.status(200).send(hiredEmployee);
               }
            }
        );
    }
)
// https://www.cncf.io/projects/
// 2. RPC Style API: gRpc (https://grpc.io)
    // Protocol Buffers (https://developers.google.com/protocol-buffers)

// 3. GraphQL (https://graphql.org)

//endregion

//region REST on ws API

//endregion
