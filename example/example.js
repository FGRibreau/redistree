var redis      = require('redis').createClient();
var RedisTree  = require('../redistree');
var t          = new RedisTree(redis);

// Load a sample tree
var sampleTree = require('./schema');


/**
 * Save and load `sampleTree` from Redis
 *
 * RedisTree will send the following commands to save the tree
 * - sadd label1 label2 label3
 * - sadd label2 label4
 *
 * RedisTree will send the following commands to load the tree
 * - smembers label1
 * - smembers label2
 * - smembers label3
 * - smembers label4
 *
 * If the tree already exists in Redis we could have directly called "t.load()"
 */
t.save(sampleTree, function(err){
  console.log('The tree was saved in Redis', err ? err : '');
  // or ... retrieve it starting at "label1"
  t.load('label1', function(err, tree){
    console.log("The tree was retrieved from Redis === ", JSON.stringify(tree, null, 1));
  });
});
