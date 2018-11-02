const cookieParser = require('cookie-parser');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const PORT = 8080; // default port 8080

const urlDatabase = {};

const users = {};


const hashes = {};

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

//checks if the email given in registration the same as any users
function doesEmailRepeat(emailBeingChecked) {
  for (const user in users) {
    let currentUser = users[user];
    return currentUser.email === emailBeingChecked;
  }
}

//checks if given email and password match any users
function doesThisEmailMatch(givenEmail, shouldReturnId) {
  for (const user in users) {
    if (users[user].email === givenEmail) {
      if (shouldReturnId) {
        return users[user].id;
      } else {
        return true;
      }
    }
  }
}

function doesThisIdMatch(givenId) {
  for (let i = 0; i < Object.keys(users).length; i++) {
    if (Object.keys(users)[i] === givenId) {
      return Object.keys(users)[i];
    }
  }
}

//retrives urls that are owned by a certain user
function urlsForUser(id) {
  let filteredDatabase = {};
  for (var currentShortURL in urlDatabase) {
    if (urlDatabase[currentShortURL].userID === id) {
      filteredDatabase[currentShortURL] = { 'longURL': urlDatabase[currentShortURL].longURL, 'shortURL': currentShortURL, 'userID': id };
    }
  }
  return filteredDatabase;
}

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

//initalizes home page
app.get('/', (req, res) => {
  const templateVars = {
    id: req.cookies.user_id
  };
  res.render('home', templateVars);
});

//gets all urls and shows them
app.get('/urls', (req, res) => {
  const templateVars = {
    urls: urlsForUser(req.cookies.user_id),
    id: req.cookies.user_id
  };
  res.render('urls_index', templateVars);
});

//gets a page that you can input a new url to be shortened
app.get('/urls/new', (req, res) => {
  const templateVars = {
    id: req.cookies.user_id
  };
  if (req.cookies.user_id) {
    res.render('urls_new', templateVars);
  } else {
    res.redirect('/login');
  }
});

//gets a certain id no.s long and short url
app.get('/urls/:id', (req, res) => {
  const shortUrl = req.params.id;
  const userOwnedUrls = urlsForUser(req.cookies.user_id);
  if (userOwnedUrls[shortUrl]) {
    let currentURL = userOwnedUrls[shortUrl].longURL;
    const templateVars = {
      shortURL: shortUrl,
      longURL: currentURL,
      id: req.cookies.user_id
    };
    res.render('urls_show', templateVars);
  } else {
    throw new Error(`Make sure you're logged in and that this URL ID belongs to you.`);
  }
  if (urlDatabase.hasOwnProperty(shortUrl) === false) {
    throw new Error(`ID ${short} does not exist.`);
  }
});

//posts longURL of user changed and created url
app.post('/urls', (req, res) => {
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = { longURL: "", shortURL: "", userID: ""};
  urlDatabase[shortURL].longURL = req.body.longURL;
  urlDatabase[shortURL].shortURL = shortURL;
  urlDatabase[shortURL].userID = req.cookies.user_id;
  res.redirect(`/urls/${shortURL}`);
});

//redirects short url to longURL
app.get('/u/:shortURL', (req, res) => {
  let shortURL = req.params.shortURL;
  let longURL = urlDatabase[shortURL].longURL;
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
  urlDatabase[id].longURL = req.body.changedLongURL;
  res.redirect('/urls');
});

//displays login page
app.get('/login', (req, res) => {
  templateVars = { id: req.cookies.user_id };
  res.render('_login', templateVars);
});

//store login data in cookie
app.post('/login', (req, res) => {
  const emailMatched = doesThisEmailMatch(req.body.email);
  const passwordMatched = bcrypt.compareSync(req.body.password, hashes[req.body.email]);
  if (emailMatched && passwordMatched) {
    res.cookie('user_id', doesThisIdMatch(doesThisEmailMatch(req.body.email, "h")));
  } else {
    res.status(403).send({ error: 'Email or Password does not match user', code: 403 });
  }
  res.redirect('/urls');
});

//clears login data from cookie
app.get('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});

//open register page
app.get('/register', (req, res) => {
  res.render('_register');
});

//posting user inputed data to our users object
app.post('/register', (req, res) => {
  //checking to see if forms are filled out and not the same as other users
  if (req.body.email && req.body.password && !doesEmailRepeat(req.body.email)) {
    const userID = generateRandomString();
    hashes[req.body.email] = bcrypt.hashSync(req.body.password, 10);
    users[userID] = { id: userID, email: req.body.email, password: hashes[req.body.email] };
    res.cookie('user_id', userID);
    res.redirect('/urls');
  } else {
    res.status(400).send({ error: "Required fields not filled or email same as another user", code: 400 });
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
