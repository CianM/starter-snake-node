const bodyParser = require('body-parser')
const express = require('express')
const logger = require('morgan')
const app = express()
const {
  fallbackHandler,
  notFoundHandler,
  genericErrorHandler,
  poweredByHandler
} = require('./handlers.js')

const util = require('util');
const log = (obj) => console.log(util.inspect(obj, { showHidden: false, depth: null }));

let game; // current game object
const Game = require("./game");


// For deployment to Heroku, the port needs to be set using ENV, so
// we check for the port number in process.env
app.set('port', (process.env.PORT || 9001))

app.enable('verbose errors')

app.use(logger('dev'))
app.use(bodyParser.json())
app.use(poweredByHandler)

// --- SNAKE LOGIC GOES BELOW THIS LINE ---

const SNAKE_COLOR = "#009A49";


// Handle POST request to '/start'
app.post('/start', (request, response) => {
  console.log("/start")
  log(request.body);
  
  const { you, board } = request.body; 
  try {

  }
  catch(u) {
    console.log("U")
    log(u)
  }
  game = new Game(you, board);

  // Response data
  const data = {
    color: SNAKE_COLOR,
  }

  return response.json(data)
})

// Handle POST request to '/move'
app.post('/move', (request, response) => {
  console.log("/move");
  //log(request.body)
  // Response data

  const { you, board } = request.body; 
  try {
    var direction = game.move(you, board);
  }
  catch(x) {
    console.log("x")
    log(x);
  }
  
  console.log({direction})
  const data = {
    move: direction
  }

  return response.json(data)
})

app.post('/end', (request, response) => {
  // NOTE: Any cleanup when a game is complete.
  delete game;
  return response.json({})
})

app.post('/ping', (request, response) => {
  // Used for checking if this snake is still alive.
  return response.json({});
})

// --- SNAKE LOGIC GOES ABOVE THIS LINE ---

app.use('*', fallbackHandler)
app.use(notFoundHandler)
app.use(genericErrorHandler)

app.listen(app.get('port'), () => {
  console.log('Server listening on port %s', app.get('port'))
})
