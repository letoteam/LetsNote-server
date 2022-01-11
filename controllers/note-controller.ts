import { NextFunction, Response, Request } from "express";
import NoteService from "../service/note-service";
import {JSON} from "sequelize";

const noteService = new NoteService();
const {validationResult} = require('express-validator');
const ApiError = require('../exeptions/api-error');

class NoteController{
    async getUserNotes(req: Request, res: Response, next: NextFunction){
        const {refreshToken} = req.cookies;
        const notes = await noteService.getUserNotes(refreshToken);
        res.json(notes);
    }
}

export default NoteController;