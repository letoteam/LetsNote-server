module.exports = class ApiError extends Error{
    status;
    errors: any;

    constructor(status: number, messege: string, errors=[]){
        super(messege);
        this.status = status;
        this.errors = errors;
    }

    static UnauthorizedError(){
        return new ApiError(401,'User is not authorized')
    }
    
    static BadRequest(messege: string, errors=[]){
        return new ApiError(400, messege, errors);
    }

    static NoPermission(messege: string, errors=[]){
        return new ApiError(403,messege)
    }
}