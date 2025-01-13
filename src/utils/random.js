exports.generateNumber = (length) => {
    // return Math.floor(Math.random() * Math.pow(10, length));
    return this.generateNumberInRange(Math.pow(10, length - 1), Math.pow(10, length) - 1);
};

exports.generateNumberInRange = (start, end) => {
    const minInt = Math.ceil(start);
    const maxInt = Math.floor(end);
    return Math.floor(Math.random() * (maxInt - minInt + 1) + minInt);
};