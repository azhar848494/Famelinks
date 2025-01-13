const mongoose = require('mongoose');
const appConfig = require('../../configs/app.config');

exports.connect = async () => {
    try {
        await mongoose.connect(appConfig.dbUrl, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Database Connected');
    } catch (error) {
        console.log('Database Connection Error :: ', error);
    }
};
