// dependencies
const dotenv = require("dotenv")
const express = require("express")
const bodyParser = require("body-parser")
const cors = require("cors")
const app = express()
const db = require("./config/db")
const userAuthRoutes = require("./routes/users/authentication")


// usages
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
dotenv.config()

// routes
app.use("/api/auth", userAuthRoutes)



// server start
const port = 3000
app.listen(port, () => {
    console.log(`the server is  listening on port ${port}`)
})