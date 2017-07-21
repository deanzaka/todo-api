var Sequelize = require('sequelize');
var sequelize = new Sequelize(undefined, undefined, undefined, {
  'dialect': 'sqlite',
  'storage': __dirname + '/basic-sqlite-database.sqlite'
});

var Todo = sequelize.define('todo', {
  description: {
    type: Sequelize.STRING,
    allowNull: false,
    validate: {
      len: [1, 250]
    }
  },
  completed: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false
  }
});

sequelize.sync({
  // force: true
}).then(function() {
  console.log('Everything is synced');

  Todo.findById(2).then(function(todo) {
    if (todo) {
      console.log('Here we go');
      console.log(todo.toJSON());
    } else {
      console.log('No todo found by that Id');
    }
  });


  // Todo.create({
  //   description: 'Do something here',
  //   completed: false
  // }).then(function() {
  //   return Todo.create({
  //     description: 'Learn to code better'
  //   });
  // }).then(function() {
  //   // return Todo.findById(1);
  //   return Todo.findAll({
  //     where: {
  //       description: {
  //         $like: '%code%'
  //       }
  //     }
  //   });
  // }).then(function(todos) {
  //   if(todos) {
  //     todos.forEach(function(todo) {
  //       console.log(todo.toJSON());
  //     });
  //   } else {
  //     console.log('no todo found');
  //   }
  // }).catch(function (e) {
  //   console.log(e);
  // });
});
