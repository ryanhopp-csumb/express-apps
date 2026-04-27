import 'dotenv/config';
import express from 'express';
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt'; //for secrets
import session from 'express-session'; //for sessions
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

//setting sessions
app.set('trust proxy', 1) // trust first proxy
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
//   cookie: { secure: true }
}))

//middleware used by ALL routes
app.use((req, res, next) => {
   res.locals.fullName = req.session.fullName || "";
   next(); //next middleware/route
});

//routes
app.get('/', (req, res) => {
   res.render('home.ejs');
});

app.get('/login', (req, res) => {
   res.render('login.ejs');
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

app.post('/loginLanding', async(req, res) => {
    let {username, password} = req.body;

    console.log(username + ": " + password);

   let hashedPassword = "";

   let sql = `SELECT *
              FROM admin
              WHERE username = ?`;
   const [rows] = await pool.query(sql, [username]);

    if (rows.length > 0) { //username was found in the database
        hashedPassword = rows[0].password;
    }
    
    const match = await bcrypt.compare(password, hashedPassword);

    if (match) {
        req.session.authenticated = true;
        req.session.fullName = rows[0].firstName + " " + rows[0].lastName;
        res.render('loginLanding.ejs');
    } else {
        let loginError = "Wrong Credentials! Try again!"
        res.render('login.ejs', {loginError});
    }
});

//Author section\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

app.get('/addAuthor', isUserAuthenticated, (req, res) => { //create authors
   res.render('author.ejs');
});

app.post('/addAuthor', isUserAuthenticated, async(req, res) => {
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

app.get('/allAuthors', async(req, res) => { //read authors
    let sql = `SELECT authorId, firstName, lastName
                FROM authors
                ORDER BY authorId`
    const [authors] = await pool.query(sql);
   res.render('allAuthors.ejs', {authors});
});

app.get('/updateAuthor', isUserAuthenticated, async(req, res) => { //update authors
    let authorId = req.query.authorId;
    let sql = `SELECT *, DATE_FORMAT(dob, '%Y-%m-%d') ISOdob, DATE_FORMAT(dod, '%Y-%m-%d') ISOdod
                FROM authors
                WHERE authorId = ?`
    const [authorInfo] = await pool.query(sql, authorId);
   res.render('updateAuthor.ejs', {authorInfo});
});

app.post('/updateAuthor', isUserAuthenticated, async(req, res) => {
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

app.get('/deleteAuthor', isUserAuthenticated, async(req, res) => { //delete authors
    // let sql = `SELECT authorId, firstName, lastName
    //             FROM authors
    //             ORDER BY authorId`
    // const [authors] = await pool.query(sql);
   res.render('deleteAuthor.ejs');
});

//Quotes section\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

app.get('/addQuote', isUserAuthenticated, async(req, res) => { //create quotes
    let sql = `SELECT authorId, firstName, lastName, category
                FROM authors
                NATURAL JOIN quotes
                GROUP BY category`
    const [authorOptions] = await pool.query(sql);
   res.render('quote.ejs', {authorOptions});
});

app.post('/newQuote', isUserAuthenticated, async(req, res) => {
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

app.get('/allQuotes', async(req, res) => { //read quotes
    let sql = `SELECT quote, quoteId
                FROM quotes
                ORDER BY quoteId`
    const [allQuotes] = await pool.query(sql);
   res.render('allQuotes.ejs', {allQuotes});
});

app.get('/updateQuote', isUserAuthenticated, async(req, res) => { //update quotes
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

app.post('/updateQuote', isUserAuthenticated, async(req, res) => {
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

app.get('/deleteQuote', isUserAuthenticated, async(req, res) => { //delete quotes
    // let sql = `SELECT authorId, firstName, lastName
    //             FROM authors
    //             ORDER BY authorId`
    // const [authors] = await pool.query(sql);
   res.render('deleteQuote.ejs');
});

//checking if user is authenticated
function isUserAuthenticated(req, res, next){
    if (req.session.authenticated) { 
      next();
    } else {
        res.redirect("/");
    }
}

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