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
  var query = req.query;
  var where = {};

  if(query.hasOwnProperty('completed')) {
      where.completed = (query.completed.toLowerCase() === "true");
  }
  if(query.hasOwnProperty('q') && query.q.length > 0) {
    where.description = { $like: '%' + query.q + '%' };
  }

  db.todo.findAll({
    where: where
  }).then(function(todos) {
    res.json(todos);
  }, function (e) {
    res.status(500).send(e);
  });
});

// GET /todos/:id
app.get('/todos/:id', function (req, res) {
  var todoId = parseInt(req.params.id, 10);
  db.todo.findById(todoId).then(function(todo) {
    if(!!todo) {
      res.json(todo.toJSON());
    } else {
      res.status(404).send("No to do found for supplied Id");
    }
  }, function(e) {
    res.status(500).send(e);
  });
});

// POST /todo
app.post('/todos', function(req, res) {
  var body = _.pick(req.body, 'description', 'completed');

  body.description = body.description.trim();

  db.todo.create(body).then(function(todo) {
    res.json(todo.toJSON());
  }, function (e) {
    res.status(400).json(e);
  });

});

// DELETE /todos/:id
app.delete('/todos/:id', function(req, res) {
  var todoId = parseInt(req.params.id, 10);
  db.todo.destroy({
    where: {
      id: todoId
    }
  }).then(function(todo) {
    if(todo > 0) {
      res.status(204);
    } else {
      res.status(404).json({
        error: "id not found"
      });
    }
  }, function(e) {
    res.status(500).json(e);
  });
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
