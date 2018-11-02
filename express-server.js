const cookieParser = require('cookie-parser');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const PORT = 8080; // default port 8080

const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    shortURL: "b2xVn2",
    userID: "userRandomID"
   },
  "9sm5xK": {
    longURL:'http://www.google.com',
    shortURL: "9sm5xk",
    userID: "user2RandomID"
   }
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
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

//checks if the email given in registration the same as any users
function doesEmailRepeat(emailBeingChecked) {
  for (const user in users) {
    let currentUser = users[user];
    return currentUser.email === emailBeingChecked;
  }
}

//checks if given email and password match any users
function whichIdDoesThisMatch(givenEmail, givenPassword) {
  for (const user in users) {
    let currentUser = users[user];
    if (currentUser.email === givenEmail) {
      if (currentUser.password === givenPassword) {
        return currentUser.id;
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

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  const templateVars = {
    id: req.cookies.user_id
  };
  res.render('home', templateVars);
});

//gets all urls and shows them
app.get('/urls', (req, res) => {
  let filteredDatabase = {};
  for (var currentShortURL in urlDatabase) {
    console.log(currentShortURL);
    if (urlDatabase[currentShortURL].userID === req.cookies.user_id) {
      filteredDatabase[currentShortURL] = { 'longURL': urlDatabase[currentShortURL].longURL, 'shortURL': currentShortURL, 'userID': req.cookies.user_id };
    }
  }
  console.log(filteredDatabase);
  const templateVars = {
    urls: filteredDatabase,
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
  const id = req.params.id;
  let currentURL = urlDatabase[id].longURL;
  const templateVars = {
    shortURL: req.params.id,
    longURL: currentURL,
    id: req.cookies.user_id
  };
  if (urlDatabase.hasOwnProperty(id) === false) {
    throw new error(`ID ${id} does not exist.`);
  }
  res.render('urls_show', templateVars);
});

//posts longURL of user changed and created url
app.post('/urls', (req, res) => {
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = { longURL: "", shortURL: "", userID: ""};
  urlDatabase[shortURL].longURL = req.body.longURL;
  urlDatabase[shortURL].shortURL = shortURL;
  urlDatabase[shortURL].userID = req.cookies.user_id;
  console.log(urlDatabase);
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
  console.log(whichIdDoesThisMatch(req.body.email, req.body.password));
  if (whichIdDoesThisMatch(req.body.email, req.body.password)) {
    res.cookie('user_id', doesThisIdMatch(whichIdDoesThisMatch(req.body.email, req.body.password)));
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
    let currentUserID = users.userID;
    currentUserID = { id: userID, email: req.body.email, password: req.body.password };
    res.cookie('user_id', userID);
    res.redirect('/urls');
  } else {
    res.status(400).send({ error: "Required fields not filled or email same as another user", code: 400 });
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
