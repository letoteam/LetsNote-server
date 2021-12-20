import bcrypt from 'bcrypt';
import { json } from 'stream/consumers';
import MailService from './mail-service';
import TokenService from './token-service';

const db = require('../models');
const UserModel = db.User;
const mailService = new MailService();
const tokenService = new TokenService();
const UserDto = require('../dtos/user-dto');
const uuid = require('uuid');
const ApiError = require('../exeptions/api-error');


class UserService{
    async registration(name: string, email: string,password: string){
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
}

export default UserService;