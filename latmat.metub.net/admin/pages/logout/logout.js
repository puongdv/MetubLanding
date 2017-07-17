/**
 * Logout
 */
(function () {
    SCOOKIE.setCookie(CONF.COOKIE_NAME,"",0);
    PAGE.go("/login");
})();