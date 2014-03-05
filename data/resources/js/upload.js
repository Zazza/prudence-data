<script type="text/x-kendo-template" id="uploaderWindowTemplate">
    <div id="dataUploader" style="display: none;">
        <input name="files" id="files" type="file" />
    </div>
</script>

<script type="text/x-kendo-template" id="fileUploadTemplate">
    <ul class="k-upload-files k-reset">
        <li class="k-file u_#: name #">
            <span class="k-icon k-success">uploaded</span>
            <span class="k-filename" title="#: name #">
                <span class="uploader-long-name">#: name #</span>
                <div class="upload-status">
                    <div class="upload-status-progress" style="width: 0%;"></div>
                </div>
            </span>
        </span>
        <button class="k-button k-button-icontext k-upload-action uploaderRemove" data-id="#: name #" type="button" title="Stop">
            <i class="icon-stop"></i>
        </button>
    </li>
</ul>
</script>

$("body").on("click", "#upload", function(){
    var template = kendo.template($("#uploaderWindowTemplate").html());
    $("body").append(template([]));

    $("#dataUploader").kendoWindow({
        width: "700px",
        height: "485px",
        resizable: false,
        modal: true,
        title: "Uploader",
        close: function(e) {
            $('.k-window, .k-overlay').remove();
        },
        actions: [
            "Close"
        ]
    });
    $("#dataUploader").data("kendoWindow").center().open();

    $("#files").kendoUpload({
        showFileList: false,
        select: function(e) {
            var files = e.files;

            $.each(files, function(key, file) {
                sendFile(file);
            });
        }
    });
});

function isImage(type) {
    if (
        (type == "image/gif") &&
            (type == "image/jpeg") &&
            (type == "image/pjpeg") &&
            (type == "image/png") &&
            (type == "image/svg+xml") &&
            (type == "image/tiff") &&
            (type == "image/vnd.microsoft.icon") &&
            (type == "image/vnd.wap.wbmp")
        ) {
        return true;
    } else {
        return false;
    }
}

function addThumb(file, id) {
    loadImage(
        file.rawFile,
        function (img) {
            $.ajax({ type: "POST", url: '/data/thumb/' + id + '/', data: img.toDataURL().replace(/data:image\/png;base64,/, '') })
                .done(function(){
//                            addFileToFS(res);
                })
        },
        {
            maxHeight: 80,
            canvas: true
        }
    )
}

function sendFile(file) {
    var uri = "/data/save/";

    var xhr = new XMLHttpRequest();
    xhr.open("POST", uri, true);
    var fd = new FormData();

    if (xhr.upload) {
        // Overlay uploader
        var templateContent = $("#fileUploadTemplate").html();
        var template = kendo.template(templateContent);
        var data = [
            { name: file.rawFile.name }
        ];
        var result = kendo.render(template, data);
        $(".perc").append(result);


        xhr.upload.addEventListener("progress", function(e) {
            var pc = parseInt(e.loaded / e.total * 100);
            $(".upload-status-progress", ".u_" + file.rawFile.name).css("width", pc);
        }, false);


        xhr.onreadystatechange = function(e) {
            if (xhr.readyState == 4) {
                $(".upload-status-progress", ".u_" + file.rawFile.name).css("width", "100%");
            }
        };

        $(".perc").on("click", ".uploaderRemove", function() {
            xhr.abort();
        });


        fd.append('file', file.rawFile);
        fd.append('name', file.rawFile.name);
        xhr.send(fd);
    }

    if (isImage(file.rawFile.type)) {
        addThumb(file, id);
    }
};