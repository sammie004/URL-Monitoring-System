const mysql = require("mysql")
const dotenv = require("dotenv")
dotenv.config()

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
})
db.connect((err) => {
    if (err) {
        console.log(`❌ an error occured while connecting to the database`, err)
    } else {
        console.log("connected to the database 🚀✅")
    }
})
module.exports = db