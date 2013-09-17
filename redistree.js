var _     = require('lodash');
var async = require('async');

/**
 * RedisTree
 * @param {Object} redisClient redis client (node_redis)
 */
function RedisTree(redisClient){this.redis = redisClient;}

/**
 * Iteratively & asynchronously retrieve an item from Redis
 * @param  {String} label label name (set name)
 * @param  {Function} f(err, arrayOfItems)
 */
RedisTree.prototype._getItem = function(label, f) {
  var parent = _.isArray(_.last(arguments)) ? _.last(arguments) : [];

  this.members(label, function(err, cards){
    var item = {
      label: this.label(label),
      parents: []
    };
    parent.push(item);

    if(cards.length === 0){return f(null, parent);}
    async.map(cards, _.partialRight(this._getItem.bind(this), item.parents), function(e){f(e, parent);});
  }.bind(this));
};

RedisTree.prototype._saveItem = function(item, f) {
  var labels = _.pluck(item.parents, 'label');
  if(labels.length === 0){return f();}

  this.addMembers(item.label, labels, function(err){
    if(err){return f(err);}
    this._saveItems(item.parents, f);
  }.bind(this));
};

/**
 *
 * @param  {Array} arrToSave array of items
 * @param  {Function} f(err)
 */
RedisTree.prototype._saveItems = function(arrToSave, f) {
  async.forEach(arrToSave, this._saveItem.bind(this), f);
};

/**
 * Retrieve a name from the label
 * Can be overridden to provide namespace support
 * e.g. return label.substring(2);
 * @return {String} human readable label
 */
RedisTree.prototype.label = function(label){return label;};

/**
 * Retrieve every members of the `label` set from redis
 * Can be overridden to provide namespace support
 * e.g. redis.smembers('ns.'+label, f);
 * @param {String} label
 */
RedisTree.prototype.members = function(label, f) {
  console.log('smembers '+label);
  this.redis.smembers(label, f);
};

/**
 * Store members `labels` into the `label` set
 * @param {} label  [description]
 * @param {[type]} labels [description]
 * @param {[type]} f      [description]
 */
RedisTree.prototype.addMembers = function(label, labels, f) {
  this.redis.sadd(label, labels, f);
};

/**
 * Load a tree from Redis
 * @param  {String} startLabel Were to start
 * @param  {Function} f(err, tree)
 */
RedisTree.prototype.load = function(startLabel, f){this._getItem(startLabel, f);};

/**
 * Save a tree from Redis
 * @param  {Array} treeArray
 * @param  {Function} f(err, tree)
 */
RedisTree.prototype.save = function(treeArray, f){this._saveItems(treeArray, f);};

module.exports = RedisTree;
