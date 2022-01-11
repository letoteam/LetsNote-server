import TokenService from './token-service';
import {where} from "sequelize";

const db = require('../models');
const UserModel = db.User;
const NoteModel = db.Note;
const tokenService = new TokenService();
const ApiError = require('../exeptions/api-error');

class NoteService{
    async getUserNotes(refreshToken: string){
        if(!refreshToken){
            throw ApiError.UnauthorizedError();
        }
        const userData = tokenService.validateRefreshToken(refreshToken);
        const notes = await NoteModel.findAll({where: {UserId: userData.id}}); // [{},{},...]

        return notes;
    }
}


export default NoteService;