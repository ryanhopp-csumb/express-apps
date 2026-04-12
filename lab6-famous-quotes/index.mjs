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
app.get('/', async(req, res) => {
    let sql = `SELECT firstName, lastName, authorId
                FROM authors
                ORDER BY lastName`;
    const [authors] = await pool.query(sql);
    let sql1 = `SELECT category, firstName, lastName, authorId
                FROM quotes
                NATURAL JOIN authors
                GROUP BY category`;
    const [categories] = await pool.query(sql1);  
   res.render('home.ejs', {authors, categories});
});

app.get("/searchByKeyword", async(req, res) => {
    try {
        let keyword = req.query.keyword;
        let sql = `SELECT quote, likes, category, firstName, lastName, authorId
                    FROM quotes
                    NATURAL JOIN authors
                    WHERE quote LIKE ?`;
        let sqlParams = [`%${keyword}%`];
        const [rows] = await pool.query(sql, sqlParams);
        res.render("quotes.ejs", {rows});
    } catch (err) {
        console.error("Database error:", err);
        res.status(500).send("Database error!");
    }
});

app.get("/searchByAuthor", async(req, res) => {
   try {
       let authorId = req.query.authorId;
        let sql = `SELECT quote, likes, category, firstName, lastName, authorId
                    FROM quotes
                    NATURAL JOIN authors
                    WHERE authorId = ${authorId}`;
        const [rows] = await pool.query(sql);
        res.render("quotes.ejs", {rows});
    } catch (err) {
        console.error("Database error:", err);
        res.status(500).send("Database error!");
    }
});

app.get("/searchByCategory", async(req, res) => {
   try {
        let category = req.query.category;
        let sql = `SELECT quote, likes, category, firstName, lastName, authorId
                    FROM quotes
                    NATURAL JOIN authors
                    WHERE quotes.authorId = authors.authorId AND quotes.category = '${category}'`;
        const [rows] = await pool.query(sql);
        res.render("quotes.ejs", {rows});
    } catch (err) {
        console.error("Database error:", err);
        res.status(500).send("Database error!");
    }
});

app.get("/searchByLikes", async(req, res) => {
   try {
        let likes1 = req.query.likes1;
        let likes2 = req.query.likes2;
        let sql = `SELECT quote, likes, category, firstName, lastName, authorId
                    FROM quotes
                    NATURAL JOIN authors
                    WHERE quotes.authorId = authors.authorId
                    AND likes BETWEEN ${likes1} AND ${likes2}
                    ORDER BY likes`;
        const [rows] = await pool.query(sql);
        res.render("quotes.ejs", {rows});
    } catch (err) {
        console.error("Database error:", err);
        res.status(500).send("Database error!");
    }
});

//API to get author info based on author id
app.get('/api/author/:authorID', async(req, res) => {
    let authorId = req.params.authorID;
    let sql = `SELECT *
                FROM authors
                WHERE authorId = ?`;
    const [authorInfo] = await pool.query(sql, [authorId]);
    res.send(authorInfo); //displays info in JSON format
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
