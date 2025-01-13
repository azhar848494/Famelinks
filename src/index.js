const path = require('path');

///Environment setup
const env = require('dotenv');
env.config({ path: path.resolve(__dirname, '../.env') });

//MongoDB setup
const connection = require("./utils/connection");
connection.connect();

const express = require('express');
const app = express();

// const socket = require('./socket/v3'); //=> uncomment this for jobchat feature
// const { redisClass } = require('./../redis')
// redisClass.connectClient()
//     .then(() => { })
//     .catch((error) => console.log('Error while connecting redis server:-' + error))

//Setup socket server
// const socket = require('./socket');
const http = require('http');
const server = http.createServer(app);
// socket(server);

// //Setup socket
// const socketIO = require("./utils/socket");
// socketIO.initSocket(server);

// socketIO.io().on('connection', (socket) => {
//     console.log('A user connected');
// });

//Setup logger
const logger = require('morgan');
app.use(logger('dev'));

//Setup middleware
app.use(express.static(path.join('uploads')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Setup routes
const router = require('./routes');
router.get('/', (req, res) => res.json('status : 200'));
app.use(router);

//Notfound callback
const serializeHttpResponse = require('./helpers/serialize-http-response');
app.use((req, res, next) => {
    return next(serializeHttpResponse(404, {
        message: 'Not Found'
    }));
});

//Error callback
const errorCallback = require('./helpers/error-callback');
app.use(errorCallback);

//Server Listen
const appConfig = require('../configs/app.config');
server.listen(appConfig.port, appConfig.host, () => {
    console.log(`Server listening on https://${appConfig.host}:${appConfig.port}`);
});