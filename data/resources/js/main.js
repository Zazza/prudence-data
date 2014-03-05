require.config({
    waitSeconds: 30,
    paths: {
        jquery: '/js/jquery-1.10.1.min',
        kendo: '/kendo/js/kendo.web.min',
        sjcl: '/js/sjcl',
        json: '/js/jquery.json-2.4.min',
        loadImage: '/js/load-image'
    }
});

define(function (require) {
    var $ = require('jquery');

    var functions = require('/js/functions');
    var init = require('/js/script');

    $(document).ready(function() {

        $("body").on("keypress", "#sjcl_password", function(e){
            var code = e.keyCode || e.which;
            if(code == 13) {
                login($(this).val());
            }
        });

        $("body").on("click", "#btn-login", function(e){
            login($("#sjcl_password").val());
        });

        function login(password) {
            var dataFunctions = new functions(password);

            dataFunctions.encryptAjax("/data/check/", {}, function(json) {
                if (json !== false) {
                    $("#dataContent").show();
                    $("#password-form").remove();

                    var t = new init(dataFunctions);
                }
            });
        }
    });
});