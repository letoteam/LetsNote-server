const Router = require('express').Router;
// const userController = require('../controllers/user-controller')
import UserController from "../controllers/user-controller";

const userController = new UserController();
const router = new Router();
const {body} = require('express-validator');

router.post('/sign-up', 
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({min: 6, max: 32}),
    body('name').isLength({min: 3, max: 20}).trim().escape(),
    userController.registration
);
router.post('/login', userController.login);
router.post('/logout', userController.logout);

router.put('/recover/forgot-password', userController.forgotPassword);
router.put('/recover/reset-password',
    body('newPassword').isLength({min: 6, max: 32}),
    userController.resetPassword
);

router.get('/activate/:link', userController.activate);
router.get('/refresh', userController.refresh);
router.get('/users', userController.getUsers);

export default router;