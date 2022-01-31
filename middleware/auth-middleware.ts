import {NextFunction, Request, Response} from "express";
import TokenService from "../service/token-service";
const ApiError = require('../exeptions/api-error');
const tokenService = new TokenService();

module.exports = function(req: Request,res: Response,next: NextFunction){
    try{
        const authorizationHeader = req.headers.authorization;
        if(!authorizationHeader) {
            throw ApiError.UnauthorizedError();
        }

        const accessToken = authorizationHeader.split(' ')[1];
        if(!accessToken){
            return next(ApiError.UnauthorizedError());
        }
        const userData = tokenService.validateAccessToken(accessToken);
        if(!userData){
            return next(ApiError.UnauthorizedError());
        }
        next();
    } catch(e){
        console.log(e);
        return next(ApiError.UnauthorizedError());
    }
}