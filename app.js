require('dotenv').config();
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.json());
const session = require('express-session');
const request = require('request');
const qs = require('querystring');
const url = require('url');
const randomString = require('randomstring');
const csrfString = randomString.generate();
const port = process.env.PORT || 8080;
const redirect_uri = process.env.HOST + '/redirect';
const router = express.Router();
const connection = require('./config');

app.use(express.static('views'));
var authenticateController = require('./controllers/authenticate-controller');
var registerController = require('./controllers/register-controller');
app.use(bodyParser.urlencoded({ extended: true }));


/* route to handle login and registration */
app.post('/api/register', registerController.register);
app.post('/api/authenticate', authenticateController.authenticate);
app.post('/controllers/register-controller', registerController.register);
app.post('/controllers/authenticate-controller', authenticateController.authenticate);
app.listen(8012);

app.use(
  session({
    secret: randomString.generate(),
    cookie: { maxAge: 60000 },
    resave: false,
    saveUninitialized: false
  })
);


//Accessing Oauth token starts here
app.get('/', (req, res, next) => {
  res.sendFile(__dirname + '/index.html');
});

// user login/registration API
app.get('/login.html', function (req, res) {  
  res.sendFile( __dirname + "/" + "login.html" );  
})  
app.get('/register.html', function (req, res) {  
  res.sendFile( __dirname + "/" + "register.html" );  
})  


app.listen(port, () => {
  console.log('Server listening at port ' + port);
});


app.get('/login', (req, res, next) => {
  req.session.csrf_string = randomString.generate();
  const githubAuthUrl =
    'https://github.com/login/oauth/authorize?' +
    qs.stringify({
      client_id: process.env.CLIENT_ID,
      redirect_uri: redirect_uri,
      state: req.session.csrf_string,
      scope: 'repo'
    });
  res.redirect(githubAuthUrl);
});


app.all('/redirect', (req, res) => {
  console.log('Request sent by GitHub: ');
  console.log(req.query);
  const code = req.query.code;
  const returnedState = req.query.state;

  if (req.session.csrf_string === returnedState) {
    request.post(
      {
        url:
          'https://github.com/login/oauth/access_token?' +
          qs.stringify({
            client_id: process.env.CLIENT_ID,
            client_secret: process.env.CLIENT_SECRET,
            code: code,
            redirect_uri: redirect_uri,
            state: req.session.csrf_string
          })
      },
      (error, response, body) => {
        console.log('Your Access Token: ');
        console.log(qs.parse(body));
        req.session.access_token = qs.parse(body).access_token;
        var oAuth = req.session.access_token;
        connection.query(
          "Insert into oAuth (token) VALUES ('" + oAuth + "')",
          function (err, result) {
            if (err) {
              console.log(err);
              return;
            }
            console.log("---@@@------")
            console.log(result);
            console.log("---@@@------")
            res.redirect(result);
          }
        );
      }
    );
  } else {
    res.redirect('/');
  }
});

app.get('/user', (req, res) => {
  request.get(
    {
      url: 'https://api.github.com/user/public_emails',
      headers: {
        Authorization: 'token ' + req.session.access_token,
        'User-Agent': 'Login-App'
      }
    },
    (error, response, body) => {
      res.send(
        "<p>You're logged in! Here's all your emails on GitHub: </p>" +
        body +
        '<p>Go back to <a href="/">log in page</a>.</p>'
      );
    }
  );
});

// data storing for repositories
app.post('/repoName', function (req, res) {
  res.set({
    'Access-Control-Allow-Origin': '*'
  })
  console.log("@@@@@@");
  var repoName = req.body.name;
  var result1;
  id = 0;
  console.log(repoName);
  connection.query(
    "Insert into repos (id,reponame) VALUES ('" + id + "','" + repoName + "')",
    function (err, result) {
      if (err) {
        console.log(err);
        return;
      }
      console.log(result);
      result1 = result;
    }
  );
  res.send({result1});
  
});

app.get('/repoLists', (req, res) => {
  connection.query(
    "SELECT reponame FROM repos",
    function (err, result) {
      if (err) {
        console.log(err);
        return;
      }
      res.send(result);
    }
  );
});


// retrieving data from database
app.get('/getFolders', (req, res) => {
  connection.query(
    "SELECT * FROM fileStructure",
    function (err, result) {
      if (err) {
        console.log(err);
        return;
      }
      res.send(result);
    }
  );
});
