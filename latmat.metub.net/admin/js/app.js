/**
 * Main processor.
 */

(function (window, document) {

    // init module
    MODULE.basePath = "http://admin.metub.tk/";
    MODULE.highPriority = ["popup", "pages/notfound"];

    // id of element for render page 
    PAGE.container = "page-content";

    // define api info
    API.basePath = "http://api.metub.tk";
    window.CONF = {            
        TITLE: 'Casting Online Phim Lật Mặt 3 | - Metub',
        COOKIE_NAME: 'METUB',
        MY_HOST: 'http://admin.metub.tk',
        MY_STATIC: 'http://admin.metub.tk',
        USER: {},
        LOAD: {
            navbar: false,
            sidebar: false
        },
        APP_NAME: 'METUB',
        APP_COPYRIGHT: '@ '+ (new Date()).getFullYear(),
        PLAYLIST: {
            'PLGRd4Y_oqrRp1HW_dSH7cENV9kNCtde7F': 'Vai Diễn Tâm',
            'PLGRd4Y_oqrRp-lqsfT2v86Qh5-2NJWUb5': 'Vai Diễn Christe',
            'PLGRd4Y_oqrRrQHbbfxwxf0M5h5URFRD3V': 'Vai Diễn Lân',
            'PLGRd4Y_oqrRosdLzRFhGBOa1EvjJRDpv8': 'Vai Giang Hồ'
        }
    }

    // setup template render
    UI.compile = function (text) {
        return Handlebars.compile(text);
    }
    UI.build = function (templateObject, data) {
        return templateObject(data);
    }

    window.addEventListener("load", function () {
        PAGE.load();
    });

    PAGE.afterLoad = function (path) {
        if(!CONF.LOAD.sidebar){
            MODULE.requires("sidebar", function (module) {
                module.render(path);
            });    
        }
        if(!CONF.LOAD.navbar){
            MODULE.requires("navbar", function (module) {
                module.render(path);
            });      
        }  
    }

})(window, document);