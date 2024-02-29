$("#contactForm").submit(function(e) {
	var name = $("#txt_name").val();
	var email = $("#txt_email").val();
	var phone = $("#txt_phone").val();
	var message = $("#txt_message").val();
	e.preventDefault();

	if(name == "" || email == "" || phone == "" || message == "") {
		$("#message").show().html("All fields are required");
	} else {
		if(IsEmail(email) == false) {
			$("#message").show().html("Invalid Email");
		}
		else {
			// Let's select and cache all the fields
		    var $inputs = $(this).find("input, select, button, textarea");

		    // Serialize the data in the form
		    var serializedData = $(this).serialize();
		  
		    // Fire off the request to /form.php
		    request = $.ajax({
		        url: "assets/mail/phpmail.php",
		        type: "post",
		        data: serializedData
		    });
		    // Callback handler that will be called on success
		    request.done(function (response, textStatus, jqXHR){
		        // Log a message to the console
		        $("#message").show().html(response);
		    });
		     // Callback handler that will be called on failure
			request.fail(function (jqXHR, textStatus, errorThrown){
			    // Log the error to the console
			    $("#message").show().html("The following error occurred: "+textStatus, errorThrown);
			});
		}
	}				    
});
// Email Validation Function
function IsEmail(email) {
	var regex = /^([a-zA-Z0-9_\.\-\+])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
  	if(!regex.test(email)) {
    	return false;
  	}else{
    	return true;
  	}
}