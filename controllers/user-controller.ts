import { NextFunction, Response, Request } from "express";
import UserService from "../service/user-service";

const userService = new UserService();
const {validationResult} = require('express-validator');
const ApiError = require('../exeptions/api-error');

export class UserController{
  async registration(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);
      console.log(Array.isArray(errors));  
      if(!errors.isEmpty()){
        return next(ApiError.BadRequest('Validation error', errors.array()));
      }
      const {name, email, password} = req.body;
      const userData = await userService.registration(name,email,password);
      res.cookie('refreshToken', userData.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true})
      res.json(userData);
    } catch (e) {
      next(e);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      
    } catch (e) {
      next(e);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      
    } catch (e) {
      next(e);
    }
  }

  async activate(req: Request, res: Response, next: NextFunction) {
    try {
      const activationLink = req.params.link;
      await userService.activate(activationLink);
      return res.redirect(process.env.CLIENT_URL || 'http://localhost:3000');
    } catch (e) {
      next(e);
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      
    } catch (e) {
      next(e);
    }
  }

  async getUsers(req: Request, res: Response, next: NextFunction) {
    try {
      res.json(['123','123']);
    } catch (e) {
      next(e);
    }
  }

}

export default UserController;