const express = require('express')
const app = express()
var morgan = require('morgan')

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

let entries = [
    { 
      "id": "1",
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": "2",
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": "3",
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": "4",
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]


app.get('/api/persons', (request, response) => {
    response.json(entries)
  })

app.get('/info', (request, response) => {
    const currentDate = new Date()

    response.send(`<p>Phonebook has info for ${entries.length} people</p><p>${currentDate}</p>`)
})

app.get('/api/persons/:id', (request, response) => {
    const id = request.params.id
    const entry = entries.find(entry => entry.id === id)

    if (entry) {
        response.json(entry)
    } else {
        response.status(404).end()
    }
})

app.delete('/api/persons/:id', (request, response) => {
    const id = request.params.id

    entries = entries.filter(entry => entry.id !== id)

    response.status(204).end()
})


function getRandomIntInclusive(min, max) {
    const minCeiled = Math.ceil(min);
    const maxFloored = Math.floor(max);
    return Math.floor(Math.random() * (maxFloored - minCeiled + 1) + minCeiled); // The maximum is inclusive and the minimum is inclusive
  }

const generateId = () => {
    return String(getRandomIntInclusive(0,100000))
}

app.post('/api/persons', (request, response) => {
    const body = request.body

    // validate the content
    if (!body.name)  {
        return response.status(400).json({
            error: 'name missing'
        })
    }

    const match = entries.find(entry => entry.name == body.name)

    if (match) {
        return response.status(400).json({
            error: `${body.name} already in phonebook`
        })
    }

    if (!body.number) {
        return response.status(400).json({
            error: 'number missing'
        })
    }

    // create the note
    const entry = {
        name: body.name,
        number: body.number,
        id: generateId()
    }

    entries = entries.concat(entry)

    response.json(entry)
})


const PORT = 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
  