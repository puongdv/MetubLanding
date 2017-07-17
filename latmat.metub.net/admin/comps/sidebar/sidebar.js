/**
 * Module popup
 * 
 * Usage:
 * 
 * module.requires("top-header", function(module){ 
 *          module.render()
 *  });
 * 
 */
(function (window, document) {    
    MODULE.exports({
        name: "sidebar",
        module: {
            render: function (selectedPath) {
                let ele = document.getElementById('page-sidebar');                
                UI.render({
                    module: this,
                    template: "sidebar",
                    container: ele,
                    data: {
                        title: CONF.TITLE,
                        CONF: CONF
                    },
                    callback: function () {                         
                        let linkList = ele.querySelectorAll('a');                        
                        linkList.forEach(function (a) {
                            let li = a.parentElement;
                            if(a.pathname){                                
                                let ul = $(li).closest('ul');                                 
                                if(selectedPath.startsWith(a.pathname) && (a.pathname !== "/" || selectedPath === "/" || selectedPath === "/home")){                                
                                    $(ul).closest('li').addClass('active');
                                    li.className = 'active';                                    
                                    if(ul.hasClass('hidden-ul')){
                                        ul.removeClass('hidden-ul');
                                    }else{
                                        ul.addClass('hidden-ul');
                                    }
                                }
                            } 

                            a.addEventListener('click', function () {
                                linkList.forEach(function (a2) {
                                    let li = a2.parentElement;
                                    let ul = $(li).find('ul');
                                    if(a2==a){
                                        li.className = 'active';
                                        if(ul.hasClass('hidden-ul')){
                                            ul.removeClass('hidden-ul');
                                        }else{
                                            ul.addClass('hidden-ul');
                                        }
                                    }else{
                                        li.className = '';
                                        if(!ul.hasClass('hidden-ul')){
                                            ul.addClass('hidden-ul');
                                        }
                                    }                                                                                                                        
                                });                                    
                            });                             
                        });
                        CONF.LOAD.navbar = true;
                    }
                });

            }
        },
        dependencies: ['sidebar.html']
    });
})(window, document);