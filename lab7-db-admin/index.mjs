import 'dotenv/config';
import express from 'express';
import mysql from 'mysql2/promise';
const app = express();
app.set('view engine', 'ejs');
app.use(express.static('public'));
//for Express to get values using the POST method
app.use(express.urlencoded({extended:true}));

//setting up database connection pool, replace values in red
const pool = mysql.createPool({
    host: "sh4ob67ph9l80v61.cbetxkdyhwsb.us-east-1.rds.amazonaws.com",
    user: process.env.DB_USERNAME,
    password: process.env.DB_PWD,
    database: "pyn5h5u7iu857dd2",
    connectionLimit: 10,
    waitForConnections: true
});

//routes
app.get('/', (req, res) => {
   res.render('home.ejs')
});

app.get('/addAuthor', (req, res) => {
   res.render('author.ejs');
});

app.post('/addAuthor', async(req, res) => {
    let firstName = req.body.firstName;
    let lastName = req.body.lastName;
    let dob = req.body.dob;
    let dod = req.body.dod;
    let sex = req.body.sex;
    let bio = req.body.bio;

    let sql = `INSERT INTO authors
                (firstName, lastName, dob, dod, biography)
                VALUES
                (?, ?, ?, ?, ?)`;
    let sqlParams = [firstName, lastName, dob, sex, bio];

    const [newAuthors] = await pool.query(sql, sqlParams);

    res.redirect('/');
});

app.get('/addQuote', (req, res) => {
   res.render('quote.ejs');
});

app.post('/newQuote', async(req, res) => {
    let quote = req.body.quote;
    let category = req.body.category;
    let author = req.body.author;

    let sql = `INSERT INTO quotes
                (quote, category, authorId)
                VALUES
                (?, ?, ?)`;
    let sqlParams = [quote, category, author];

    const [newQuotes] = await pool.query(sql, sqlParams);

    res.redirect('/');
});

app.get("/dbTest", async(req, res) => {
   try {
        const [rows] = await pool.query("SELECT CURDATE()");
        res.send(rows);
    } catch (err) {
        console.error("Database error:", err);
        res.status(500).send("Database error!");
    }
});//dbTest

app.listen(3000, ()=>{
    console.log("Express server running")
})