require('dotenv').config()
const express = require('express')      
const Record = require("./Record")
const app = express()

const requestLogger = (request, response, next) => {
    console.log('Method: ', request.method)
    console.log('Path: ', request.path)
    console.log('Body: ', request.body)
    console.log('----------------')
    next()
}

const errorHandler = (error, request, response, next) => {
    console.log(error.name + ": " + error.message)
    
    if (error.name === "CastError")
    {
        response.status(400).send({error: "Malformatted ID"}).end()
        return
    }

    if (error.name === "MongoServerError")
    {
        response.status(400).send({error: "Duplicate Value"}).end()
        return
    }
    next()
}

const unknownEndpoint = (request, response) => {
  response.status(404).send({error: 'unknown endpoint'})
}

app.use(express.json())

app.use(requestLogger)

app.get('/', (request, response, next) => {
    Record.find({})
        .then(allNote => {
            console.log(allNote)
            response.send(allNote)
        }
        )
        .catch(error => {
            next(error)
        })
})

app.get('/api/records/:id', (request, response, next) => {
    Record.find({_id: request.params.id}).then(requestedValue => {
        if(requestedValue.length === 0)
        {
            response.status(404).end()
            return
        }
        console.log(requestedValue)
        response.send(requestedValue)
    }).catch(error => {
        next(error)
    })
})

app.post('/api/records', (request, response, next) => {

    const record = new Record({
        name: request.body.name,
        number: request.body.number,
        important: request.body.important
    })

    record.save()
        .then(savedRecord => {
            console.log(savedRecord)
            response.send(savedRecord)
            })
        .catch(error=> {
            next(error)
            })
})

app.put('/api/records/', async (request, response, next) => {
    try
    {
        const result = await Record.findOneAndUpdate({name : request.body.name}, request.body, {new: true, runValidators: true})
        if (!result)
        {
            response.status(404).send({message: "Person does not exist in Phonebook to update."})
            return
        }
        console.log(result)
        response.status(200).send({message: "The update has been successfully made in database with given name."})
    }
    catch(error)
    {
        next(error)
    }       
})

app.put('/api/records/:id', async (request, response, next) => {
    try
    {
        const result = await Record.findByIdAndUpdate(request.params.id, request.body, {new: true, runValidators: true})
        if (!result)
        {
            response.status(404).send({message: "Person does not exist in Phonebook to update."})
            return
        }
        console.log(result)
        response.status(200).send({message: "The update has been successfully made in database with given name."})
    }
    catch(error)
    {
        next(error)
    }       
})

app.delete('/api/records/:id', (request, response, next) => {
    Record.findByIdAndDelete(request.params.id)
        .then(result => {
            console.log("deleted")
            response.status(204).end()
            })
        .catch(error => {
            next(error)
            })
})

app.use(errorHandler)

app.use(unknownEndpoint)

const port = process.env.PORT

app.listen(port, () => {
    console.log(`Listening on port ${port}`)
})