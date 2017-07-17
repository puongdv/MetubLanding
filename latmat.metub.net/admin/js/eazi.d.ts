/**
 * This is a feature of EaziJS. This object contains functions to interact with API server.
 * 
 * Support HTTP & Websocket.
 */
declare module API {
    /**
     * This is prefix path for HTTP API call. This will be concat with the "url" values
     * of the request.
     */
    var basePath: String;

    /**
     * This is a hook function, it will be proceeded before call any API request.
     */
    var beforeRequest: Function;

    /**
     * This is a hook function, it will be proceeded before all API response process.
     */
    var beforeResponse: Function;

    /**
     * This function will setup the Websocket connection with the given uri.
     * 
     * @param {String} uri The URI of Websocket endpoint
     */
    function initWS(uri: String)

    /**
     * Make an API call.
     * Similar usage with jQuery.ajax()
     * 
     * @param options 
     */
    function call(options: {
        /**
         * The endpoint of API.
         */
        url: String,

        /**
         * The method of the request.
         */
        method?: String,

        /**
         * The format of the API Response. If this is "json",
         * the response text will be parsed to JSON object.
         */
        dataType?: String,

        /**
         * If this is "ws", then the request will use Websocket as protocol.
         * Then it will call API.callWS
         */
        protocol?: String,

        /**
         * The body of the request.
         * If it is an object, it will be converted to JSON String.
         */
        data?: Object,

        /**
         * The success callback of the API Request. This will be called when the client
         * receive data from API Server.
         */
        success?: Function

    })

    /**
     * Make a Websocket API call. This will send a JSON format object via Websocket 
     * to configured API Websocket endpoint.
     */
    function callWS(options: {
        /**
         * The endpoint of API.
         */
        url: String,

        /**
         * The method of the request.
         */
        method?: String,

        /**
         * The format of the API Response. If this is "json",
         * the response text will be parsed to JSON object.
         */
        dataType?: String,

        /**
         * The body of the request.
         */
        data?: String,

        /**
         * The success callback of the API Request. This will be called when the client
         * receive data from API Server.
         */
        success?: Function
    })

    /**
     * Configure a form element to call API instead of default submission.
     * 
     * @param options 
     */
    function setupForm(options: {
        /**
         * The DOMElement of target form.
         */
        form: Element,

        /**
         * The API endpoint.
         */
        url: String,

        /**
         * The method of the request.
         */
        method?: String,

        /**
         * The success callback of the API Request of form submission. This will be called when the client
         * receive data from API Server.
         */
        success?: Function,

        /**
         * This will convert the value of form inputs if needed.
         * 
         * *Example*:
         * 
         * API.setupForm({
         *      form: document.getElementById("form-id"),
         *      transform: function(name, value){
         *          if (name === "fox"){ 
         *              return "Hello"; // input that have "name" = "fox" will have "value" = "Hello"
         *          }
         *          return value;
         *      }
         * })
         */
        transform?: Function,

        /**
         * This will be executed before form submission. 
         * If this return false, the form will not be submitted.
         */
        validation?: Function
    })
}

/**
 * This is a part of EaziJS. This object contains functions to load & export modules.
 */
declare module MODULE {

    /**
     * Load your modules background. This function is use for warmup & user action prediction.
     * 
     * @param {String[]} modulesName Array of module names
     */
    function lazyLoad(modulesName: String[]) { }

    /**
     * This function will init your module with given configuration.
     * 
     * @param {Object} config The object contains configuration of the module.
     */
    function exports(config: {

        /**
         * Name of the module.
         */
        name: String,

        /**
         * This object contains main feature of module, usually contains 'render' function
         */
        module: Object,

        /**
         * This is an array of String. It contains names of your files that you want to load & used
         * by your module. 
         * 
         * **Support**:
         * - *.js: Javascript file that contains your process
         * - *.html: Template file. The filename will be use as template name.
         * - *.css: Stylesheet that is relative with the module.
         * 
         * **Notice**: Your module is only ready to use when all dependencies are loaded.
         */
        dependencies?: String[]
    }) { }

    /**
     * Load the module (if it's not loaded) and process with that module.
     * 
     * *Example*:
     * MODULE.requires("popup", function(loadedModule){
     *      loadedModule.render({
     *          content: message
     *      });
     * })
     */
    function requires(moduleName: String, callback: Function) { }
}

/**
 * This is a part of EaziJS. This object contains functions to navigate pages.
 */
declare module PAGE {

    /**
     * This variable define the main page path. Default is ** /home **
     */
    var defaultPath: String;

    /**
     * This variable define the not found page path (on case 404). Default is ** /notfound **
     */
    var notfoundPath: String;

    /**
     * This function will redirect page to provided URL. If target has same domain with current page,
     * it will load AJAX to support SPA, else it will navigate to that URL.
     * 
     * @param {String} path Target URL that you want current page redirect to.
     */
    function go(path: String) { }

    /**
     * This function will get the parameters of URL of current page.
     * 
     * *Example*: http://example.com/abc?x=1&y=2
     * PAGE.getQuery() will return { "x":1, "y":2 }
     */
    function getQuery(): Object { }

    /**
     * This function will get cookie values of current page.
     * 
     * *Example*:
     * PAGE.getCookie() will return { "mycookie1": "cookie value", "mycookie2": "cookie value 2",}
     * @return Object that maps cookie values.
     */
    function getCookie(): Object { }
}

/**
 * This is a part of EaziJS. This object contains functions to render HTML.
 */
declare module UI {
    /**
     * This will render HTML from processing template & data.
     * 
     * @param options Object contains option for rendering action.
     */
    function render(options: {
        /**
         * Name of the template. 
         */
        template?: String,

        /**
         * Module object. This is the parameter of "exports" function.
         */
        module: Object,

        /**
         * This function will be called after render process.
         */
        callback?: Function,

        /**
         * This is the parent element that HTML will be filled in.
         * 
         * If this not exist, the process will use the default container.
         */
        container?: HTMLElement
    })

}
