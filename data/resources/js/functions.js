define(function (require) {
    "use strict";

    var $ = require('jquery');
    require('kendo');
    require('sjcl');
    require('json');

    var sjcl_user_password = "";

    var functions = function(password) {
        //var sjcl_user_password = $("#sjcl_password").val();
        var sjcl_user_password = password;

        this.encryptAjax = function(url, data, func) {
            return encryptAjax(url, data,  func);
        };

        function encryptAjax(url, data, func) {
            var encrypt_data = sjcl.encrypt(sjcl_user_password, JSON.stringify(data));
            $.ajax({
                type: "POST",
                url: url  + "?noCache=" + (new Date().getTime()) + Math.random(),
                data: encrypt_data,
                contentType: "application/json; charset=utf-8",
                dataType: "JSON"
            })
                .done(function(res) {
                    var result = sjcl.decrypt(sjcl_user_password, JSON.stringify(res));
                    func($.evalJSON(result));
                })
                .fail(function() {
                    func(false);
                });
        };

        this.decrypt = function(data) {
            return decrypt(data);
        };

        function decrypt(data) {
            return sjcl.decrypt(sjcl_user_password, data);
        };

        this.encrypt = function(data) {
            return encrypt(data);
        };

        function encrypt(data) {
            return sjcl.encrypt(sjcl_user_password, data);
        };

        this.formatDate = function(date) {
            return formatDate(date);
        };

        function formatDate(date) {
            var timestamp = new Date(date);
            var monthNames = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];
            if (timestamp.getMinutes() < 10) {
                var min = '0' + timestamp.getMinutes();
            } else {
                var min = timestamp.getMinutes() + '';
            }
            return timestamp.getHours() + ":" + min + ", " + timestamp.getDate() + "-" + monthNames[timestamp.getMonth()] + "-" + timestamp.getFullYear();
        };

        this.findEntities = function(id, text, func) {
            return findEntities(id, text, func);
        };

        function findEntities(id, text, func) {
            encryptAjax('/data/getEntity/', {id: id, text: text}, function(res) {
                var data = [];
                var dataContent = "";
                $.each(res, function(key, value){
                    var dataTemplateContent = $("#dataTemplate").html();
                    var dataTemplate = kendo.template(dataTemplateContent);
                    data = [
                        {
                            id: value.id,
                            name: value.title,
                            timestamp: formatDate(value.timestamp)
                        }
                    ];
                    dataContent = dataContent + kendo.render(dataTemplate, data);
                });

                func(dataContent);
            })
        };

        this.findWord = function(id, entity, text) {
            return findWord(id, entity, text);
        };

        function findWord(id, entity, text) {
            findEntities(id, text, function(dataContent) {
                entity.find(".result").html(dataContent);

                $(".dataList:odd").addClass("k-alt");
            });
        };

        this.getEntity = function(id) {
            return getEntity(id);
        };

        function getEntity(id) {
            encryptAjax('/data/getEntities/', {parent: id}, function(res) {
                $("#structure").html("");
                $.each(res, function(key, val) {
                    var templateContent = $("#entityListTemplate").html();
                    var template = kendo.template(templateContent);
                    var data = [
                        {
                            id: val.id,
                            name: val.name,
                            timestamp: formatDate(val.timestamp)
                        }
                    ];
                    var result = kendo.render(template, data);

                    $("#structure").append(result);

                    $(".entityList:odd").addClass("k-alt");
                });

                $("#curSection").val(id);
            })
        }
    };

    return functions;
});