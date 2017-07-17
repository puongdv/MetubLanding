/**
 * Render Print Sorting page
 */
(function () {    
    MODULE.exports({
        name: "pages/home",
        module: {
            render: function () {
                UI.render({
                    module: this,
                    template: "home",
                    data: {                        
                        CONF: CONF
                    },
                    callback: function(){      
                        $('title').html("Danh sách User - Metub");
                        let q = PAGE.getQuery();
                        let page = !q.page ? 1 : Number(q.page);
                        let limit = !q.limit ? 20 : Number(q.limit);
                        let offset = (page-1)*limit;

                        API.call({
                            method: "GET",
                            url: "/user?offset="+offset+"&limit="+limit,
                            dataType: "json",
                            success: function(resp){
                                if(resp.status = "OK"){
                                    let userList = resp.data;
                                    PAPP.renderPaginate(resp.total, limit, userList, page, 'home');
                                    PAPP.renderUser(userList);
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
        dependencies: ["home.html"]
    });
})();