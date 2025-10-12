const mongoose = require('mongoose')
const {DB_NAME} = require('../constants')

const main = async()=>{
    try {
        const initilizeConnection = await mongoose.connect(`${process.env.DATABASE_URI}/${DB_NAME}`)
    } catch (error) {
        console.log("DataBase Error:"+error)
        process.exit(1)
    }
}

module.exports = main;