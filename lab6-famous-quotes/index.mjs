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
    user: "w9c7lwn8um1o99yj",
    password: "u3rw8lbcasz2h307",
    database: "pyn5h5u7iu857dd2",
    connectionLimit: 10,
    waitForConnections: true
});

//routes
app.get('/', async(req, res) => {
    let sql = `SELECT authorId, firstName, lastName, likes
                FROM authors
                ORDER BY lastName`;
    const [authors] = await pool.query(sql);
    let sql1 = `SELECT DISTINCT category
                FROM quotes
                ORDER BY quote`;
    const [categories] = await pool.query(sql1);  
   res.render('home.ejs', {authors, categories});
});

app.get("/searchByKeyword", async(req, res) => {
   try {
        //console.log(req);
        let keyword = req.query.keyword;
        let sql = `SELECT quote, firstName, lastName
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
        let sql = `SELECT quote, firstName, lastName
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
        let sql = `SELECT category, quote
                    FROM quotes
                    WHERE category = '${category}'`;
        const [rows] = await pool.query(sql);
        res.render("quotes.ejs", {rows});
    } catch (err) {
        console.error("Database error:", err);
        res.status(500).send("Database error!");
    }
});

app.get("/searchByLikes", async(req, res) => {
   try {
        let keyword = req.query.keyword;
        let sql = `SELECT quote, firstName, lastName
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
