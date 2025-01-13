// eslint-disable-next-line no-unused-vars
module.exports = (err, req, res, next) => {
    console.log(err.body);
    res.header(err.headers);
    res.status(err.statusCode);
    res.send(err.body);
};