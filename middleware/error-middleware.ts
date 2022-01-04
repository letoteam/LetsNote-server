import { NextFunction, Request, Response } from "express";
const ApiError = require('../exeptions/api-error');

module.exports = function(err: any, req: Request, res: Response, next: NextFunction){
    // console.log('Err: '+ err)
    console.log(err.errors)
    if(err instanceof ApiError){
        return res.status(err.status).json({message: err.message, errors: err.errors})
    }
    return res.status(500).json({message: 'Some server error'})
}