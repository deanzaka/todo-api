var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');
var bcrypt = require('bcrypt');
var middleware = require('./middleware.js')(db);

var app = express();
var PORT = process.env.PORT || 3000;
var todos = [];
var todoNextId = 1;

app.use(bodyParser.json());

app.get('/', function (req, res) {
  res.send('Todo API Root');
});

// GET /todos?completed=true&q=keyword
app.get('/todos', middleware.requireAuthentication, function (req, res) {
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
app.get('/todos/:id', middleware.requireAuthentication, function (req, res) {
  var todoId = parseInt(req.params.id, 10);
  db.todo.findById(todoId).then(function(todo) {
    if(todo) {
      res.json(todo.toJSON());
    } else {
      res.status(404).send("No to do found for supplied Id");
    }
  }, function(e) {
    res.status(500).send(e);
  });
});

// POST /todos
app.post('/todos', middleware.requireAuthentication, function(req, res) {
  var body = _.pick(req.body, 'description', 'completed');

  body.description = body.description.trim();

  db.todo.create(body).then(function(todo) {
    res.json(todo.toJSON());
  }, function (e) {
    res.status(400).json(e);
  });

});

// DELETE /todos/:id
app.delete('/todos/:id', middleware.requireAuthentication, function(req, res) {
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
app.put('/todos/:id', middleware.requireAuthentication, function(req, res) {
  var todoId = parseInt(req.params.id, 10);
  var body = _.pick(req.body, 'description', 'completed');
  var attributes = {};

  if(body.hasOwnProperty('completed')) {
    attributes.completed = body.completed;
  }

  if(body.hasOwnProperty('description')) {
    attributes.description = body.description.trim();
  }

  db.todo.findById(todoId).then(function(todo){
    if(todo) {
      todo.update(attributes).then(function(todo) {
        res.json(todo.toJSON());
      }, function(e) {
        res.status(400).json(e);
      });
    } else {
      res.status(404).send();
    }
  }, function(e) {
    res.status(500).json(e);
  });
});

// POST /users
app.post('/users', function(req, res) {
  var body = _.pick(req.body, 'password', 'email');

  db.user.create(body).then(function(user) {
    res.json(user.toPublicJSON());
  }, function (e) {
    res.status(400).json(e);
  });
});

// POST /users/login
app.post('/users/login', function(req, res) {
  var body = _.pick(req.body, 'password', 'email');

  db.user.authenticate(body).then(function(user){
    var token = user.generateToken('authentication');

    if(token) {
      res.header('Auth', token).json(user.toPublicJSON());
    } else {
      res.status(401).send();
    }
  }, function() {
    res.status(401).send();
  });
});

db.sequelize.sync({
  force: true
}).then(function() {
  app.listen(PORT, function() {
    console.log('Express listening on port: ' + PORT);
  });
});
