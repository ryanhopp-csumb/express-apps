import express from 'express';
const table = (await import('text-table')).default;

const app = express();

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({extended:true}));

//API is https://www.themealdb.com/api.php
//Node package is text-table

app.get('/', async(req, res) => {
   let url = "www.themealdb.com/api/json/v1/1/categories.php";
   try {
      const response = await fetch(url);
      console.log(response);
      if (!response.ok) {
         throw new Error("There was an error accessing the API");
      }

      const data = await response.json();
      console.log(data);

      let categories = data.hits;
      console.log(categories);

      res.render('home.ejs', {categories});
   } catch (err) {
      if (err instanceof TypeError) {
         res.render('home.ejs', { message: 'There was an error accessing the API (network failure)' });
      } else {
         res.render('home.ejs', { message: "Couldn't load the data" });
      }
   }
});

app.get('/searchByCategory', async (req, res) => {
   let url = "www.themealdb.com/api/json/v1/1/list.php?c=";
   try {
      const response = await fetch(url);
      if (!response.ok) {
         throw new Error("There was an error accessing the API");
      }

      const data = await response.json();
      console.log(data);

      res.render('categories.ejs');
   } catch (err) {
      if (err instanceof TypeError) {
         res.render('categories.ejs', { message: 'There was an error accessing the API (network failure)' });
      } else {
         res.render('categories.ejs', { message: "Couldn't load the data" });
      }
   }
});

app.get('/about', async(req, res) => {
   res.render('about.ejs');
});

app.listen(3000, () => {
   console.log('server started on port 3000');
});
