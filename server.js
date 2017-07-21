var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');

var app = express();
var PORT = process.env.PORT || 3000;
var todos = [];
var todoNextId = 1;

app.use(bodyParser.json());

app.get('/', function (req, res) {
  res.send('Todo API Root');
});

// GET /todos?completed=true&q=keyword
app.get('/todos', function (req, res) {
  var queryParams = req.query;
  var filteredTodos = todos;
  var search = req.q;

  if(queryParams.hasOwnProperty('completed')) {
    queryParams.completed = (queryParams.completed === "true");
    filteredTodos = _.where(todos, _.pick(queryParams, 'completed'));
  }

  if(queryParams.hasOwnProperty('q') && queryParams.q.length > 0) {
    filteredTodos = _.filter(filteredTodos, function(todo) {
      return todo.description.toLowerCase().indexOf(queryParams.q.toLowerCase()) > -1;
    });
  }

  res.json(filteredTodos);
});

// GET /todos/:id
app.get('/todos/:id', function (req, res) {
  var todoId = parseInt(req.params.id, 10);
  var matchedTodo = _.findWhere(todos, {id: todoId});

  if(matchedTodo) {
    res.json(matchedTodo);
  } else {
    res.status(404).send();
  }
});

// POST /todo
app.post('/todos', function(req, res) {
  var body = _.pick(req.body, 'description', 'completed');

  // call create on db.todo
  // respond with 200 and todo
  // res.status(400).json(e)

  if (!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.trim().length === 0) {
    return res.status(400).send();
  }

  body.description = body.description.trim();

  db.todo.create(body).then(function(todo) {
    res.json(todo.toJSON());
  }, function (e) {
    res.status(400).json(e);
  });
  // body.id = todoNextId++;
  // todos.push(body);
  //
  // res.json(body);
});

// DELETE /todos/:id
app.delete('/todos/:id', function(req, res) {
  var todoId = parseInt(req.params.id, 10);
  var matchedTodo = _.findWhere(todos, {id: todoId});

  if(!matchedTodo) {
    res.status(404).json({"Error":"There's no todo found with supplied id"});
  } else {
    todos = _.without(todos,matchedTodo);
    res.json(matchedTodo);
  }
});

// PUT /todos/:id
app.put('/todos/:id', function(req, res) {
  var todoId = parseInt(req.params.id, 10);
  var matchedTodo = _.findWhere(todos, {id: todoId});
  var body = _.pick(req.body, 'description', 'completed');
  var validAttributes = {};

  if(!matchedTodo) {
    return res.status(404).send();
  }

  if(body.hasOwnProperty('completed') && _.isBoolean(body.completed)) {
    validAttributes.completed = body.completed;
  } else if (body.hasOwnProperty('completed')) {
    return res.status(400).send();
  }

  if(body.hasOwnProperty('description') && _.isString(body.description) && body.description.trim().length > 0) {
    validAttributes.description = body.description.trim();
  } else if (body.hasOwnProperty('description')) {
    return res.status(400).send();
  }

  _.extend(matchedTodo, validAttributes);
  res.json(matchedTodo);
});

db.sequelize.sync().then(function() {
  app.listen(PORT, function() {
    console.log('Express listening on port: ' + PORT);
  });
});
