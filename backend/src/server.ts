require("express-async-errors");
import express, {NextFunction} from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { Request, Response } from 'express';
import Person from "./Person";
import mongoose from 'mongoose';
import {body, validationResult} from "express-validator";

const port = 8080;
const app = express();
app.use(cors({origin: 'http://localhost:3000'}));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const uri = 'mongodb+srv://mocx:mocx@cluster0.dqnkh6c.mongodb.net/?retryWrites=true&w=majority';
mongoose.connect(uri, { dbName: 'mocxdb', autoCreate: false });

app.listen(port, () => {
    console.log(`⚡️[server]: Server is running at https://localhost:${port}\n`);
    require('console-stamp')(console);
});

const personURL = '/api/person';

const validateReq = (req: Request, res: Response, next: NextFunction): void => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).send(errors);
        return;
    }
    next();
}

const documentNotFoundError = (id: string) => {
    throw {
        name: 'DocumentNotFoundError',
        message: id + ' does not exists in the database.'
    };
}

app.get(personURL + '/list', async (req, res) => {
    const p = await Person.find();
    res.status(200).send(p);
});

app.get(personURL + '/:id', async (req, res) => {
    const p = await Person.findById(req.params.id);
    if (p === null)
        documentNotFoundError(req.params.id);
    res.status(200).send(p);
});

app.post(personURL + '/new',
    body('cpf').exists(),
    body('name').exists(),
    body('birthdate').exists(),
    validateReq,
    async (req: Request, res: Response) => {
        const p = await Person.create({
            cpf: req.body.cpf,
            name: req.body.name,
            birthdate: req.body.birthdate
        });
        res.status(200).send(p);
    }
);

app.post(personURL + '/update',
    body('_id').exists(),
    body('cpf').exists(),
    body('name').exists(),
    body('birthdate').exists(),
    validateReq,
    async (req: Request, res: Response) => {
        const p = await Person.replaceOne({_id: req.body._id}, {
            _id: req.body._id,
            cpf: req.body.cpf,
            name: req.body.name,
            birthdate: req.body.birthdate
        });
        if (p.matchedCount === 0)
            documentNotFoundError(req.body._id);
        res.status(200).send(p);
});

app.post(personURL + '/delete',
    body('_id').exists(),
    validateReq,
    async (req: Request, res: Response) => {
        const p = await Person.deleteOne({_id: req.body._id});
        if (p.deletedCount === 0)
            documentNotFoundError(req.body._id);
        res.status(200).send({...p, _id: req.body._id});
});

const handleError: express.ErrorRequestHandler = (err, req, res, _) => {
    console.log(err);
    if (err instanceof mongoose.Error.ValidationError) {
        res.status(400).send(err.errors);
    }
    else if (err instanceof mongoose.Error.CastError) {
        res.status(400).send(err);
    }
    else if ((err as any)['code'] === 11000) {
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