import { NextFunction, Response, Request } from "express";
import NoteService from "../service/note-service";
import {JSON} from "sequelize";
import TokenService from "../service/token-service";

const noteService = new NoteService();
const tokenService = new TokenService();
const {validationResult} = require('express-validator');
const ApiError = require('../exeptions/api-error');

class NoteController{
    async getAllNotes(req: Request, res: Response, next: NextFunction){
        try{
            const {refreshToken} = req.cookies;
            const notes = await noteService.getAllNotes(refreshToken);
            res.json(notes);
        }catch (e) {
            next(e);
        }
    }

    async createNote(req: Request, res: Response, next: NextFunction){
        try{
            const errors = validationResult(req);
            if(!errors.isEmpty()){
                return next(ApiError.BadRequest('Validation error', errors.array()));
            }
            const { title, content, isPrivate, labels } = req.body;
            const authorizationHeader = req.headers.authorization;
            const accessToken = authorizationHeader?.split(' ')[1];
            if(!accessToken){
                return next(ApiError.UnauthorizedError());
            }
            const noteData = await noteService.createNote(title, content, isPrivate, accessToken, labels);
            res.json(noteData);
        }catch (e) {
            next(e)
        }
    }

    async getNote(req: Request, res: Response, next: NextFunction){
        try{
            const noteId = Number(req.params.noteId.split(':')[1]);
            if(!noteId) throw ApiError.BadRequest('note ID is undefined');
            const authorizationHeader = req.headers.authorization;
            const accessToken = authorizationHeader?.split(' ')[1];
            if(!accessToken){
                return next(ApiError.UnauthorizedError());
            }
            const noteData = await noteService.getNoteById(noteId, accessToken);
            res.json(noteData);
        }catch (e) {
            next(e)
        }
    }

    async updateNote(req: Request, res: Response, next: NextFunction){
        try{
            const errors = validationResult(req);
            if(!errors.isEmpty()){
                return next(ApiError.BadRequest('Validation error', errors.array()));
            }
            const { noteId, title, content, isPrivate, labels } = req.body;
            const authorizationHeader = req.headers.authorization;
            const accessToken = authorizationHeader?.split(' ')[1];
            if(!accessToken){
                return next(ApiError.UnauthorizedError());
            }
            const noteData = await noteService.updateNote(noteId, title, content, isPrivate, accessToken, labels);

            res.json(noteData);
        }catch (e) {
            next(e)
        }
    }

    async deleteNote(req: Request, res: Response, next: NextFunction){
        try{
            const noteId = Number(req.params.noteId.split(':')[1]);
            if(!noteId) throw ApiError.BadRequest('note ID is undefined');
            const authorizationHeader = req.headers.authorization;
            const accessToken = authorizationHeader?.split(' ')[1];
            if(!accessToken){
                return next(ApiError.UnauthorizedError());
            }

            await noteService.deleteNote(accessToken, noteId);

            res.json('Note has been deleted');
        }catch (e) {
            next(e)
        }
    }
}

export default NoteController;