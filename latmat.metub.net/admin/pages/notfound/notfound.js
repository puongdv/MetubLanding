/**
 * Render 404 page
 */
(function () {
    MODULE.exports({
        name: "pages/notfound", 
        module: {
            render: function () {
                UI.render({
                    module: this,
                    template: "notfound",
                    data: {
                        
                    }
                });
            }
        }, 
        dependencies: ["notfound.html"]
    });
})();