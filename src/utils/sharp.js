const sharp = require('sharp');

exports.resize = (imagePath, key) => {
    return [{
        Key: `${key}`,
        Body: sharp(imagePath),
        isOriginal: true
    },
    // {
    //     Key: `${key}-xlg`,
    //     Body: sharp(imagePath).resize(1200),
    //     isOriginal: false
    // },
    // {
    //     Key: `${key}-lg`,
    //     Body: sharp(imagePath).resize(800),
    //     isOriginal: false
    // },
    // {
    //     Key: `${key}-md`,
    //     Body: sharp(imagePath).resize(500),
    //     isOriginal: false
    // },
    // {
    //     Key: `${key}-sm`,
    //     Body: sharp(imagePath).resize(300),
    //     isOriginal: false
    // },
    {
        Key: `${key}-xs`,
        Body: sharp(imagePath).resize(100),
        isOriginal: false
    }];
};