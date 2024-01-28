require('dotenv').config()
const mongoose = require('mongoose')

mongoose.set('strictQuery', false)

mongoose.connect(process.env.MONGODB_URL)
    .then(result => {
        console.log("Connected to MongoDB")
    })
    .catch(error => {
        console.log("ERROR:", error)
    })

const recordSchema = new mongoose.Schema({
    name: {
        type: String,
        unique: true
        },
    number: {
        type: String,
        unique: true
    },
    important: Boolean
})

recordSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        delete returnedObject._id
        delete returnedObject.__v
    }
})

recordSchema.set('toObject', {
    transform: (document, returnedObject) => {
        returnedObject._id = returnedObject._id.toString()
        delete returnedObject.__v
    }
})

const Record = new mongoose.model('Record', recordSchema)

module.exports = Record