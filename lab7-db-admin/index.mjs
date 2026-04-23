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
                (?, ?, ?, ?, ?, ?)`;
    let sqlParams = [firstName, lastName, dob, dod, sex, bio];
    const [newAuthors] = await pool.query(sql, sqlParams);
    res.redirect('/');
});

app.get('/allAuthors', async(req, res) => {
    let sql = `SELECT authorId, firstName, lastName
                FROM authors
                ORDER BY authorId`
    const [authors] = await pool.query(sql);
   res.render('allAuthors.ejs', {authors});
});

app.get('/updateAuthor', async(req, res) => {
    let authorId = req.query.authorId;
    let sql = `SELECT *, DATE_FORMAT(dob, '%Y-%m-%d') ISOdob, DATE_FORMAT(dod, '%Y-%m-%d') ISOdod
                FROM authors
                WHERE authorId = ?`
    const [authorInfo] = await pool.query(sql, authorId);
   res.render('updateAuthor.ejs', {authorInfo});
});

app.post('/updateAuthor', async(req, res) => {
    let authorId = req.body.authorId;
    let firstName = req.body.firstName;
    let lastName = req.body.lastName;
    let dob = req.body.dob;
    let dod = req.body.dod;
    let sex = req.body.sex;
    let sql = `UPDATE authors
                SET
                firstName = ?,
                lastName = ?,
                dob = ?
                dod = ?
                sex = ?
                WHERE authorId = ?`
    let sqlParams = [firstName, lastName, dob, dod, sex, authorId];
    const [authorInfo] = await pool.query(sql, sqlParams);
   res.redirect('/allAuthors.ejs', {authorInfo});
});

app.get('/deleteAuthor', async(req, res) => {
    // let sql = `SELECT authorId, firstName, lastName
    //             FROM authors
    //             ORDER BY authorId`
    // const [authors] = await pool.query(sql);
   res.render('deleteAuthor.ejs');
});



app.get('/addQuote', async(req, res) => {
    let sql = `SELECT authorId, firstName, lastName, category
                FROM authors
                NATURAL JOIN quotes
                GROUP BY category`
    const [authorOptions] = await pool.query(sql);
   res.render('quote.ejs', {authorOptions});
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

app.get('/allQuotes', async(req, res) => {
    let sql = `SELECT quote, quoteId
                FROM quotes
                ORDER BY quoteId`
    const [allQuotes] = await pool.query(sql);
   res.render('allQuotes.ejs', {allQuotes});
});

app.get('/updateQuote', async(req, res) => {
    let quoteId = req.query.quoteId;
    let sql = `SELECT *
                FROM quotes
                WHERE quoteId = ?`
    const [quoteInfo] = await pool.query(sql, [quoteId]);

    let sql1 = `SELECT authorId, firstName, lastName
               FROM authors
               ORDER BY lastName`;
    const [authorList] = await pool.query(sql1);

    let sql2 = `SELECT DISTINCT category
               FROM quotes
               ORDER BY category`;
    const [categoryList] = await pool.query(sql2);
   res.render('updateQuote.ejs', {quoteInfo, authorList, categoryList});
});

app.post('/updateQuote', async(req, res) => {
    let quoteId = req.query.quoteId;
    let sql = `SELECT *
                FROM quotes
                WHERE quoteId = ?`
    const [quoteInfo] = await pool.query(sql, [quoteId]);

    let sql1 = `SELECT authorId, firstName, lastName
               FROM authors
               ORDER BY lastName`;
    const [authorList] = await pool.query(sql1);
   res.render('updateQuote.ejs', {quoteInfo, authorList});
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