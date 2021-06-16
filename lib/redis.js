'use strict';

var redis = require('ioredis');
var env = process.env.NODE_ENV || 'development';
var config = [{
  host: '127.0.0.1',
  port: '6379',
  password: '',
  db:1
},
  {
  host: '127.0.0.1',
  port: '6380',
  password: '',
  db:1
}]
if(config.length == 1){
  var db = redis.createClient(config[0])
  }else{
    redis = new Redis.Cluster(clients);
  }



// db.select(6);

module.exports = db;
