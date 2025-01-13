const ffmpeg = require('fluent-ffmpeg');
const appConfig = require('../../configs/app.config');
const util = require('util');
const ffprobe = util.promisify(ffmpeg.ffprobe);

ffmpeg.setFfmpegPath(appConfig.codec.ffmpeg);
ffmpeg.setFfprobePath(appConfig.codec.ffprobe);

exports.generateScreenshot = async (inputPath, durationInSec, suffix = '') => {
    if (!durationInSec) {
        durationInSec = 1;
    }
    return new Promise((resolve, reject) => {
        return ffmpeg()
            .input(inputPath)
            .seekInput(`00:${parseInt(durationInSec)}.000`)
            .outputOptions([`-frames`, `1`])
            .output(`${inputPath}_screenshot${suffix}.png`)
            .on('end', resolve)
            .on('error', reject)
            .run();
    });
};

exports.getVideoDuration = async (inputPath) => {
    const file = await ffprobe(inputPath);
    return file.format.duration;
};