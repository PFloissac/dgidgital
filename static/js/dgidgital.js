$(document).ready(function(){
  if($('#LoginForm').length == 1) {
    $('#LoginForm').submit(function(eventObj) {
      var userId = $('#LoginForm_userId').val();
      var password = $('#LoginForm_password').val();

      $('#LoginForm_encPassword').val(CryptoJS.AES.encrypt(password, userId).toString());

      $('#LoginForm_password').prop('disabled', true);
      return true;
    });
  }

  if($('#RegisterForm').length == 1) {
    $('#RegisterForm').submit(function(eventObj) {
      var userId = $('#RegisterForm_userId').val();
      var password = $('#RegisterForm_password').val();
      var password2 = $('#RegisterForm_password2').val();

      $('#RegisterForm_encPassword').val(CryptoJS.AES.encrypt(password, userId).toString());
      $('#RegisterForm_encPassword2').val(CryptoJS.AES.encrypt(password2, userId).toString());

      $('#RegisterForm_password').val('').prop('disabled', true);
      $('#RegisterForm_password2').val('').prop('disabled', true);

      return true;
    });
  }
});
