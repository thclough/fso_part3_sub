const mongoose = require('mongoose')

var mode = null
var pastName = null
var pastNumber = null

if (process.argv.length<3) {
    console.log('give password as argument')
    process.exit(1)
} else if (process.argv.length == 3) {
    mode = "read"
} else if (process.argv.length !== 5) {
    console.log('provide both a name and number if providing input')
    process.exit(1)
} else {
    passedName = process.argv[3]
    passedNumber = process.argv[4]
    mode = "write"
}

const password = process.argv[2]
const url = `mongodb+srv://master:${password}@cluster0.bpjp5.mongodb.net/phoneBook?retryWrites=true&w=majority&appName=Cluster0`

mongoose.set('strictQuery', false)
mongoose.connect(url)

const entrySchema = new mongoose.Schema({
    name: String,
    number: String,
})

const Entry = mongoose.model('Entry', entrySchema)

if (mode === "write") {
    const entry = new Entry({
        name: passedName,
        number: passedNumber
    })
    
    entry.save().then(result => {
        console.log('entry saved!')
        mongoose.connection.close()
    })
} else if (mode === "read") {
    console.log("phonebook:")
    Entry.find({}).then(result => {
        result.forEach(entry => {
            console.log(`${entry.name} ${entry.number}`)
        })
        mongoose.connection.close()
    })
} else {
    mongoose.connection.close()
}


