/**
 * Module popup
 * 
 * Usage:
 * 
 * module.requires("module", function(module){ 
 *          module.render({
 *              content: "Popup message"
 *          })
 *  });
 * 
 */
(function () {
    MODULE.exports("popup", {

        // render a popup
        render: function (opts) {
            // define close function
            let defaultObj = {
                buttonLabel: "OK",
                close: function () {
                    popupElement && popupElement.parentNode.removeChild(popupElement);
                },
                ok: function () {
                    popupElement && popupElement.parentNode.removeChild(popupElement);
                }
            };
            window.update(defaultObj, opts);

            // transform to html element
            let popupElement;
            UI.append(this, defaultObj, function () {
                let e = document.getElementById("popup-overlay");
                e && e.addEventListener("click", defaultObj.close);
                popupElement = e;
                e = document.getElementById("popup-ok");
                e && e.addEventListener("click", defaultObj.ok);
            });
        },

        dependencies: ['popup.html']
    });
})();