const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set('view engine', 'ejs');

let urlDatabase = {
  'b2xVn2': "http://www.lighthouselabs.ca",
  '9sm5xK': 'http://www.google.com'
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get('/urls', (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render('urls_index', templateVars);
});

app.get('/urls/:id', (req, res) => {
  const id = req.params.id;
  let currentURL = urlDatabase[id];
  let templateVars = { shortURL: req.params.id, longURL: currentURL };

  if(urlDatabase.hasOwnProperty(id) === false){
    throw new error(`ID ${id} does not exist.`);
  }

  res.render('urls_show', templateVars);
});
