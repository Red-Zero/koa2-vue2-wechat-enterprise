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
   db.del = async key => {
  const masters = redis.nodes("master");
  await Promise.all(
    masters.map(async node => {
      try {
        await node.del(key);
      } catch (error) {
        // 当key在另外的节点上，会报如下错误：”MOVED 7767 10.76.230.153:6380“
        if (error.message.indexOf("MOVED") === -1) {
          throw error;
        }
      }
    })
  );
};

  }else{
    redis = new Redis.Cluster(clients);
  }


// db.select(6);

module.exports = db;
