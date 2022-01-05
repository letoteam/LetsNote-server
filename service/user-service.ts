import bcrypt from 'bcrypt';
import { json } from 'stream/consumers';
import MailService from './mail-service';
import TokenService from './token-service';
import {Response} from "express";

const db = require('../models');
const UserModel = db.User;
const mailService = new MailService();
const tokenService = new TokenService();
const UserDto = require('../dtos/user-dto');
const uuid = require('uuid');
const ApiError = require('../exeptions/api-error');


class UserService{
    async registration(name: string, email: string, password: string){
        const candidate = await UserModel.findOne({
            where: {email: email}
        });
        if(candidate){
            throw ApiError.BadRequest('User with email:' + email + 'is already exist');
        }
        const hashPassword = await bcrypt.hash(password,3);
        const activationLink = uuid.v4();
        const user = await UserModel.create({name, email, password: hashPassword, activationLink});
        await mailService.sendActivationMail(email, `${process.env.API_URL}/api/activate/${activationLink}`);
        const userDto = new UserDto(user);
        const tokens = tokenService.generateTokens({...userDto});
        await tokenService.saveToken(userDto.id, tokens.refreshToken);
        // const isActivated
        return {...tokens, user: userDto}
    }

    async activate(activationLink: string){
        const user = await UserModel.findOne({where: {activationLink}});
        if(!user) {
            throw ApiError.BadRequest('Incorrect activation link');
        }
        user.isActivated = true;
        await user.save();
    }

    async login(email: string, password: string) {
        const user = await UserModel.findOne({where: {email: email}});
        if (!user) {
            throw ApiError.BadRequest('User with this email does not exist')
        }
        const isPassEquals = await bcrypt.compare(password, user.password);
        if (!isPassEquals) {
            throw ApiError.BadRequest('Wrong password');
        }
        const userDto = new UserDto(user);
        const tokens = tokenService.generateTokens({...userDto});

        await tokenService.saveToken(userDto.id, tokens.refreshToken);
        return {...tokens, user: userDto}

    }

    async forgotPassword(email: string) {
        const user = await UserModel.findOne({where: {email: email}});
        if(!user) {
            throw ApiError.BadRequest('User with this email does not exist')
        }
        const userDto = new UserDto(user);
        const resetToken = tokenService.generateResetToken({...userDto});
        await mailService.sendRecoveryMail(user.email, `${process.env.CLIENT_URL}/forgot-password/reset-password/${resetToken}`);
        user.resetLink = resetToken;
        await user.save();
    }

    async resetPassword(resetLink: string, newPassword: string){
        const userData = tokenService.validateResetToken(resetLink);
        const user = await UserModel.findOne({where: {resetLink}})
        if(!userData || !user){
            throw ApiError.BadRequest('Incorrect link or it is expired')
        }
        const hashNewPassword = await bcrypt.hash(newPassword,3);
        user.password = hashNewPassword;
        user.resetLink = "";
        await user.save();
    }

    async logout(refreshToken: string) {
        const token = await tokenService.removeToken(refreshToken);
        return token;
    }

    async refresh(refreshToken: string) {
        if(!refreshToken){
            throw ApiError.UnauthorizedError();
        }
        const userData = tokenService.validateRefreshToken(refreshToken);
        const tokenFromDb = await tokenService.findToken(refreshToken);
        if(!userData || !tokenFromDb){
            throw ApiError.UnauthorizedError();
        }
        const user = await UserModel.findOne({where: {id: userData.id}})
        const userDto = new UserDto(user);
        const tokens = tokenService.generateTokens({...userDto});

        await tokenService.saveToken(userDto.id, tokens.refreshToken);
        return {...tokens, user: userDto}
    }
}


export default UserService;