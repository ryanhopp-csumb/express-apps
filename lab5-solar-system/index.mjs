import express from 'express';
const planets = (await import('npm-solarsystem')).default;

const app = express();

app.set("view engine", "ejs");
app.use(express.static("public"));

//routes
//root route
app.get('/', (req, res) => {
  res.render('home.ejs');
})

app.get('/planetInfo', (req, res) => {
  let planet = req.query.planet;
  let planetInfo = planets[`get${planet}`]();
  res.render('planet.ejs', { planetInfo, planet });
})

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
})

getRandomImg();

async function getRandomImg() {
  let url = "https://pixabay.com/api/?key=5589438-47a0bca778bf23fc2e8c5bf3e&per_page=50&orientation=horizontal&q=solar%20system";
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("There was an error accessing the API");
    }

    const data = await response.json();
    console.log(data);

    //document.querySelector???

  } catch (err) {
    if (err instanceof TypeError) {
      alert("There was an error accessing the API (network failure)");
    } else {
      alert(err.message);
    }
  }
}


// app.get('/mercury', (req, res) => {
//     let mercuryInfo = planets.getMercury();
//     //console.log(mercuryInfo);
//   res.render('mercury.ejs', {mercuryInfo});
// })

// app.get('/venus', (req, res) => {
//     let venusInfo = planets.getVenus();
//      console.log(venusInfo);
//   res.render('venus.ejs');
// })