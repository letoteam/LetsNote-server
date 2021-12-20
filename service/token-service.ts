const jwt = require('jsonwebtoken');
const db = require('../models');
const TokenModel = db.Token; 

class TokenService{
    generateTokens(payload: string){
        const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET,{expiresIn:'30m'});
        const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET,{expiresIn:'30d'});
        return{
            accessToken,
            refreshToken
        };
    }

    async saveToken(userId:number, refreshToken:string){
        const tokenData = await TokenModel.findOne({ where: {UserId: userId}});
        if(tokenData){
            tokenData.refreshToken = refreshToken;
            return await tokenData.save();// save?
        }
        const token = await TokenModel.create({UserId: userId, refreshToken});
        return token;
    }
}

export default TokenService;