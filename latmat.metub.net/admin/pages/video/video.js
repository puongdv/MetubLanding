/**
 * Render Print Sorting page
 */
(function () {    
    MODULE.exports({
        name: "pages/video",
        module: {
            render: function () {
                UI.render({
                    module: this,
                    template: "video",
                    data: {                        
                        CONF: CONF
                    },
                    callback: function(){      
                        $('title').html("Danh sách Video - Metub");
                        let q = PAGE.getQuery();
                        let page = !q.page ? 1 : Number(q.page);
                        let limit = !q.limit ? 20 : Number(q.limit);
                        let offset = (page-1)*limit;

                        API.call({
                            method: "GET",
                            url: "/video?offset="+offset+"&limit="+limit,
                            dataType: "json",
                            success: function(resp){
                                console.log(resp);
                                if(resp.status = "OK"){
                                    let videoList = resp.data;
                                    PAPP.renderPaginate(resp.total, limit, videoList, page, 'video');
                                    PAPP.renderVideo(videoList);
                                }else{
                                    $('.panel.panel-flat').html(resp.message);
                                }
                            },
                            error: function(){
                                MODULE.requires("notify", function (module) {
                                    module.render({status: "error", msg: "&nbsp; Có lỗi xảy ra, vui lòng thử lại sau!"});
                                });
                            }
                        });
                    }
                });
            }
        }, 
        dependencies: ["video.html"]
    });
})();