import express from 'express';
const planets = (await import('npm-solarsystem')).default;

const app = express();

app.set("view engine", "ejs");
app.use(express.static("public"));

//routes
//root route
app.get('/', async(req, res) => {

  let url = "https://pixabay.com/api/?key=5589438-47a0bca778bf23fc2e8c5bf3e&per_page=50&orientation=horizontal&q=solar%20system";
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("There was an error accessing the API");
    }

    const data = await response.json();

    let randomIdx = Math.floor(Math.random() * 50);
    let image = data.hits[randomIdx].webformatURL;

    res.render('home.ejs', {image});
  } catch (err) {
    if (err instanceof TypeError) {
      res.render('home.ejs', { message: 'There was an error accessing the API (network failure)' });
    } else {
      res.render('Error', { message: "Couldn't load image"});
    }
  }
})

app.get('/planetInfo', (req, res) => {
  let planet = req.query.planet;
  let planetInfo = planets[`get${planet}`]();
  res.render('planet.ejs', { planetInfo, planet });
})

app.get('/asteroids', (req, res) => {
  let asteroidInfo = planets.getAsteroids();
  res.render('asteroids.ejs', { asteroidInfo });
})

app.get('/comets', (req, res) => {
  let cometInfo = planets.getComets();
  res.render('comets.ejs', { cometInfo });
})

app.get('/nasa-apod', async(req, res) => {
  const currentDate = new Date().toISOString().slice(0, 10);;
  let url1 = "https://api.nasa.gov/planetary/apod?api_key=9mUzIkhlZCZaOoMfspg7jMmwZCZ4LiRHtkgkambD&date=" + currentDate;
  try {
    const response = await fetch(url1);
    if (!response.ok) {
      throw new Error("There was an error accessing the API");
    }

    const data = await response.json();
    let pic = data.url;

    res.render('nasa-apod.ejs', {pic, currentDate});
  } catch (err) {
    if (err instanceof TypeError) {
      res.render('nasa-apod.ejs', { message: 'There was an error accessing the API (network failure)' });
    } else {
      res.render('nasa-apod.ejs', { message: "Couldn't load image"});
    }
  }

})

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
})

