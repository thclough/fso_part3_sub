require('dotenv').config()
const express = require('express')
const app = express()
var morgan = require('morgan')
const cors = require('cors')
const Entry = require('./models/entry')

app.use(express.static('dist'))
app.use(cors())
app.use(express.json())

const mg = morgan(function (tokens, req, res) {
    
    const content = req.method == 'POST' 
        ? JSON.stringify(req.body)
        : null

    return [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, 'content-length'), '-',
      tokens['response-time'](req, res), 'ms',
      content
    ].join(' ')
  })

app.use(mg)


app.get('/api/persons', (request, response) => {
    Entry.find({}).then(entries =>
        response.json(entries)
    )
  })

app.get('/info', (request, response) => {
    const currentDate = new Date()

    response.send(`<p>Phonebook has info for ${entries.length} people</p><p>${currentDate}</p>`)
})

app.get('/api/persons/:id', (request, response, next) => {
    Entry.findById(request.params.id)
        .then(entry => {
        if (entry) {
            response.json(entry)
        } else {
            response.status(404).end()
        }
        })
        .catch(error => next(error))
    })

app.delete('/api/persons/:id', (request, response, next) => {
    Entry.findByIdAndDelete(request.params.id)
        .then(result => {
            response.status(204).end()
        })
        .catch(error => next(error))
})

app.post('/api/persons', (request, response) => {
    const body = request.body

    // validate the content
    if (body.name === undefined)  {
        return response.status(400).json({
            error: 'name missing'
        })
    }

    // something to check if already in phonebook
    // const match = entries.find(entry => entry.name == body.name)

    // if (match) {
    //     return response.status(400).json({
    //         error: `${body.name} already in phonebook`
    //     })
    // } enforce uniqueness in the database of names?

    if (body.number === undefined) {
        return response.status(400).json({
            error: 'number missing'
        })
    }

    // create the note
    const entry = new Entry({
        name: body.name,
        number: body.number
    })

    entry.save().then(savedEntry => {
        response.json(savedEntry)
    })
})

app.put('/api/persons/:id', (request, response, next) => {
    const body = request.body

    if (!body.name) {
        return response.status(400).json({
            error: 'name missing'
        })
    }

    if (body.number === null) {
        return response.status(400).json({
            error: 'number missing'
        })
    }

    const entry = {
        name: body.name,
        number: body.number
    }

    Entry.findByIdAndUpdate(request.params.id, entry, { new: true })
        .then(updatedEntry => {
            if (updatedEntry) {
                response.json(updatedEntry)
            } else {
                response.status(404).end()
            }
        })
        .catch(error => next(error))
})


const errorHandler = (error, request, response, next) => {
    console.error(error.message)

    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id'})
    }
}

app.use(errorHandler)


const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
  