const socketServer = require('socket.io');

let io;

exports.initSocket = (server) => {
    io = socketServer(server);

    io.on('connection', (socket) => {
        console.log('A user connected');
        socket.on('chat message', (msg) => {
            console.log('message: ' + msg);
            io.emit('chat message', msg);
        });
        socket.on('disconnect', () => {
            console.log('User disconnected');
        });
    });
}

exports.io = () => {
    if (!io) {
        throw new Error('Socket.io not initialized!');
    }
    return io;
}