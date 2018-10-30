const express = require("express");
const app = express();
const bodyParser = require('body-parser');
const PORT = 8080; // default port 8080

app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

let urlDatabase = {
  'b2xVn2': "http://www.lighthouselabs.ca",
  '9sm5xK': 'http://www.google.com'
};

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

//gets all urls and shows them
app.get('/urls', (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render('urls_index', templateVars);
});

//gets a page that you can input a new url to be shortened
app.get('/urls/new', (req, res) => {
  res.render('urls_new');
});

//gets a certain id no. long and short url
app.get('/urls/:id', (req, res) => {
  const id = req.params.id;
  let currentURL = urlDatabase[id];
  let templateVars = { shortURL: req.params.id, longURL: currentURL };
  if(urlDatabase.hasOwnProperty(id) === false){
    throw new error(`ID ${id} does not exist.`);
  }
  res.render('urls_show', templateVars);
});

//posts longurl of user submited url
app.post('/urls', (req, res) => {
  console.log(req.body);
  res.send('Ok');
});
