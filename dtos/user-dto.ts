module.exports = class UserDto {
  email: string;
  id: number;
  isActivated: boolean;
  name: string;

  constructor(model: any) {
    this.email = model.email;
    this.id = model.id;
    this.name = model.name;
    this.isActivated = model.isActivated;
  }
};
