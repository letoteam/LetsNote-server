module.exports = class UserDto{
    email:string;
    id:number;
    isActivated:boolean;

    constructor(model: any){
        this.email = model.email;
        this.id = model.id;
        this.isActivated = model.isActivated;
    }
}