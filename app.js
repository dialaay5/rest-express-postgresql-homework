// index.js
const express = require('express')
const router = express.Router()
const path = require('path')
const url = require('url')
const cors = require('cors')
const { response } = require('express')
const knex = require('knex')
const config = require('config')


const connectedKnex = knex({
    client: 'pg',
    version: config.db.version,
    connection: {
        host: config.db.host,
        user: config.db.user,
        password: config.db.password,
        database: config.db.database
    }
})


const port = 8080;

const app = express()

// to use body parameters
app.use(express.json())
app.use(express.urlencoded({
    extended: true
}))

app.use(express.static(path.join('.', '/static/'))) // /static/index.html

//get all
app.get('/test', async (req, resp) => {
    try {
        const employees = await connectedKnex('test').select('*');
        console.log(employees);
        resp.status(200).json({ employees })
    }
    catch (err) {
        resp.status(500).json({ "error": err.message })
    }
})
// get end point by id
app.get('/test/:id', async (req, resp) => {
    try {
        const employees = await connectedKnex('test').select('*').where('id', req.params.id).first()
        resp.status(200).json(employees)
    }
    catch (err) {
        resp.status(500).json({ "error": err.message })
    }
})

function is_valid_employee(obj) {
    return obj.hasOwnProperty('updatedat') && obj.hasOwnProperty('name') && 
        obj.hasOwnProperty('date') && obj.hasOwnProperty('courseid') 
}
//update html הורדתי מתוף הפונקצייה הזו את התאריך שנוצר בו המבחן מכיוון שלא אמור לעדכן אותו בפונקצייה 
function is_valid_employee_without_date(obj) {
    return obj.hasOwnProperty('updatedat') && obj.hasOwnProperty('name') && obj.hasOwnProperty('courseid') 
}


// add_post
app.post('/test', async (req, resp) => {
    console.log(req.body);
    const employee = req.body
    try {
        if (! is_valid_employee (employee)) {
            resp.status(400).json({ error: 'values of employee are not llegal'})
            return
        }
        const result = await connectedKnex('test').insert(employee)
        resp.status(201).json({
             new_employee : { ...employee, ID: result[0] },
             url: `http://localhost:8080/employee/${result}` 
            })
    }
    catch (err) {
        console.log(err);
        resp.status(500).json({ "error": err.message })
    }
})

// put -insert/ update
app.put('/test/:id', async (req, resp) => {
    console.log(req.body);
    const employee = req.body
    try {
        if (! is_valid_employee_without_date (employee)) {
            resp.status(400).json({ error: 'values of employee are not llegal'})
            return
        }
        const result = await connectedKnex('test').where('id', req.params.id).update(employee)
        resp.status(200).json({
             status: 'updated',
             'how many rows updated': result
            })
    }
    catch (err) {
        resp.status(500).json({ "error": err.message })
    }
})
//delete
app.delete('/test/:id', async (req, resp) => {
    try {
        const result = await connectedKnex('test').where('id', req.params.id).del()
        resp.status(200).json({
            status: 'success',
            "how many deleted": result
        })
    }
    catch (err) {
        resp.status(500).json({ "error": err.message })
    }

})
// PATCH -- UPDATE 
app.patch('/test/:id', async (req, resp) => {
    console.log(req.body);
    const employee = req.body
    try {
        if (! is_valid_employee_without_date (employee)) {
            resp.status(400).json({ error: 'values of employee are not llegal'})
            return
        }
        const result = await connectedKnex('test').where('id', req.params.id).update(employee)
        resp.status(200).json({
             status: 'patched',
             'how many rows updated': result
            })
    }
    catch (err) {
        resp.status(500).json({ "error": err.message })
    }
})

app.listen(port, () => {
    console.log(`Listening to port ${port}`);
})

