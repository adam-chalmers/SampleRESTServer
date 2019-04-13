jQuery(document).ready(function($) {
    $('#login-form').submit(formSubmit);

    async function formSubmit(event) {
        event.preventDefault();
        
        var $form = $('#login-form');
        var username = $form.find('#username').val();
        var password = $form.find('#password').val();
        if (!username) {
            alert("A username is required.");
            return;
        }
        if (!password) {
            alert("A password is required.");
            return;
        }

        var data = {
            "username": username,
            "password": password
        };
        $.post(`${document.location.origin}/auth`, data).done(loginCallback).fail(failedLogin);
        $('#loading-spinner').show();
    }
    
    function loginCallback(response, status) {
        $('#loading-spinner').hide();
        if (status === 'error') {
            alert("An error occurred while attempting to login. Please try again later.");
            return;
        }
        if (status === 'timeout') {
            alert("Login attempt timed out. Please try again later.");
            return;
        }
        if (status !== 'success') {
            alert("An error occurred while attempting to login. Please try again later.");
            return;
        }
    
        if (response.success === true) {
            window.location.href = "../user";
        }
        else if (response.success === false) {
            alert(response.message);
        }
        else {
            alert("An error occurred while attempting to login. Please try again later.");
        }
    }
    
    function failedLogin(xhr, status, error) {
        $('#loading-spinner').hide();
        if (xhr.responseJSON && xhr.responseJSON.message) {
            alert(xhr.responseJSON.message);
        }
        else {
            alert("An error occurred while attempting to log in. Please try again later.");
        }
    }
});