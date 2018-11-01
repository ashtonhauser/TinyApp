const cookieParser = require('cookie-parser');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const PORT = 8080; // default port 8080
var urlDatabase = {
  'b2xVn2': "http://www.lighthouselabs.ca",
  '9sm5xK': 'http://www.google.com'
};

function generateRandomString() {
  const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYVabcdefghijklmnopqrstuvwxyz";
  const stringLength = 6;
  let randomString = '';
  for (let i = 0; i < stringLength; i++) {
    let randomNrL = chars[Math.round(Math.random() * chars.length)];
    randomString += randomNrL;
  }
  return randomString;
}

app.use(cookieParser());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.set('view engine', 'ejs');


//gets all urls and shows them
app.get('/urls', (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    username: req.cookies.username
  };
  res.render('urls_index', templateVars);
});

//gets a page that you can input a new url to be shortened
app.get('/urls/new', (req, res) => {
  templateVars = {
    username: req.cookies.username
  };
  res.render('urls_new', templateVars);
});

//gets a certain id no. long and short url
app.get('/urls/:id', (req, res) => {
  const id = req.params.id;
  let currentURL = urlDatabase[id];
  let templateVars = {
    shortURL: req.params.id,
    longURL: currentURL,
    username: req.cookies.username
  };
  if (urlDatabase.hasOwnProperty(id) === false) {
    throw new error(`ID ${id} does not exist.`);
  }
  res.render('urls_show', templateVars);
});

//posts longURL of user changed url
app.post('/urls', (req, res) => {
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

//redirects short url to longURL
app.get('/u/:shortURL', (req, res) => {
  let shortURL = req.params.shortURL;
  let longURL = urlDatabase[shortURL];
  res.redirect(longURL);
});

//deleting a url from database
app.post('/urls/:id/delete', (req, res) => {
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect('/urls');
});

//altering the longURL of a certain shortURL
app.post('/urls/:id/edit', (req, res) => {
  const id = req.params.id;
  urlDatabase[id] = req.body.changedLongURL;
  res.redirect('/urls');
});

//store login data in cookie
app.post('/login', (req, res) => {
  res.cookie('username', `${req.body.username}`);
  res.redirect('/urls');
});

//clears login data from cookie
app.post('/logout', (req, res) => {
  res.clearCookie('username');
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
