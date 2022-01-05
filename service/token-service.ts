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
    validateAccessToken(token: string){
        try{
            const userData = jwt.verify(token, process.env["JWT_ACCESS_SECRET "]);
            return userData;
        }catch (e){
            return null;
        }
    }

    validateRefreshToken(token: string){
        try{
            const userData = jwt.verify(token, process.env["JWT_REFRESH_SECRET "]);
            return userData;
        }catch (e){
            return null;
        }
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

    async removeToken(refreshToken: string){
        const tokenData = await TokenModel.destroy({where: {refreshToken}});
        return tokenData;
    }

    async findToken(refreshToken: string){
        const tokenData = await TokenModel.findOne({where: {refreshToken}});
        return tokenData;
    }

    generateResetToken(payload: string){
        const resetToken = jwt.sign(payload, process.env.RESET_PASSWORD_KEY, {expiresIn: '20s'});
        return resetToken;
    }

    validateResetToken(resetToken: string){
        try{
            const userData = jwt.verify(resetToken, process.env.RESET_PASSWORD_KEY);
            return userData;
        }catch (e){
            return null;
        }
    }

}

export default TokenService;