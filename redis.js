const redis = require('redis')
const appConfig = require('./configs/app.config')

class redisClass {
    static client

    static connectClient = async () => {
        // this.client = redis.createClient({
        //     host: appConfig.redisHost,
        //     port: appConfig.redisPort,
        // })

        this.client = redis.createClient({ url: `redis://${appConfig.redisHost}` })

        this.client.on('error', async (error) => {
            console.log(error)
            await this.client.disconnect()
        })

        this.client.on('end', () => {
            console.log('Redis client disconnected')
            this.client = undefined
        })

        this.client.on('reconnecting', async () => {
            console.log('Reconnecting redis client')
            await this.client.disconnect()
            this.client = undefined
        })

        this.client.on('connect', () => console.log('Redis client connected'))

        this.client.on('ready', () => console.log('Redis client is ready'))

        await this.client.connect()
    }

    static getClient = () => {
        return this.client
    }
}

// const redisCache = async () => {
//     let client
//     client = redis.createClient({
//         host: '127.0.0.1',
//         port: 6379,
//     })

//     client.on('error', async (error) => {
//         console.log(error)
//         await client.disconnect()
//     })

//     client.on('end', () => {
//         console.log('Disconnected')
//         client = undefined
//     })

//     client.on('reconnecting', async () => {
//         console.log('Reconnecting')
//         await client.disconnect()
//         client = undefined
//     })

//     client.on('connect', () => console.log('Ok'))

//     client.on('ready', () => console.log('Ready'))

//     await client.connect()
// }

module.exports = {
    redisClass
}