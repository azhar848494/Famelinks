module.exports = (schema) => {
    schema.add({
        isDeleted: {
            type: Boolean,
            required: true,
            default: false,
        },
        deletedAt: {
            type: Date,
            default: null,
        },
    });

    schema.pre('find', function () {
        this.where({ isDeleted: false });
    });

    schema.pre('findOne', function () {
        this.where({ isDeleted: false });
    });

    ///Pre middleware execute at first
    schema.pre('aggregate', function (next) {
        ///Use case
        ///User.aggregate().match({ name: { $exists: false } }).option({ ignoreSoftDelete: true });
        if (this.options.ignoreSoftDelete) {
            return next();
        }
        this.pipeline().unshift({ $match: { isDeleted: false } });
        next();
    });

    ///Post middleware execute at last
    // softDeleteSchema.post('aggregate', function (document, next) {
    //     next();
    // });
    return schema;
};