import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import db from './models';
import router from './router';
// const router = require('./router/index')

require('dotenv').config();

const PORT = process.env.PORT || 5000;
const app = express();
const errorMiddleware = require('./middleware/error-middleware');

app.use(express.json());
app.use(cookieParser());
app.use(cors());
app.use('/api', router);
app.use(errorMiddleware);

const start = async() => {
    try {
        app.listen(5000,()=>console.log('Server started on port: ' + PORT))
    } catch (e) {
        console.log(e);
    }
}

// db.sequelize.sync({force: true}).then(start());
start();
