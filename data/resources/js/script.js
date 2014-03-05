define(function (require) {
    "use strict";

    var $ = require('jquery');
    require('kendo');
    var loadImage = require('loadImage');

    var functions = require('/js/functions');

    var init = function(dataFunctions) {

        var tabStripElement = $("#panel").kendoTabStrip({
                animation:  {
                    open: {
                        duration: 0
                    }
                }
            }),
            tabStrip = tabStripElement.data("kendoTabStrip");

        var expandContentDivs = function(divs) {
            var tabStripElement = $("#panel");
            divs.css("min-height", tabStripElement.innerHeight() - tabStripElement.children(".k-tabstrip-items").outerHeight() - 16);
        }

        var resizeAll = function() {
            expandContentDivs(tabStripElement.children(".k-content"));
        }

        resizeAll();

        $(window).resize(function(){
            resizeAll();
        });

        var fs = new kendo.data.HierarchicalDataSource({
            transport: {
                read: function(options) {
                    var fs_url = "/data/getFs/";
                    if (options.data.id) {
                        var data = {id: options.data.id};
                    } else {
                        var data = {};
                    }
                    dataFunctions.encryptAjax(fs_url, data, function(json) {
                        options.success(json);
                    });
                }
            },
            schema: {}
        });

        $("#treeview").kendoTreeView({
            dataSource: fs,
            select: function(e) {
                var data = $('#treeview').data('kendoTreeView').dataItem(e.node);

                dataFunctions.getEntity(data.id);
            },
            animation: {
                expand: {
                    duration: 0,
                    hide: false,
                    show: false
                },
                collapse: {
                    duration: 0,
                    show: false
                }
            },
            expand: function(e) {
                var dataItem = this.dataItem(e.node);
                dataItem.loaded(false);
            }
        });










        /*
        * Functions
        */

        $("body").on("click", "#newSection", function(){
            var name = prompt('Section name:', '');
            if ( (name) && (name != '') ) {
                var data = {
                    name: name,
                    parent: $("#curSection").val()
                }
                dataFunctions.encryptAjax('/data/addSection/', data, function(res) {
                    var treeview = $('#treeview').data('kendoTreeView');
                    var selectedNode = treeview.select();
                    treeview.append({
                        id: res.id,
                        text: name,
                        spriteCssClass: "folder"
                    }, selectedNode);
                })
            }
        });

        $("body").on("click", "#rmSection", function(){
            var treeview = $('#treeview').data('kendoTreeView');
            var selectedNode = treeview.select();
            var id = treeview.dataItem(selectedNode).id;

            dataFunctions.encryptAjax('/data/rmSection/', {id: id}, function(res) {
                treeview.remove(selectedNode);
            })
        });

        $("body").on("click", "#newEntity", function(){
            var name = prompt('Entity name:', '')
            if ( (name) && (name != '') ) {
                var data = {
                    name: name,
                    parent: $("#curSection").val()
                }
                dataFunctions.encryptAjax('/data/addEntity/', data, function(res) {
                    var templateContent = $("#entityListTemplate").html();
                    var template = kendo.template(templateContent);
                    var data = [
                        {
                            id: res.id,
                            name: name,
                            timestamp: dataFunctions.formatDate(res.timestamp)
                        }
                    ];
                    var result = kendo.render(template, data);

                    $("#structure").append(result);

                    $(".entityList:odd").addClass("k-alt");
                })
            }
        });

        $("body").on("click", ".rmEntity", function(){
            var entity = $(this).closest(".entity");
            var id = entity.attr("data-id");

            dataFunctions.encryptAjax('/data/rmEntity/', {id: id}, function(res) {
                var panel = tabStripElement.data("kendoTabStrip");
                var tab = panel.select();
                panel.remove(tab);
                panel.select(0);

                $("#structure").find(".entityListName > a[data-id='" + id + "']").closest(".entityList").remove();
            });
        });

        $("body").on("click", ".entityListName > a", function(){
            var id = $(this).attr("data-id");
            var name = $(this).text();

            dataFunctions.findEntities(id, "", function(dataContent){
                var templateContent = $("#entityTemplate").html();
                var template = kendo.template(templateContent);
                var data = [
                    {
                        id: id,
                        data: dataContent
                    }
                ];
                var content = kendo.render(template, data);

                var tabStripElement = $("#panel");
                var panel = tabStripElement.data("kendoTabStrip");
                if ($(".entity[data-id='" + id + "']").width() === null) {
                    panel.append({
                        text: name,
                        content: content
                    });
                    panel.select("li:last");
                    expandContentDivs(tabStripElement.children(".k-content").last());

                    $(".dataList:odd").addClass("k-alt");
                }
            });
        });

        $("body").on("keypress", ".search", function(e){
            var code = e.keyCode || e.which;
            if(code == 13) {
                var entity = $(this).closest(".entity");
                var id = entity.attr("data-id");

                dataFunctions.findWord(id, entity, $(this).val());
            }
        });

        $("body").on("click", ".searchDo", function(e){
            var entity = $(this).closest(".entity");
            var id = entity.attr("data-id");
            var text = $(this).closest(".entity").find(".search").val();

            dataFunctions.findWord(id, entity, text);
        });

        $("body").on("click", ".closeEntity", function(){
            var panel = tabStripElement.data("kendoTabStrip");
            var tab = panel.select();
            panel.remove(tab);
            panel.select(0);
        });


        $("body").on("click", ".newData", function(){
            var template = kendo.template($("#dataComposerWindowTemplate").html());
            $("body").append(template([]));

            $("#dataComposer").kendoWindow({
                width: "700px",
                height: "485px",
                resizable: false,
                modal: true,
                title: "New data",
                close: function(e) {
                    $('.k-window, .k-overlay').remove();
                },
                actions: [
                    "Close"
                ]
            });
            $("#dataComposer").data("kendoWindow").center().open();

            $("#dataEditor").kendoEditor({
                tools: [
                    "bold",
                    "italic",
                    "underline",
                    "strikethrough",
                    "justifyLeft",
                    "justifyCenter",
                    "justifyRight",
                    "justifyFull",
                    "insertUnorderedList",
                    "insertOrderedList",
                    "indent",
                    "outdent",
                    "createLink",
                    "unlink",
                    "insertImage",
                    "subscript",
                    "superscript",
                    "createTable",
                    "addRowAbove",
                    "addRowBelow",
                    "addColumnLeft",
                    "addColumnRight",
                    "deleteRow",
                    "deleteColumn",
                    "viewHtml",
                    "formatting",
                    "fontName",
                    "fontSize",
                    "foreColor",
                    "backColor"
                ]
            });
        });

        $("body").on("click", "#saveData", function(){
            var editor = $("#dataEditor").data("kendoEditor");
            var text = editor.value();

            var title = $("#dataTitle").val();

            var panel = $("#panel").kendoTabStrip().data("kendoTabStrip");
            var entity_id = panel.contentHolder(panel.select().index()).find(".entity").attr("data-id");

            if ( (title != "") && (text != "") ) {
                var data = {
                    text: text,
                    title: title,
                    entity: entity_id
                };
                dataFunctions.encryptAjax('/data/addEntityData/', data, function(res) {
                    $("#dataComposer").data("kendoWindow").close();

                    var dataTemplateContent = $("#dataTemplate").html();
                    var dataTemplate = kendo.template(dataTemplateContent);
                    data = [
                        {
                            id: res.id,
                            name: title,
                            timestamp: dataFunctions.formatDate(res.timestamp)
                        }
                    ];
                    var dataContent = kendo.render(dataTemplate, data);

                    $(".entity[data-id='"+entity_id+"'] > .result").append(dataContent);

                    $(".dataList:odd").addClass("k-alt");
                })
            }
        });

        $("body").on("click", "#editData", function(){
            var editor = $("#dataEditor").data("kendoEditor");
            var text = editor.value();

            var title = $("#dataTitle").val();

            var data_entity_id = $("#dataEntityId").val();

            if ( (title != "") && (text != "") ) {
                var data = {
                    text: text,
                    title: title,
                    id: data_entity_id
                };
                dataFunctions.encryptAjax('/data/editEntityData/', data, function(res) {
                    $("#dataEdit").data("kendoWindow").close();

                    var dataTemplateContent = $("#dataTemplate").html();
                    var dataTemplate = kendo.template(dataTemplateContent);
                    data = [
                        {
                            id: data_entity_id,
                            name: title,
                            timestamp: dataFunctions.formatDate(new Date())
                        }
                    ];
                    var dataContent = kendo.render(dataTemplate, data);

                    $(".result").find(".dataListName > a[data-id='" + data_entity_id + "']").closest(".dataList").html($(dataContent).html());

                    $(".dataList:odd").addClass("k-alt");
                })
            }
        });

        $("body").on("click", ".dataListName > a", function(){
            var template = kendo.template($("#dataViewWindowTemplate").html());
            var data = [
                {
                    id: $(this).attr("data-id")
                }
            ];
            var content = kendo.render(template, data);
            $("body").append(content);

            dataFunctions.encryptAjax('/data/getEntityData/', {id: $(this).attr("data-id")}, function(res) {
                $("#dataConent").append(res.text);
                $("#dataView").kendoWindow({
                    width: "700px",
                    height: "480px",
                    resizable: false,
                    modal: true,
                    title: res.title,
                    close: function(e) {
                        $('.k-window, .k-overlay').remove();
                    },
                    actions: [
                        "Maximize",
                        "Close"
                    ]
                });
                $("#dataView").data("kendoWindow").center().open();
            })
        });

        $("body").on("click", "#rmEntityData", function() {
            var id = $(this).attr("data-id");

            dataFunctions.encryptAjax('/data/rmEntityData/', {id: id}, function(res) {
                $(".result").find(".dataListName > a[data-id='" + id + "']").closest(".dataList").remove();

                $("#dataView").data("kendoWindow").close();
            });
        });

        $("body").on("click", "#editEntityData", function() {
            var id = $(this).attr("data-id");

            $("#dataView").data("kendoWindow").close();

            dataFunctions.encryptAjax('/data/getEntityData/', {id: id}, function(res) {
                var template = kendo.template($("#dataEditWindowTemplate").html());
                var data = [
                    {
                        id: id,
                        title: res.title,
                        text: res.text
                    }
                ];
                var content = kendo.render(template, data);
                $("body").append(content);

                $("#dataEdit").kendoWindow({
                    width: "700px",
                    height: "485px",
                    resizable: false,
                    modal: true,
                    title: "Edit data",
                    close: function(e) {
                        $('.k-window, .k-overlay').remove();
                    },
                    actions: [
                        "Close"
                    ]
                });
                $("#dataEdit").data("kendoWindow").center().open();

                $("#dataEditor").kendoEditor({
                    tools: [
                        "bold",
                        "italic",
                        "underline",
                        "strikethrough",
                        "justifyLeft",
                        "justifyCenter",
                        "justifyRight",
                        "justifyFull",
                        "insertUnorderedList",
                        "insertOrderedList",
                        "indent",
                        "outdent",
                        "createLink",
                        "unlink",
                        "insertImage",
                        "subscript",
                        "superscript",
                        "createTable",
                        "addRowAbove",
                        "addRowBelow",
                        "addColumnLeft",
                        "addColumnRight",
                        "deleteRow",
                        "deleteColumn",
                        "viewHtml",
                        "formatting",
                        "fontName",
                        "fontSize",
                        "foreColor",
                        "backColor"
                    ]
                });
            });



        });

    };

    return init;
});