const fs = require("fs");
const ffmpeg = require("fluent-ffmpeg");

//Compress only videos
const compressVideo = async (videoPath, name, extension) => {
    return new Promise((resolve, reject) => {
        try {
            return ffmpeg(videoPath)
                .fps(30)
                .addOptions(["-crf 40"])
                .on('error', () => reject(false))
                .on('end', () => resolve(true))
                .save(`./uploads/${name}${extension}`)
        }
        catch (error) {
            return false
        }
    })
}

//Compress only images
const compressImage = async (imagePath, name) => {
    return new Promise((resolve, reject) => {
        try {
            return ffmpeg(imagePath)
                .addOptions(["-q 30"])
                .on('error', () => reject(false))
                .on('end', () => resolve(true))
                .save(`./uploads/${name}.jpg`) //=>Maintain extension as jpg for low quality images & standardization
        }
        catch (error) {
            return false
        }
    })
}

module.exports = {
    compressVideo,
    compressImage
}