var IP = "http://182.92.67.74";


//得到屏幕的宽高Json对象
function getViewParams(){
    var viewport_height = $(window).height();
    var viewport_width = $(window).width();
    var data = "{'height':'"+viewport_height+"','width':'"+viewport_width+"'}";
    return eval("("+data+")");
}

//计算中间层高度
function fixgeometry (){
	var header = $("#header:visible");
    var footer = $("#footer:visible");
    var content = $("#content:visible");
    var viewport_height = $(window).height();
    
    var content_height = viewport_height - header.outerHeight() - footer.outerHeight() + 2;
    
    //alert(content_height+"::"+header.outerHeight()+"::"+footer.outerHeight());
    //去除掉边框大小
    content_height -= (content.outerHeight() - content.height());
    content.height(content_height);
}

//格式化时间 （年月日 时分秒）
function formatDate(date){
	var d=new Date(date); 
	return (d.getFullYear()+"年"+(d.getMonth()+1)+"月"+d.getDate()+"日 "+d.getHours()+"时"+d.getMinutes()+"分"+d.getSeconds()+"秒");
}

//格式化时间 （年月日 时分）
function formatDateCYMDHM(date){
	var d=new Date(date); 
	return (d.getFullYear()+"年"+(d.getMonth()+1)+"月"+d.getDate()+"日 "+d.getHours()+"时"+d.getMinutes()+"分");
}

//格式化时间 （年月日）
function formatDateCYMD(date){
	var d=new Date(date); 
	return (d.getFullYear()+"年"+(d.getMonth()+1)+"月"+d.getDate()+"日 ");
}

//格式化时间 （2014-03-01）
function formatDateYMD(date){
	var d=new Date(date); 
	return (d.getFullYear()+"-"+(d.getMonth()<9?("0"+(d.getMonth()+1)):(d.getMonth()+1))+"-"+(d.getDate()<10?("0"+d.getDate()):d.getDate()));
}

//格式化时间 （2014-03-18 01:28:42）
function formatDate1(date){
	var d=new Date(date); 
	return (d.getFullYear()+"-"+(d.getMonth()+1)+"-"+d.getDate()+" "+d.getHours()+":"+d.getMinutes()+":"+d.getSeconds());
}

//格式化时间 （2014-03-18 01:28）
function formatDateYMDHM(date){
	var d=new Date(date); 
	return (d.getFullYear()+"-"+(d.getMonth()<9?("0"+(d.getMonth()+1)):(d.getMonth()+1))+"-"+(d.getDate()<10?("0"+d.getDate()):d.getDate())+" "+(d.getHours()<10?("0"+d.getHours()):d.getHours())+":"+(d.getMinutes()<10?("0"+d.getMinutes()):d.getMinutes()));
}

//获得现在时间 时间格式 20140318012801（年月日时分秒）
function getNewDateInfo(){
	var d = new Date();
	return (d.getFullYear()+(d.getMonth()<9?("0"+(d.getMonth()+1)):(d.getMonth()+1))+(d.getDate()<10?("0"+d.getDate()):d.getDate())+(d.getHours()<10?("0"+d.getHours()):d.getHours())+(d.getMinutes()<10?("0"+d.getMinutes()):d.getMinutes())+(d.getSeconds()<10?("0"+d.getSeconds()):d.getSeconds()));
}

//返回主页面
function goHome(){
	location.href = "index.html";
}

//默认3秒消失的信息提示框
function messageBox(str,second) {
	if(!second){second=3000;}
	
	showLoader(str,true); 
    var messageBox = setTimeout(function(){$.mobile.loading('hide')}, second);
}

// 等待加载PhoneGap
document.addEventListener("deviceready", onDeviceReady, false);
// PhoneGap加载完毕
function onDeviceReady() {
	// 按钮事件
	document.addEventListener("backbutton", eventBackButton, false); // 返回键
	document.addEventListener("menubutton", eventMenuButton, false); // 菜单键
	//document.addEventListener("searchbutton", eventSearchButton, false); // 搜索键
}

// 菜单健
function eventMenuButton() {
	
}

// 返回键
function eventBackButton() {
	if($("#home").length > 0 || $("#login").length > 0){
		messageBox('再点击一次退出!');
		document.removeEventListener("backbutton", eventBackButton, false); // 注销返回键
		document.addEventListener("backbutton", exitApp, false);//绑定退出事件
		clearLocalStorage();
		// 3秒后重新注册
		var intervalID = window.setInterval(function() {
			window.clearInterval(intervalID);
			document.removeEventListener("backbutton", exitApp, false); // 注销返回键
			document.addEventListener("backbutton", eventBackButton, false); // 返回键
		}, 3000);
 	} else if ($("#goods").length > 0 || $("#bigDiv").length > 0) {
		var bodyDiv = $("#goods");
		if (bodyDiv.is(":hidden")) {
			bodyDiv.show();
		} else {
			history.back(-1);
		}
	}else {
	    navigator.app.backHistory();
	}
}

function exitApp(){
	navigator.app.exitApp();
}

//获得浏览器地址后参数（限定只能获取到一个）
function getParamOne(){
	urlinfo=window.location.href;  //获取当前页面的url
	len=urlinfo.length;//获取url的长度  
	offset=urlinfo.indexOf("?");//设置参数字符串开始的位置  
	newsidinfo=urlinfo.substr(offset,len)//取出参数字符串 这里会获得类似“id=1”这样的字符串  
	newsids=newsidinfo.split("=");//对获得的参数字符串按照“=”进行分割  
	return newsids[1];//得到参数值 
}
function getQueryString(name) { 
		var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i"); 
		var r = window.location.search.substr(1).match(reg); 
		if (r != null) 
			return unescape(r[2]); 
	return undefined; 
} 

//显示加载器  str:加载的文字；　txtonly:是否只显示文字（true只显示文字；false包括图片）
function showLoader(str,textonly) {  
    $.mobile.loading('show', {  
        text: str, //加载器中显示的文字  
        textVisible: true, //是否显示文字  
        theme: 'b',        //加载器主题样式a-e  
        textonly: textonly,   //是否只显示文字  
        html: ""           //要显示的html内容，如图片等  
    }); 
}

//隐藏加载器
function hideLoader()  
{  
    $.mobile.loading('hide');  
} 

// 返回空
function backNull(parameter) {
	return (parameter == "" || parameter == null)?"":parameter;
}