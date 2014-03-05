document.executeOnce('/sincerity/classes/')
document.executeOnce('/sincerity/templates/')

document.require('/prudence/resources/')
document.require('/sincerity/json/')

document.executeOnce('/model/data/')
document.executeOnce('/model/sjcl/')

AppResource = Sincerity.Classes.define(function() {

    var sjcl_user_password = String(application.globals.get('sjcl.password'))

    Public.handleInit = function(conversation) {
        conversation.addMediaTypeByName('application/json')
    }

    Public.handlePost = function(conversation) {
        var action = conversation.locals.get('action')

        var query = Public.queryGet(conversation)

        if (action == "check") {

            return Public.encrypt(JSON.stringify(true))

        } else if (action == "addSection") {

            return Public.encrypt(addSection(query["name"], query["parent"]))

        } else if (action == "rmSection") {

            return Public.encrypt(rmSection(query["id"]))

        } else if (action == "getFs") {

            if (!query["id"]) {
                var json = {
                    text: "/",
                    id: "0",
                    expanded: true,
                    hasChildren: true,
                    spriteCssClass: "rootfolder"
                }

                return Public.encrypt("[" + Sincerity.JSON.to(json) + "]")

            } else {
                return Public.encrypt(fs(query["id"]))
            }

        } else if (action == "getEntities") {

            return Public.encrypt(getEntities(query["parent"]))

        } else if (action == "getEntity") {

            return Public.encrypt(getEntity(query["id"], query["text"]))

        } else if (action == "addEntity") {

            return Public.encrypt(addEntity(query["name"], query["parent"]))

        } else if (action == "rmEntity") {

            return Public.encrypt(rmEntity(query["id"]))

        } else if (action == "getEntityData") {

            return Public.encrypt(getEntityData(query["id"]))

        } else if (action == "addEntityData") {

            return Public.encrypt(saveEntityData(query["entity"], query["title"], query["text"]))

        } else if (action == "rmEntityData") {

            return Public.encrypt(rmEntityData(query["id"]))

        } else if (action == "editEntityData") {

            return Public.encrypt(editEntityData(query["id"], query["title"], query["text"]))

        }

    }

    Public.queryGet = function(conversation) {
        var query_string = JSON.parse(Public.decrypt(JSON.stringify(Prudence.Resources.getEntity(conversation, 'json'))))

        var query = new Array()
        for ( var key in query_string ) {
            query[key] = String(query_string[key])
        }

        return query
    }

    Public.encrypt = function(data) {
        return sjcl.encrypt(sjcl_user_password, String(data))
    }

    Public.decrypt = function(data) {
        return sjcl.decrypt(sjcl_user_password, data)
    }

    return Public
}())