/**
 * Module popup
 * 
 * Usage:
 * 
 * module.requires("top-header", function(module){ 
 *          module.render()
 * });
 * 
 */
(function (window, document) {
    MODULE.exports({
        name: "navbar",
        module: {
            render: function (selectedPath) {
                let ele = document.getElementById('page-navbar');                                          
                UI.render({
                    module: this,
                    template: "navbar",
                    container: ele,
                    data: {
                        title: CONF.TITLE,
                        CONF: CONF
                    },
                    callback: function () {                        
                        //Check auth                                           
                        CONF.LOAD.navbar = true;                        
                    }
                });

            }
        },
        dependencies: ['navbar.html']
    });
})(window, document);