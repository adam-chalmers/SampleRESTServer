jQuery(document).ready(function($) {
    $('#logout-button').click(function() {
        document.cookie = 'jwt=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        window.location.href = "../";
    });
});