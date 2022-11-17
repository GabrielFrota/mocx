"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("express-async-errors");
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const Person_1 = __importDefault(require("./Person"));
const mongoose_1 = __importDefault(require("mongoose"));
const express_validator_1 = require("express-validator");
const console_stamp_1 = __importDefault(require("console-stamp"));
const port = 8080;
const app = (0, express_1.default)();
app.use((0, cors_1.default)({ origin: 'http://localhost:3000' }));
app.use(body_parser_1.default.urlencoded({ extended: false }));
app.use(body_parser_1.default.json());
const uri = 'mongodb+srv://mocx:mocx@cluster0.dqnkh6c.mongodb.net/?retryWrites=true&w=majority';
mongoose_1.default.connect(uri, { dbName: 'mocxdb', autoCreate: false });
app.listen(port, () => {
    console.log(`⚡️[server]: Server is running at https://localhost:${port}\n`);
    (0, console_stamp_1.default)(console);
});
const personURL = '/api/person';
const validateReq = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        res.status(400).send(errors);
        return;
    }
    next();
};
const documentNotFoundError = (id) => {
    throw {
        name: 'DocumentNotFoundError',
        message: id + ' does not exists in the database.'
    };
};
app.get(personURL + '/list', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const p = yield Person_1.default.find();
    res.status(200).send(p);
}));
app.get(personURL + '/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const p = yield Person_1.default.findById(req.params.id);
    if (p === null)
        documentNotFoundError(req.params.id);
    res.status(200).send(p);
}));
app.post(personURL + '/new', (0, express_validator_1.body)('cpf').exists(), (0, express_validator_1.body)('name').exists(), (0, express_validator_1.body)('birthdate').exists(), validateReq, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const p = yield Person_1.default.create({
        cpf: req.body.cpf,
        name: req.body.name,
        birthdate: req.body.birthdate
    });
    res.status(200).send(p);
}));
app.post(personURL + '/update', (0, express_validator_1.body)('_id').exists(), (0, express_validator_1.body)('cpf').exists(), (0, express_validator_1.body)('name').exists(), (0, express_validator_1.body)('birthdate').exists(), validateReq, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const p = yield Person_1.default.replaceOne({ _id: req.body._id }, {
        _id: req.body._id,
        cpf: req.body.cpf,
        name: req.body.name,
        birthdate: req.body.birthdate
    });
    if (p.matchedCount === 0)
        documentNotFoundError(req.body._id);
    res.status(200).send(Object.assign(Object.assign({}, p), { _id: req.body._id }));
}));
app.post(personURL + '/delete', (0, express_validator_1.body)('_id').exists(), validateReq, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const p = yield Person_1.default.deleteOne({ _id: req.body._id });
    if (p.deletedCount === 0)
        documentNotFoundError(req.body._id);
    res.status(200).send(Object.assign(Object.assign({}, p), { _id: req.body._id }));
}));
const handleError = (err, req, res, _) => {
    console.log(err);
    if (err instanceof mongoose_1.default.Error.ValidationError) {
        res.status(400).send(err.errors);
    }
    else if (err instanceof mongoose_1.default.Error.CastError) {
        res.status(400).send(err);
    }
    else if (err['code'] === 11000) {
        res.status(400).send(err);
    }
    else if (err.name === 'DocumentNotFoundError') {
        res.status(400).send(err);
    }
    else {
        res.status(500).send(err);
    }
};
app.use(handleError);
