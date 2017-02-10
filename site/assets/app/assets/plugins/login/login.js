(function(){
  /* jshint asi:true */
  var translate = {
    "username is empty.": "用户名不能为空.",
    "username format error.": "用户名只能是数字或英文",
    "user not found.": "用户名不存在",
    "password not match.": "密码错误",
    "is aready token.": " 已经存在."
  };

  $(".login-form, .register-form").submit(function(e){
    return false;
  });

  var alertInfo = function(msg) {
    $.toast({ position: "top-center", text: msg, textAlign: 'center' });
  };

  var checkPhone = function(phone) {
    console.log(phone);
    return phone.length == 11 && is.startWith(phone,"1") && is.not.nan(+phone);
  };

  var basicCheck = function(username, password){
    if( is.empty(username) ) {
      alertInfo('用户名不能为空.');
      return false;
    }

    if( is.empty(password) ) {
      alertInfo('密码不能为空.');
      return false;
    }

    if( password.length < 6 ) {
      alertInfo('密码不能少于6位.');
      return false;
    }

    if( is.not.alphaNumeric(username) ) {
      alertInfo('用户名只能是数字或英文.');
      return false;
    }

    return true;
  };

  $("#login-button").click(function(){
    var username = $(".js-login-user").val();
    var password = $(".js-login-passwd").val();
    var that = this;

    if( !basicCheck(username,  password) ) return false;
    $.post("/api/sessions", { username: username, password: password }, function(data){
      if( data.hasOwnProperty("sessionToken") ) {
        //console.log("$.localStorage('key'): ",  $.localStorage('yy:token'));
        $.localStorage('yy.token', data.sessionToken);
        $.localStorage('yy.username', data.username);
        $(that).html("正在登陆 ... ");

        window.location = "/";

      } else {
        alertInfo(translate[data.message]);
      }
    });
    return false;
  });


  $("#register-btn").click(function(){

    var username = $(".js-register-user").val();
    var password   = $(".js-register-passwd").val();
    var password2  = $(".js-register-passwd2").val();
    var phone = $(".js-register-phone").val() || "";
    var email = $(".js-register-email").val() || "";

    if( !basicCheck(username,  password) ) return false;
    if( is.not.equal(password, password2) ) { alertInfo('两次密码不一致.'); return false;};
    if( is.not.empty(phone) && !checkPhone(phone) ) { alertInfo("手机号码格式错误."); return false;};
    if( is.not.empty(email) && is.not.email(email) ) { alertInfo("邮箱格式错误."); return false;};

    var userinfo = {
      username: username,
      password: password,
      password2: password2,
      phone:phone,
      email:email
    };

    $.post("/api/users", userinfo, function(data){

      if( data.hasOwnProperty("sessionToken") ) {
        //console.log("$.localStorage('key'): ",  $.localStorage('yy:token'));
        // $.localStorage('yy.token', data.sessionToken);
        // $.localStorage('yy.username', data.username);
        alertInfo("注册成功！");

      } else {
       // alertInfo( data.err[0].split("is already token.")[0] + " 已经存在.");
          alertInfo(data.err);
      }

      console.log("signup return: ", data);
    });

    console.log("register it");
    return false;
  });

  $("#reset-button").click(function(){
    var input_val = $(".reset-val").val();

    console.log("input_val: ", input_val);
    if( is.empty(input_val) ) { alertInfo("您输入为空，我发给谁呢？"); return false; };
    if( is.not.email(input_val) ) { alertInfo("邮箱格式错误"); return false;};

    $("#reset-button").html("正在处理...");

    var queryStr = "/api/users/emails" + "?email=" + input_val;
    $.get(queryStr, function(data){
    //$.post("/api/users/send_reset_email", { email: input_val }, function(data){
      console.log("data: ", data);
      $("#reset-button").html("确认");

      if( data.message == "ok" ) {
        alertInfo("确认邮箱已经发送到: " + input_val + ", 请在半小时内修改.");
      } else {
        alertInfo("邮件发送失败.");
      }
    });

    return false;
  });


  $(".js-register-btn").click(function(){

    $(".login-form").velocity("transition.shrinkOut", { duration: 100 , complete: function() {
      $(".register-form").velocity("transition.shrinkIn", {duration:200});
    }});
  });

  $(".js-go-login-page").click(function(){


    if( "block" === $(".reset-form").css("display") ) {
      $(".reset-form").velocity("transition.shrinkOut", { duration: 50 , complete: function() {
        $(".login-form").velocity("transition.shrinkIn", {duration:200});
      }});
    } else {
      $(".register-form").velocity("transition.shrinkOut", { duration: 50 , complete: function() {
        $(".login-form").velocity("transition.shrinkIn", {duration:200});
      }});
    }

  });

  $(".js-forget-btn").click(function(){

    $(".login-form").velocity("transition.shrinkOut", { duration: 100 , complete: function() {
      $(".reset-form").velocity("transition.shrinkIn", {duration:200});
    }});
  });

})();


