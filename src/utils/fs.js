const fs = require('fs/promises');

exports.unlink = (path) => {
    return fs.unlink(path);
};

exports.stat = (path) => {
    return fs.stat(path);
};