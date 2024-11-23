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

  const content = req.method === 'POST'
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
  Entry.countDocuments()
    .then(result => {
      response.send(`<p>Phonebook has info for ${result} people</p><p>${currentDate}</p>`)
    })
})

app.get('/api/persons/:id', (request, response, next) => {
  Entry.findById(request.params.id)
    .then(entry => {
      if (entry) {
        response.json(entry)
      } else { //not found
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  Entry.findByIdAndDelete(request.params.id)
    .then(() => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
  const body = request.body

  // create the note
  const entry = new Entry({
    name: body.name,
    number: body.number
  })

  entry.save().then(savedEntry => {
    response.json(savedEntry)
  })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  const { name, number } = request.body

  Entry.findByIdAndUpdate(
    request.params.id,
    { name, number },
    { new: true, runValidators: true, context: 'query' })
    .then(updatedEntry => {
      if (updatedEntry) {
        response.json(updatedEntry)
      } else { // entry not found
        const error = new Error('Id not found')
        error.name = 'IdNotFound'
        throw error
      }
    })
    .catch(error => next(error))
})


const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  } else if (error.name === 'IdNotFound') {
    return response.status(404).json({ error: error.message })
  }

  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
