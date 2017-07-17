var $ = jQuery.noConflict();

(function (window, document) {
    var showError = function(msg){
        $('#txt-error').html(msg);
        $('#txt-error').show();
    }

    var loading = {
        disable: function(obj, tmp){
            if(tmp){
                obj.attr('disabled','disabled');
            }else{
                obj.removeAttr('disabled');
            }

        },
    }

    var pp = {
        open: function(){
            $('body').addClass('modal-open');
            $('#loadding').show();
        },
        close: function(){
            $('body').removeClass('modal-open');
            $('#loadding').hide();
        }
    };

    function formatID(ID){
        if(ID.length >= 4) return ID;
        switch(ID.length){
            case 1: return "000" + ID;
            case 2: return "00" + ID;
            case 3: return "0" + ID;
            default: return "0000";
        }
    }

    if (window.PApp) return;

    window.PApp = {
        sendToYoutube: function(form){
            if(!form) return;
            loading.disable($(form).find('button'), true);
            pp.open();
            $.ajax({
                url: PCONF.API_URL + '/app/youtube-upload.php',
                type: 'POST',
                data: new FormData(form),
                dataType: "json",
                processData: false,
                contentType: false,
                error: function(jqXHR, textStatus, errorThrown) {
                    pp.close();
                    loading.disable($(form).find('button'), false);
                    showError("Không thể kết nối đến máy chủ.");
                },
                success: function (resp) {
                    loading.disable($(form).find('button'), false);
                    pp.close();
                    if(resp.error != 0){
                        showError(resp.msg);
                    }else{
                        $('.upload-video').removeClass('step-2');
                        $('.upload-success').show();
                        $('.upload-detail').hide();
                        $('.upload-success').find('#youtube-video-id').html(resp.data);
                        $('#aPlaylist').attr("href", "https://www.youtube.com/playlist?list=" + $('#role').val());
                    }
                }
            });
        },
        loadImg: function(obj){
            var file = obj[0].files;
            if (file && file[0]){
                var filerdr = new FileReader();
                filerdr.onload = function(e) {
                    $('.img-thumb').html('<img width="100%" height="200px" src="'+e.target.result+'" />');
                };
                filerdr.readAsDataURL(file[0]);
            }
        },
        init: function(){

            $(window).load(function(){
                $('.preloader').fadeOut(200);
            });

            $.get(PCONF.API_DB_URL + "/user/?reverse=true&offset=0&limit=1", function(resp){
                if(resp.status != "OK"){
                    alert("Hệ thống quản lý đang bận, vui lòng thử lại sau");
                    return;
                }
                var ID = resp.data[0].ID;
                var ID = Number(ID) + 1;
                $("#ID").val(formatID(ID.toString()));
            },"json");

            var testMobile;
            var isMobile = {
                Android: function() {
                    return navigator.userAgent.match(/Android/i);
                },
                BlackBerry: function() {
                    return navigator.userAgent.match(/BlackBerry/i);
                },
                iOS: function() {
                    return navigator.userAgent.match(/iPhone|iPad|iPod/i);
                },
                Opera: function() {
                    return navigator.userAgent.match(/Opera Mini/i);
                },
                Windows: function() {
                    return navigator.userAgent.match(/IEMobile/i);
                },
                any: function() {
                    return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
                }
            };

            $('ul.ul-support li a.t').click(function(e){
                var el = $(this).closest('li');
                var isNone = el.find('p').css('display');
                if(isNone == 'none'){
                    el.find('p').show();
                }else{
                    el.find('p').hide();
                }
            });

            var txtError = ' Trong trường hợp bị lỗi khi tải video lên, xem thêm câu hỏi số [3] mục hỏi đáp.';

            function log() {
                var str = "";

                plupload.each(arguments, function(arg) {
                    var row = "";

                    if (typeof(arg) != "string") {
                        plupload.each(arg, function(value, key) {
                            // Convert items in File objects to human readable form
                            if (arg instanceof plupload.File) {
                                // Convert status to human readable
                                switch (value) {
                                    case plupload.QUEUED:
                                        value = 'QUEUED';
                                        break;

                                    case plupload.UPLOADING:
                                        value = 'UPLOADING';
                                        break;

                                    case plupload.FAILED:
                                        value = 'FAILED';
                                        break;

                                    case plupload.DONE:
                                        value = 'DONE';
                                        break;
                                }
                            }

                            if (typeof(value) != "function") {
                                row += (row ? ', ' : '') + key + '=' + value;
                            }
                        });

                        str += row + " ";
                    } else {
                        str += arg + " ";
                    }
                });
                console.log(str);
            }

            var uploader = new plupload.Uploader({
                runtimes : 'html5,flash,silverlight,html4',
                browse_button : 'pickfile', // you can pass in id...
                url : PCONF.API_URL + '/app/upload.php',
                chunk_size : '1mb',
                unique_names : true,

                filters : {
                    max_file_size : '2G',
                    mime_types: [
                        {title : "Video files", extensions : "flv,avi,mp4,mov,webm,ogv,mpeg,mpg,m4p,m4v,wmv,3gp,vob,f4v,3gpp,mkv,ts,m2ts" }
                    ]
                },

                flash_swf_url : '../js/Moxie.swf',
                silverlight_xap_url : '../js/Moxie.xap',

                multi_selection: false,

                init : {

                    BeforeUpload: function(up, file) {
                        // Called right before the upload for a given file starts, can be used to cancel it if required
                        log('[BeforeUpload]', 'File: ', file);
                    },

                    UploadProgress: function(up, file) {
                        log('[UploadProgress]', 'File:', file, "Total:", up.total);
                        var txt = '';
                        if(file.percent == 100){
                            txt = ' - Đang xử lý...';
                        }
                        var percentVal = file.percent + '%';
                        $('#progress-bar').find('label').html('Đang tải lên video ('+percentVal+')' + txt);
                        $('#progress-bar').find('.progress-bar').width(percentVal).attr('aria-valuenow', file.percent);
                    },

                    FilesAdded: function(up, files) {
                        log('[FilesAdded]');

                        plupload.each(files, function(file) {
                            log('  File:', file);
                            up.start();
                        });

                        $('.upload-detail').show();
                        $('.container-upload').hide();
                        $('.upload-video').addClass('step-2');
                    },

                    FilesRemoved: function(up, files) {
                        // Called when files are removed from queue
                        log('[FilesRemoved]');

                        plupload.each(files, function(file) {
                            log('  File:', file);
                        });
                    },

                    FileUploaded: function(up, file, data) {
                        log('[UploadComplete]');
                        console.log(data);
                        var resp = JSON.parse(data.response);
                        if(resp.error != 0){
                            $('#progress-bar').html(resp.msg + ' <a href="/">Tải lại Video</a>' + txtError).css('color', '#e42647');
                        }else{
                            $('#progress-bar').find('label').html('Đang tải lên video (100%) - Hoàn tất');
                            $('#fileName').val(resp.data);
                            loading.disable($('.btn.btn-submit-upload'), false);
                        }
                    },

                    ChunkUploaded: function(up, file, info) {
                        // Called when file chunk has finished uploading
                        log('[ChunkUploaded] File:', file, "Info:", info);
                    },

                    UploadComplete: function(up, files) {
                        // Called when all files are either uploaded or failed
                        log('[UploadComplete]');
                    },

                    Destroy: function(up) {
                        // Called when uploader is destroyed
                        log('[Destroy] ');
                    },

                    Error: function(up, err) {
                        log('[Error] ', err);
                        $('.upload-detail').hide();
                        $('.container-upload').show();
                        $('.upload-video').removeClass('step-2');
                        $('.btn-upload').find('span.txt-error').html(err.message + txtError).show();
                    }
                }
            });

            uploader.init();
        }
    }

})(window, document);