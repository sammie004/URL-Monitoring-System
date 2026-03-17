const db = require('../config/db')

const ADD = (req, res) => {
    const { url,name } = req.body
    const id = req.user.id
    if(!url) {
        return res.status(400).json({ message: "Please provide a URL to monitor." })
    }
    const check_query = `select * from urls where url = ? `
    db.query(check_query,[url],(err,results)=>{
        if (err) {
            console.log(`an error occured while checking for existing url`, err)
            res.status(500).json({ message: "Oops! Something went wrong." })
        }
        if (results.length > 0) {
            console.log(`A url with this address already exists`)
            res.status(400).json({ message: "A url with this address already exists." })
        } else {
            const insert_query = `insert into urls (url,name,user_id) values (?,?,?)`
            db.query(insert_query,[url,name,id],(err,results)=>{
                if (err) {
                    console.log(`an error occured while adding url`, err)
                    res.status(500).json({ message: "Oops! Something went wrong." })
                }
                res.status(200).json({ message: "URL added successfully." })
            })
        }
    })

}

// get all urls for a user
const GET = (req, res) => {
    const id = req.user.id
    const check_query = `select * from urls where user_id = ? `
    db.query(check_query,[id],(err,results)=>{
        if (err) {
            console.log(`an error occured while fetching urls`, err)
            res.status(500).json({ message: "Oops! Something went wrong." })
        }
        res.status(200).json({ urls: results })
    })
}

const Delete = (req, res) => {
    const id = req.params.id
    const user_id = req.user.id
    const delete_query = `delete from urls where id = ? and user_id = ?`
    db.query(delete_query,[id,user_id],(err,results)=>{
        if (err) {
            console.log(`an error occured while deleting url`, err)
            res.status(500).json({ message: "Oops! Something went wrong." })
        }
        res.status(200).json({ message: "URL deleted successfully." })
    })
}

module.exports = {
    ADD,
    GET,
    Delete
}