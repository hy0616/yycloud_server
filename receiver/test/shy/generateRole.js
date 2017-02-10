/**
 * Created by shuyi on 15-12-25.
 */
var db = require('../../db/db').db,
  Promise = require('bluebird'),
  _ = require('lodash');

/*
setTimeout(function () {
  db.create('role',{
    name:'superadmin'
  });
  db.create('role',{
    name:'admin'
  });
  db.create('role',{
    name:'user'
  });
},1000)*/

setTimeout(function () {
  db.update('user',{role:'superadmin'},{username:'shuyi'})
    .then(function (record) {
      console.log(record);
    })
},1000)