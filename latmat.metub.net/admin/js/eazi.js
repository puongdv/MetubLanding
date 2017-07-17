/**
 * Core processor.
 */
(function (window, document) {
    window.update = function (a, b) {
        for (let i in b) {
            a[i] = b[i];
        }
    };

    window.isObjEmpty = function (obj) {
        for (let a in obj) {
            return false;
        }
        return true;
    }

    String.prototype.replaceAll = function (oldStr, newStr) {
        var s = this, lastPos = -1;
        while (s.indexOf(oldStr) > lastPos) {
            lastPos = s.indexOf(oldStr) + newStr.length;
            s = s.replace(oldStr, newStr);
        }
        return s;
    };
    Array.prototype.removeAt = function (index) {
        return this.splice(index, 1);
    };

    Array.prototype.contains = function (q) {
        let value = this.find(function (item) {
            if (q === item) {
                return true;
            }
        });
        return !!value;
    };

    let core = {};
    /**
     * API management
     */
    let ws = null,
        wsReady = false,
        wsQueue = [],
        wsCallback = {},
        dataSchema = ["url", "resource", "method", "data", "content", "callback", "params"];
    window.API = {
        basePath: "",
        headers: {},
        serialize: function (data) {
            let arr = [];
            for (let key in data) {
                arr.push(key + "=" + data[key]);
            }
            return arr.join("&");
        },
        initWS: function (uri) {
            ws = new WebSocket(uri);
            ws.onopen = function () {
                console.log("[WebSocket API] Init successfully for " + uri);
                wsReady = true;
                while (wsQueue[0]) {
                    ws.send(wsQueue.removeAt(0));
                }
            };

            ws.onmessage = function (evt) {
                let respJSON = JSON.parse(evt.data);
                if (typeof API.beforeResponse == 'function') {
                    if (API.beforeResponse.call(window, respJSON) == false) {
                        return;
                    }
                }
                if (respJSON['callback']) {
                    wsCallback[respJSON['callback']].call(window, respJSON);
                }
            };

            ws.onclose = function () {
                console.log("[WebSocket API] Close connection for " + uri);
                wsReady = false;
            };

            ws.onerror = function () {
                console.log("[WebSocket API] Error at " + uri + ".");
                wsReady = false;
            };
        },
        callWS: function (opts) {
            if (opts['success']) {
                opts['callback'] = opts['success'];
                delete opts['success'];
            }

            if (typeof opts['callback'] == 'function') {
                let key = Date.now() + "-" + Math.random();
                wsCallback[key] = opts['callback'];
                opts['callback'] = key;
            }
            let wsData = {};
            for (let i = 0; dataSchema[i]; i++) {
                wsData[dataSchema[i]] = opts[dataSchema[i]];
            }

            if (wsData['url']) {
                wsData['resource'] = wsData['url'];
                delete wsData['url'];
            }

            if (wsData['data']) {
                wsData['content'] = wsData['data'];
                delete wsData['data'];
            }

            if (typeof wsData['content'] == 'object') {
                wsData['content'] = JSON.stringify(wsData['content']);
            }

            if (typeof API.beforeRequest == "function") {
                API.beforeRequest.call(window, wsData);
            }

            if (wsReady) {
                ws.send(JSON.stringify(wsData));
            } else {
                wsQueue.push(JSON.stringify(wsData));
            }
        },
        call: function (opts) {
            if (this.basePath.startsWith("ws") || opts['protocol'] == "ws") {
                this.callWS(opts);
                return;
            }
            if (!opts.url.startsWith("http")) {
                opts.url = this.basePath + opts.url;
            }
            if (this.headers) {
                if (!opts.headers) {
                    opts.headers = {};
                }
                window.update(opts.headers, this.headers);
            }

            if (typeof API.beforeRequest == "function") {
                API.beforeRequest.call(window, opts);
            }

            let xhttp = new XMLHttpRequest();

            xhttp.onreadystatechange = function () {
                if (this.readyState == 4) {
                    if (this.status == 200) {
                        let respData = opts.dataType === "json" ? JSON.parse(this.responseText) : this.responseText;
                        if (opts.success && typeof opts.success == "function") {
                            opts.success.call(window, respData);
                        }
                    } else {
                        if (opts.error && typeof opts.error == "function") {
                            opts.error.call(window);
                        }
                    }

                }
            };

            let setHeaders = function () {
                if (opts.headers) {
                    for (let headerName in opts.headers) {
                        xhttp.setRequestHeader(headerName, opts.headers[headerName]);
                    }
                    //xhttp.withCredentials = true;
                } else {
                    if (!isObjEmpty(PAGE.getCookie())) {
                        //xhttp.withCredentials = true;
                    }
                }
            };


            if (opts.method == "GET") {
                xhttp.open(opts.method, opts.url + (opts.data ? "?" + this.serialize(opts.data) : ""), true);
                setHeaders();
                xhttp.send();
            } else {
                xhttp.open(opts.method, opts.url, true);
                setHeaders();
                xhttp.send(JSON.stringify(opts.data));
            }

        },
        setupForm: function (opts) {
            let formElement = opts['form'];
            if (!formElement) {
                throw (new Error("Require <form> for 'setupForm' action."));
            }
            let url = opts['url'] || formElement.action;
            let transform = opts['transform'];
            let validation = opts['validation'];
            let success = opts['success'];
            let method = opts['method'] || "POST";
            let headers = opts['headers'] || {};

            formElement.addEventListener('submit', function (ev) {
                try {
                    // setup login request
                    let options = {
                        method: method,
                        url: url,
                        data: {},
                        dataType: 'json',
                        headers: headers,
                        success: function (resp) {
                            success && success(resp);
                        }
                    };

                    // setup data 
                    for (let i = 0; formElement.elements[i]; i++) {
                        let e = formElement.elements[i];
                        if (e instanceof Element && e.name) {
                            options.data[e.name] = transform ? transform(e.name, e.value) : e.value;
                        }
                    }

                    if (!validation || validation(options.data)) {
                        // call api
                        if (opts['protocol'] !== 'ws') {
                            API.call(options);
                        } else {
                            API.callWS({
                                resource: options['url'],
                                method: method,
                                action: options['method'],
                                data: options['data'],
                                params: options['headers'],
                                callback: options['success']
                            });
                        }
                    }
                } catch (e) {
                    console.log("Submit form error:", e);
                }

                // prevent default form submit
                if (ev) {
                    ev.preventDefault();
                    ev.stopPropagation();
                }
                return false;
            });
        }
    };

    /**
     * Module management.
     */
    let modules = {
        loaded: {},
        onLoaded: {},
        onLoading: {}
    };
    let warming = false;
    let onModuleLoaded = function (name) {
        modules.onLoading[name] = false;
        if (modules.onLoaded[name]) {
            let hdls = modules.onLoaded[name];
            delete modules.onLoaded[name];
            for (let i in hdls) {
                hdls[i](modules.loaded[name]);
            }
        }
    }, backgroundWarmup = function () {
        if (MODULE.highPriority && MODULE.highPriority[0]) {
            warming = true;
            setTimeout(function () {
                if (MODULE.highPriority && MODULE.highPriority[0]) {
                    let moduleName = MODULE.highPriority[0];
                    MODULE.highPriority.removeAt(0);
                    MODULE.requires(moduleName, function () {
                        backgroundWarmup();
                    });
                }
            }, 2500);
        } else
            warming = false;
    };
    window.MODULE = {
        highPriority: [],
        getName: function (name) {
            if (name.startsWith('pages/') || name.startsWith('comps/')) {
                return name;
            }
            return 'comps/' + name;
        },
        getCoreJs: function (name) {
            name = this.getName(name);
            let p = name.split("/");
            return name + "/" + p[p.length - 1] + ".js";
        },
        lazyLoad: function (moduleArr) {
            if (moduleArr) {
                if (!this.highPriority) {
                    this.highPriority = moduleArr;
                } else {
                    for (let i = 0; moduleArr[i]; i++) {
                        if (modules.loaded[moduleArr[i]]) {
                            moduleArr.removeAt(i);
                            i--;
                        }
                    }
                    if (!moduleArr || !moduleArr.length) {
                        return;
                    }
                    this.highPriority = this.highPriority.concat(moduleArr);
                }
            }
            if (this.highPriority && this.highPriority.length && !warming) {
                backgroundWarmup();
            }
        },
        exports: function (name, moduleObject, dependencies, onLoadComplete) {
            if (typeof name === 'object') {
                moduleObject = name['module'];
                dependencies = name['dependencies'];
                onLoadComplete = name['onComplete'];
                name = name['name'];
            }
            if (!name) {
                throw (new Error("Require <name> for 'exports' action."));
            }
            if (!moduleObject) {
                throw (new Error("Require <module> for 'exports' action."));
            }
            if (!modules.loaded[name])
                modules.loaded[name] = {};
            window.update(modules.loaded[name], moduleObject);
            if (!dependencies)
                onModuleLoaded(name);
            else {
                this.init(name, dependencies, onLoadComplete);
            }
        },
        init: function (name, dependencies, onComplete) {
            let loaded = 0;
            let count = 0;
            let dependencyLoaded = function () {
                loaded++;
                if (loaded >= count) {
                    console.log("[Module] " + name + " loaded successfully!");
                    onModuleLoaded(name);
                    onComplete && onComplete(modules.loaded[name]);
                }
            }

            for (let i = 0; dependencies[i]; i++) {
                let path = dependencies[i];
                count++;
                let p = path.split('.');
                let type = p[p.length - 1];
                let url = this.basePath + MODULE.getName(name) + "/" + path;
                switch (type) {
                    case "html": {
                        API.call({
                            method: "GET",
                            url: url,
                            headers: {
                                "Accept": "text/html"
                            },
                            success: function (content) {
                                if (modules.loaded[name]) {
                                    if (!modules.loaded[name].template)
                                        modules.loaded[name].template = {};
                                    p.removeAt(p.length - 1);
                                    modules.loaded[name].template[p.join('')] = UI.compile(content);
                                    dependencyLoaded();
                                }
                            }
                        });
                    }
                        break;
                    case "css": {
                        let exist = document.body.querySelectorAll('link[href="' + url + '"]');
                        if (!exist || !exist.length) {
                            let ele = document.createElement("link");
                            ele.rel = "stylesheet";
                            ele.href = url;
                            ele.onload = function () {
                                dependencyLoaded();
                            };
                            document.body.appendChild(ele);
                        }
                    }
                        break;
                }
            }
        },
        requires: function (name, callback, onerror) {
            if (!modules.loaded[name]) {
                if (!modules.onLoaded[name]) {
                    modules.onLoaded[name] = [];
                }
                if (callback)
                    modules.onLoaded[name].push(callback);
                if (!modules.onLoading[name]) {
                    let url = this.basePath + this.getCoreJs(name);
                    let exist = document.body.querySelectorAll('script[src="' + url + '"]');
                    if (!exist || !exist.length) {
                        modules.onLoading[name] = true;
                        let ele = document.createElement("script");
                        ele.type = "text/javascript";
                        ele.src = url;
                        ele.onerror = function () {
                            modules.onLoaded[name] = [];
                            modules.onLoading[name] = false;
                            console.log("[Module] " + name + " failed to load!")
                            document.body.removeChild(ele);
                            onerror();
                        };
                        document.body.appendChild(ele);
                    }
                }
            } else if (callback) {
                callback(modules.loaded[name]);
            }
        }
    };

    /**
     * Page navigation management.
     */
    let processLink = function (ev) {
        if (this.href.length > 0) {
            PAGE.go(this.href);
            if (ev) {
                ev.preventDefault();
                ev.stopPropagation();
            }
        }
        return false;
    };
    window.PAGE = {
        container: "",
        defaultPath: "/home",
        notfoundPath: "/notfound",
        getCookie: function () {
            if (!document.cookie || document.cookie.length < 3) {
                return {};
            }
            var cookie = {};
            let p = document.cookie.split("; ");
            for (let i = 0; p[i]; i++) {
                let j = p[i].indexOf('=');
                if (j > 0) {
                    cookie[p[i].substr(0, j)] = p[i].substr(j + 1);
                }
            }
            return cookie;
        },
        getQuery: function () {
            if (!window.location.search || window.location.search.length < 4) {
                return {};
            }
            let q = {},
                p = window.location.search.substr(1).split("&");
            for (let i = 0; p[i]; i++) {
                let j = p[i].indexOf('=');
                if (j > 0) {
                    q[p[i].substr(0, j)] = p[i].substr(j + 1);
                }
            }
            return q;
        },
        getPath: function () {
            let path = window.location.pathname;
            if (path.indexOf("?") > 0)
                path = path.substr(0, path.indexOf("?"));
            if (path.indexOf("#") > 0)
                path = path.substr(0, path.indexOf("#"));
            if (!path || path === "/")
                path = this.defaultPath;
            return path;
        },
        load: function () {
            let path = this.getPath();
            let self = this;
            let container = document.getElementById(this.container);
            let loadPage = function (loadedModule) {
                if (self.beforeLoad && typeof self.beforeLoad == "function") {
                    if (!self.beforeLoad.call(window, path)) {
                        return;
                    }
                }
                let t = window.performance.now();
                loadedModule.render();
                document.body.setAttribute("data-page", path);
                console.log("[UI] Render '" + path + "' in " + (window.performance.now() - t).toFixed(3) + " ms");
                if (self.afterLoad && typeof self.afterLoad == "function") {
                    self.afterLoad.call(window, path);
                }
            };
            MODULE.requires("pages" + path, function (loadedModule) {
                loadPage(loadedModule);
            }, function () {
                MODULE.requires("pages" + PAGE.notfoundPath, function (loadedModule) {
                    loadPage(loadedModule);
                });
            });

        },
        getContainer: function () {
            return document.getElementById(this.container);
        },
        go: function (url) {
            let a = document.createElement('a');
            a.href = url;
            if (a.hostname === window.location.hostname) {
                history.pushState({ path: a.pathname }, document.title, url);
                this.load();
            } else {
                window.location = url;
            }
        },
        fine: function (container, path) {
            if (container) {
                let aList = container.querySelectorAll("a");
                if (aList && aList.length) {
                    aList.forEach(function (obj) {
                        obj.addEventListener('click', processLink);
                    });
                }
            }
        }
    };

    /**
     * Call ajax load page on window.load event.
     */
    window.addEventListener("popstate", function () {
        PAGE.load();
    });
    window.addEventListener("load", backgroundWarmup);

    /**
     * UI Render engine
     * Begin
     */

    let render = function (opts, renderType) {
        let renderedModule = opts['module'];
        let data = opts['data'] || {};
        let tplname = opts['template']
        let callback = opts['callback'];
        if (!renderedModule) {
            throw (new Error("Require valid <module> for 'render' action."));
        }
        let tpl = renderedModule.template[tplname];
        if (!tpl) {
            throw (new Error("Require valid <template> for 'render' action."));
        }
        let currentContainer = opts['container'] || PAGE.getContainer();
        switch (renderType) {
            case "PUT":
                currentContainer.innerHTML = UI.build(tpl, data);
                break;
            case "APPEND":
                let d = document.createElement("div");
                d.innerHTML = UI.build(tpl, data);
                for (let i = 0; d.children[i]; i++) {
                    currentContainer.appendChild(d.children[i]);
                    PAGE.fine(d.children[i]);
                }
                break;
        }

        PAGE.fine(currentContainer);

        if (callback) {
            setTimeout(callback, 10);
        }
    }

    window.UI = {
        compile: function (text) {
            return text;
        },
        build: function (tplObject, data) {
            return tplObject;
        },
        render: function (opts) {
            render(opts, "PUT");
        },
        append: function (opts) {
            render(opts, "APPEND");
        }
    };
    /**
     * UI Render engine
     * End
     */

})(window, document);