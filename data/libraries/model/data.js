importClass(com.mongodb.Mongo)
importClass(com.mongodb.jvm.BSON)

var Public = {}
var connection = new Mongo()
var db = connection.getDB('data')

function hasChildren(parent) {
    var collection = db.getCollection('section')

    var query = {parent: parent.toString()}
    var data = BSON.from(collection.find(BSON.to(query)).toArray())
    var count = data.length

    if (count == 0) {
        return false
    } else {
        return true
    }
}

function fs(id) {
    var collection = db.getCollection('section')

    var query = {parent: id}
    var sort = {name: 1}
    var nodes = BSON.from(collection.find(BSON.to(query)).sort(BSON.to(sort)).toArray())

    var tree = new Array()

    for (var i = 0; i < nodes.length; i++) {
        tree[i] = {
            text: nodes[i]["name"],
            id: nodes[i]["_id"].toString(),
            hasChildren: hasChildren(nodes[i]["_id"]),
            spriteCssClass: "folder"
        }
    }

    return Sincerity.JSON.to(tree)
}

function addSection(name, parent) {
    var collection = db.getCollection('section')

    var query = {name: name, parent: parent, timestamp: new Date()}
    var bson = BSON.to(query)
    var result = collection.insert(bson)

    return Sincerity.JSON.to({ id: bson.get('_id').toString() })
}

function rmSection(id) {
    var collection = db.getCollection('section')

    var query = {_id: {$oid: id}}
    collection.remove(BSON.to(query))

    return true
}

function addEntity(name, parent) {
    var collection = db.getCollection('entity')

    var query = {name: name, parent: parent, timestamp: new Date()}
    var bson = BSON.to(query)
    collection.insert(bson)

    return Sincerity.JSON.to({ id: bson.get('_id').toString(), timestamp: query.timestamp.toString() })
}

function rmEntity(id) {
    var collection = db.getCollection('entity')

    var query = {_id: {$oid: id}}
    collection.remove(BSON.to(query))

    return true
}

function getEntities(parent) {
    var collection = db.getCollection('entity')

    var query = {parent: parent}
    var sort = {name: 1}
    var data = BSON.from(collection.find(BSON.to(query)).sort(BSON.to(sort)).toArray())

    var tree = new Array()

    for (var i = 0; i < data.length; i++) {
        tree[i] = {
            name: data[i]["name"],
            id: data[i]["_id"].toString(),
            timestamp: data[i]["timestamp"].toString()
        }
    }

    return Sincerity.JSON.to(tree)
}

function getEntity(id, text) {
    var collection = db.getCollection('data')

    var query = {entity: id.toString(), text: { $regex: text}}
    var data = BSON.from(collection.find(BSON.to(query)).toArray())

    var tree = new Array()

    for (var i = 0; i < data.length; i++) {
        tree[i] = {
            id: data[i]["_id"].toString(),
            title: data[i]["title"],
            timestamp: data[i]["timestamp"].toString()
        }
    }

    return Sincerity.JSON.to(tree)
}

function saveEntityData(entity, title, text) {
    var collection = db.getCollection('data')

    var query = {entity: entity, title: title, text: text, timestamp: new Date()}
    var bson = BSON.to(query)
    collection.insert(bson)

    return Sincerity.JSON.to({ id: bson.get('_id').toString(), timestamp: query.timestamp.toString() })
}

function getEntityData(id) {
    var collection = db.getCollection('data')

    var query = {_id: {$oid: id}}
    var content = BSON.from(collection.findOne(BSON.to(query)))

    return Sincerity.JSON.to(content)
}

function rmEntityData(id) {
    var collection = db.getCollection('data')

    var query = {_id: {$oid: id}}
    collection.remove(BSON.to(query))

    return true
}

function editEntityData(id, title, text) {
    var collection = db.getCollection('data')

    var where = {_id: {$oid: id}}
    var update = {$set: {title: title, text: text, timestamp: new Date()}}

    collection.update(BSON.to(where), BSON.to(update), false, false)

    return true
}