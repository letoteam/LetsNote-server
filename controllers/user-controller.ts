import { NextFunction, Response, Request } from "express";
import UserService from "../service/user-service";
import tokenService from "../service/token-service";

const userService = new UserService();
const {validationResult} = require('express-validator');
const ApiError = require('../exeptions/api-error');

export class UserController{
  async registration(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);
      // console.log(Array.isArray(errors));
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
      const { email, password } = req.body;
      const userData = await userService.login(email, password)

      res.cookie('refreshToken', userData.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true})
      res.json(userData);
    } catch (e) {
      next(e);
    }
  }

  async forgotPassword(req: Request, res: Response, next: NextFunction){
    try{
      const {email} = req.body;
      await userService.forgotPassword(email);
      res.json({message: 'Email has been sent'});
    } catch (e){
      next(e)
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction){
    try{
      const {resetLink, newPassword} = req.body;
      await userService.resetPassword(resetLink, newPassword);
      res.json({message: 'Your password has been changed'});
    }catch (e) {
      next(e)
    }
  }
  // async setNewPassword(req: Request, res: Response, next: NextFunction) {
  //   try{
  //     const recoveryLink = req.params.link;
  //     const userPassword = req.body.password;
  //     await userService.setNewPassword(recovery-link);
  //     res.redirect()
  //     res.redirect(`${process.env.CLIENT_URL}/login` || 'http://localhost:3000/login')
  //   }
  //    catch(e){
  //     next(e);
  //   }
  // }


  async logout(req: Request, res: Response, next: NextFunction) {
    try {
        const {refreshToken} = req.cookies;
        const token = await userService.logout(refreshToken);
        res.clearCookie('refreshToken');
        return res.json(token);
    } catch (e) {
      next(e);
    }
  }

  async activate(req: Request, res: Response, next: NextFunction) {
    try {
      const activationLink = req.params.link;
      await userService.activate(activationLink);
      return res.redirect(`${process.env.CLIENT_URL}/app` || 'http://localhost:3000/app');
    } catch (e) {
      next(e);
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.cookies;
      const userData = await userService.refresh(refreshToken)
      res.cookie('refreshToken', userData.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true})

      return res.json(userData);
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