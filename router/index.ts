const Router = require('express').Router;
// const userController = require('../controllers/user-controller')
import UserController from "../controllers/user-controller";
import NoteController from "../controllers/note-controller";

const userController = new UserController();
const noteController = new NoteController();
const router = new Router();
const {body} = require('express-validator');
const authMiddleware = require('../middleware/auth-middleware');

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

router.get('/notes', authMiddleware, noteController.getAllNotes);
router.get('/labels', authMiddleware, noteController.getAllLabels);
router.post('/create-note',
    authMiddleware,
    body('title').trim().isLength({min:1, max: 80}),
    body('content').trim(),
    noteController.createNote);
router.get('/notes/:noteId', authMiddleware, noteController.getNote);
router.put('/update-note',
    authMiddleware,
    body('title').trim().isLength({min:1, max: 80}),
    body('content').trim(),
    noteController.updateNote);
router.put('/toggle-privacy', authMiddleware, noteController.toggleNotePrivacy);
router.delete('/delete-note/:noteId', authMiddleware, noteController.deleteNote)
export default router;