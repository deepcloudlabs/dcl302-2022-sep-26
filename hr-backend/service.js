require("./utils")

//region Kafka Producer
const {Kafka} = require("kafkajs");
const kafka = new Kafka({
    clientId: "hr-backend",
    brokers: ['localhost:9092']
});

const producer = kafka.producer();
producer.connect()
    .then(() => console.log("Connected to the kafka broker..."))
    .catch(console.error)

//endregion

//region Mongoose -- MongoDB Connection & Configuration
const mongoose = require("mongoose");
const mongodb_url = "mongodb://localhost:27017/hrdb";
const collection_name = "employees";
const mongo_opts = {
    "useNewUrlParser": true,
    "socketTimeoutMS": 0,
    "keepAlive": true,
    "useUnifiedTopology": true
};

mongoose.connect(mongodb_url, mongo_opts);
//endregion

//region Mongoose -- Employee Schema
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
        default: AppConfig.NO_IMAGE_RAW
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

//region Express.js Configuration
const port = 8100;
const express = require("express");
const bodyParser = require("body-parser");
const logger = require("morgan");

const api = express();
api.use(bodyParser.json({limit: "5mb"}))
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

//region Swagger UI Configuration
// rest api documentation
// https://www.w3.org/Submission/wadl/
// https://raml.org/
// https://swagger.io/tools/swagger-ui/
// https://www.openapis.org/

const swaggerUi = require("swagger-ui-express");
const openApiDoc = require("./swagger-hr.json");
api.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openApiDoc));

//endregion

//region REST on http - Query
api.get("/hr/api/v1/employees/:identity", async (req, res) => {
        const identity = req.params.identity;
        Employee.findOne(
            {"identityNo": identity},
            {"_id": false},
            async (err, emp) => {
                res.set("Content-Type", "application/json");
                if (err)
                    res.status(404).send({status: err});
                else
                    res.status(200).send(emp);
            }
        );
    }
);

api.get("/hr/api/v1/employees/:identity/photo", async (req, res) => {
        const identity = req.params.identity;
        Employee.findOne(
            {"identityNo": identity},
            {"_id": false, "photo": true},
            async (err, emp) => {
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
api.get("/hr/api/v1/employees", async (req, res) => {
        const page = Number(req.query.page || 0);
        const size = Number(req.query.size || 20);
        const offset = page * size;
        Employee.find(
            {},
            {"_id": false},
            {skip: offset, limit: size},
            async (err, employees) => {
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

//region REST on http - Command
// 1. Resource-oriented API: Employee <- resource
// ✔ Hire employee -> POST Employee
// ✔ Fire employee -> DELETE tcKimlikNo -> Employee
// ✔ Get info about employee(s) -> GET tcKimlikNo
// ✔ Update employee's salary/iban/department/photo/fulltime -> PUT/PATCH
//     i. supports both PUT and PATCH
//    ii. ✘ identityNo, ✘ birthYear
//        ✔ salary, ✔ fullname, ✔ department, ✔ fulltime, ✔ iban, ✔ photo

const updatableFields = ["salary", "fullname", "department", "fulltime", "iban", "photo"];

async function putOrPatchEmployee(req, res) {
    const emp = req.body;
    const identity = emp.identityNo;
    let updatedEmp = {};
    for (let field in emp) {
        if (updatableFields.includes(field))
            updatedEmp[field] = emp[field];
    }
    Employee.findOneAndUpdate(
        {"identityNo": identity},
        {"$set": updatedEmp},
        {upsert: false},
        (err, document) => {
            res.set("Content-Type", "application/json");
            if (err) {
                res.status(400).send({status: err});
            } else {
                res.status(200).send({...document._doc, ...updatedEmp});
            }
        }
    );
}

api.put("/hr/api/v1/employees/:identity", putOrPatchEmployee);
api.patch("/hr/api/v1/employees/:identity", putOrPatchEmployee);


api.post("/hr/api/v1/employees", async (req, res) => {
        const emp = req.body;
        emp._id = emp.identityNo;
        let employee = new Employee(emp);
        employee.save((err, hiredEmployee) => {
                res.set("Content-Type", "application/json");
                if (err) {
                    res.status(400).send({status: err});
                } else {
                    // Employee is hired!
                    let payload = {
                        "topic": "hr",
                        "messages": [
                            {"key": "hr", value: JSON.stringify({type: "hire", data: hiredEmployee})}
                        ]
                    }
                    producer.send(payload);
                    sessions.forEach(session => session.emit('hire', hiredEmployee));
                    res.status(200).send(hiredEmployee);
                }
            }
        );
    }
)

api.delete("/hr/api/v1/employees/:identity", async (req, res) => {
        const identity = req.params.identity;
        Employee.findOneAndDelete(
            {"identityNo": identity},
            {projection: {"_id": false, "photo": false}},
            (err, firedEmployee) => {
                res.set("Content-Type", "application/json");
                if (err) {
                    res.status(404).send({status: err});
                } else {
                    // Employee is fired!
                    let payload = {
                        "topic": "hr",
                        "messages": [
                            {"key": "hr", value: JSON.stringify({type: "fire", data: firedEmployee})}
                        ]
                    }
                    producer.send(payload);
                    sessions.forEach(session => session.emit('fire', firedEmployee));
                    res.status(200).send(firedEmployee);
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

//region REST on ws
// ws://localhost:8100
let sessions = [];
const socketIo = require("socket.io");
const io = socketIo(server, {
    "cors": {
        "origins": "*",
        "methods": ["GET", "POST"]
    }
});
io.on('connection', (session) => {
    console.log(`A new connection is open for session (${session.id})`);
    sessions.push(session);
    io.on('disconnect', () => {
        console.log(`The session (${session.id}) is closes.`);
        sessions = sessions.filter(_session => _session.id !== session.id);
    });
});
//endregion
