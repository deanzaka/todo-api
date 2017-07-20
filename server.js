var express = require('express');
var app = express();
var PORT = process.env.PORT || 3000;
var todos = [{
  id: 1,
  description: 'Do something here',
  completed: false
}, {
  id: 2,
  description: 'Do another thing here',
  completed: false
}, {
  id: 3,
  description: 'Here they are another one',
  completed: true
}];

app.get('/', function (req, res) {
  res.send('Todo API Root');
});

// GET /todos
app.get('/todos', function (req, res) {
  res.json(todos);
});
// GET /todos/:id
app.get('/todos/:id', function (req, res) {
  var todoId = parseInt(req.params.id, 10);
  todos.forEach(function(todo) {
    if(todo.id === todoId) {
      res.json(todo);
    }
  });
  res.status(404).send();
});

app.listen(PORT, function() {
  console.log('Express listening on port: ' + PORT);
});
