(function (window, document) {
	
	if (window.SCOOKIE) return;
    
    window.SCOOKIE = {
	    setCookie: function(cname, cvalue, exdays) {
		    var d = new Date();
		    d.setTime(exdays);
		    var expires = "expires="+ d.toUTCString();
		    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
		},
		getCookie: function(cname) {
		    var name = cname + "=";
		    var decodedCookie = decodeURIComponent(document.cookie);
		    var ca = decodedCookie.split(';');
		    for(var i = 0; i <ca.length; i++) {
		        var c = ca[i];
		        while (c.charAt(0) == ' ') {
		            c = c.substring(1);
		        }
		        if (c.indexOf(name) == 0) {
		            return c.substring(name.length, c.length);
		        }
		    }
		    return "";
		}
	}
})(window, document);	