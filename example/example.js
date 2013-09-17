var redis = require('redis').createClient();
// Load the library
var RedisTree = require('../redistree');
// Load a sampleTree
var sampleTree = require('./schema');

var t = new RedisTree(redis);

/**
 * Save the sampleTree
 * RedisTree will send the following commands:
 * - sadd label1 label2 label3
 * - sadd label2 label4
 *
 * If the tree already exists in Redis we could directly call "t.load()"
 */
t.save(sampleTree, function(err){
  console.log('SampleTree was saved in Redis', err ? err : '');
  // or ... retrieve it starting at "label1"
  t.load('label1', function(err, tree){
    console.log("SampleTree was retrieved from Redis === ", JSON.stringify(tree, null, 1));
  });
});
