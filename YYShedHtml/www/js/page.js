priceList//设置全局变量 
var appid = "3dd96b47ad344230bb2d13a26176b4cb";
var appsecret = "123456";
var pageSize = 10;
var columnid = 47;	//产品根节点的Columnid
var imagesRoot = "http://123.57.48.96/";
var shareRoot = "http://123.57.48.96/";
var defaultImage="../images/bg.jpg";
var permitLoad = true;
var menuLoad = true;
var priceSearchTemp = ""; // 上一次查询的价格
var priceTemp = "";
var weightTemp = "";
var colorTemp = "";
var clarityTemp = "";
var cutTemp = "";
var urlAdd = "http://123.57.48.96/common/api/app/interface.jsp";
var isAddPrice=true;
var pic = 1;
var startPic = 0;
var auditstatus = 0;
function clearLocalStorage(){
	window.localStorage.removeItem("userName"); 
	window.localStorage.removeItem("userid"); 
}

//左菜单
function creatLeftMenu() {
	var viewData = getViewParams();
	var footer = $("#footer");
	var content = $("#content");
	var leftMenuDiv = $("#leftMenuDiv");
	var back_shadow = $("#back_shadow");
	leftMenuDiv.css("top", (viewData.height + "px"));

	if($("#selectheaddiv").not(":hidden")){
		$("#selectheaddiv").hide();
	}
	
	if (leftMenuDiv.is(":hidden")) {
		//div向上移动，相对于父DIV来说的，并不是绝对的移动
		// 当左菜单隐藏时执行
		loadMoreMenu(47);
		var mune_top = (viewData.height - 316) + "px";
		var foot_top = (viewData.height) + "px";
		var shadow_top = (viewData.height - 380) + "px"; 
		if (content.height() == (viewData.height - 121)) {
			content.css("height", (viewData.height - 64) + "px");
		}
		footer.css("top", (viewData.height - 57) + "px");
		content.css("height", (viewData.height - 64) + "px");
//		footer.css("top", (viewData.height - 72) + "px").animate({ "top": foot_top }, "fast", function() {// 将左选框位置先置于屏幕下面
			footer.css("display", "none");
			leftMenuDiv.css("display", "block").css("height","316px").animate({ "top": mune_top }, "fast");
			back_shadow.css("height", mune_top).css("display", "block");
			content.css("height", (viewData.height - 121) + "px");
//		});
		footer.css("height", "0px");
	}else{
//		div向下移动，相对于父DIV来说的，并不是绝对的移动
//		 当左菜单显示时执行
 		var mune_top = (viewData.height) + "px";
 		var foot_top = (viewData.height - 57) + "px";
 //		back_shadow.fadeOut();
 		back_shadow.css("display", "none");
 		leftMenuDiv.animate({ 'top': mune_top }, "fast", function() {  	
 			footer.css("display", "block").css("height", "55px").css({ "top": foot_top });
 			if (footer.offset().top == (viewData.height - 57) || footer.offset().top == (viewData.height - 56)) {
 				content.css("height", (viewData.height - 121) + "px");
 			}
 			leftMenuDiv.css("height","0px");
 			leftMenuDiv.css("display", "none");
         });
	}
}

//加载所有类目
function loadClass(){
	var classData = window.sessionStorage.getItem("classData");
	if(classData==null){
		var func = "getColumnList";
		var formData = "func="+func+"&appid="+appid+"&appsecret="+appsecret+"&columnid="+columnid+"&level=0";
		$.ajax({
			type: "POST",
	        url: "http://123.57.48.96/common/api/app/interface.jsp", 
			data: formData,
			success: loadClassSuccess,
			error: loadClassError
		});
	}
}

//加载类目成功
function loadClassSuccess(data,status){
	window.sessionStorage.setItem("classData",JSON.stringify(data));
}

//加载类目失败
function loadClassError(data,status){
	window.sessionStorage.removeItem("classData"); 
	messageBox("加载类目失败！");
}

//根据父类的ID获取子类目的数组
function getClassDataByPid(pid){
	var dataStr = jQuery.parseJSON(window.sessionStorage.getItem("classData"));
	var array = [];
	for(var i=0; i<dataStr.funcdata.length; i++){
		if(dataStr.funcdata[i].pid == pid){
			array.push(dataStr.funcdata[i]);
		}
	}
	return array;
}

//打开商品明细
function goGoods(contentid,showProductCount,jump,loctionhref){
	//alert(showProductCount);
	//alert(loctionhref);
	location.href = "goodsPage.html?contentid=" + contentid + "&showProductCount="+showProductCount+"&loctionhref="+loctionhref+"&jump="+jump;
}

//打开商品明细
function goGoods1(contentid,showProductCount,jump,typecode,loctionhref){
	//alert(showProductCount);
	//alert("goodsPage1.html?contentid=" + contentid + "&showProductCount="+showProductCount+"&loctionhref="+loctionhref+"&jump="+jump+"&typeCode="+typecode);
	location.href = "goodsPage1.html?contentid=" + contentid + "&showProductCount="+showProductCount+"&loctionhref="+loctionhref+"&jump="+jump+"&typeCode="+typecode;
}
//点击左菜单打开商品明细进入的商品列表
function goGoodLefts(contentid,showProductCount,jump,classId,loctionhref){
	//alert(showProductCount);
	//alert(loctionhref);
	location.href = "goodsPage.html?contentid=" + contentid + "&showProductCount="+showProductCount+"&loctionhref="+loctionhref+"&jump="+jump+"&classId="+classId;
}

function goGoodsSearch(contentid,showProductCount,jump,classId,querycolumn ,querycolumnvalue,loctionhref){
	//alert(showProductCount);
	//alert(loctionhref);
	location.href = "goodsPage.html?contentid=" + contentid + "&showProductCount="+showProductCount+"&loctionhref="+loctionhref+"&jump="+jump+"&classId="+classId+"&querycolumn="+querycolumn+"&querycolumnvalue="+querycolumnvalue;
}
//进入下一级类目
function goNextClass(classId){
	//var array = getClassDataByPid(classId);
	location.href = "productListPage.html?classId="+classId;
}

//加载文章成功时候触发	 
function loadMessageContentSuccess(data,status){ 
	
	var viewData = getViewParams();
	var elementData = data.funcdata;
	$("#title").html(elementData.title);
	$("#addtime").html(formatDate(elementData.addtime));
	var strContent = elementData.content;
	re = new RegExp("<img", "g");
	strContent  = strContent.replace(re, "<img style='width:"+(viewData.width-20)+"px;'");
	$("#detail").append(strContent);
	permitLoad=true;
} 

//加载文章失败时候触发
function loadMessageContentError(data,status){ 
    //alert("error!");
	permitLoad=true;
}

//加载左菜单内容
function loadMoreMenu(id) {
	var menuTitle = $("#menuTitle");
	var menuContent = $("#menuContent");
	var menu_array = new Array();
	var columnsData = jsServerData.columnsData;
	var count = 0;
	var backID = 0; //上级菜单的节点ID
	menuTitle.html("");
	menuContent.html("");
	var html_cont = "<ul>";
	for (var i = 0; i < columnsData.length; i++) {
		if (columnsData[i].pid == id) {
			menu_array[count] = columnsData[i];
			count++;
		}
		if (columnsData[i].id == id) {
			backID = columnsData[i].pid; // 获取当前菜单的父节点
		}
	}
	var count = 0;
	var len = menu_array.length;
	var row = Math.floor((len % 3 == 0) ? (len / 3) : ((len / 3) + 1)); // 向下取整数
	if (menu_array.length > 0) { // 有下级菜单则继续显示
		if (id != 47) { // 如果不是一级菜单
			menuTitle.html("<div onclick='loadMoreMenu(" + backID + ")' class='back'>返回</div>");
		}
		for (var i = 0; i < row; i++) {
			html_cont = html_cont + "<li>";
			for (var j = 0; j < 3; j++) {
				var index = menu_array[(i * 3 + j)];
				if ((i * 3 + j) < len) {
//					if (index.pid == 47) { //如果为一级菜单
						html_cont = html_cont + "<div class='mainMenu' onclick='loadMoreMenu(" + index.id + 
						")'><ul><li><img src='" + ((index.icon == null) ? defaultImage : imagesRoot +index.icon) + 
						"' width='80px'/></li><li>" + index.name + "</li></div>";
//					} else {
//						html_cont = html_cont + "<div class='mainMenu' onclick='loadMoreMenu(" + index.id + 
//						")'><ul><li><img src='" + ((index.icon == null) ? defaultImage : imagesRoot + index.icon) + 
//						"' width='80px'/></li><li>" + index.name + "</li></div>";
//					}
				} 
			}
			html_cont = html_cont + "</li>";
		}
	} else if (id == 74 || id == 214) { // 进入钻石浏览页面
		// location.href = "diamondListPage.html?classId=" + id;
		location.href = "diamondPage.html?classId=" + id;
	} else {
		location.href = "productListPage.html?classId=" + id;
	}
	html_cont = html_cont + "</ul>";
	menuContent.html(html_cont);
}

// 列出价格
function priceList() {
	var priceData = jsServerData.priceData;
	var priceWidth = $("#searchDiv").width() - 20;
	var content = "<div id='-1' class='selectPrice' onclick='priceSearch(-1, " + priceData[0].pid + ")'>全部</div>";
	for (var i = 0; i < priceData.length; i++) {
		content = content + "<div id='" + priceData[i].id + "' onclick='priceSearch(" + 
		priceData[i].id + ", " + priceData[i].pid + ")' style='width: " + priceWidth + 
		"'>" + priceData[i].name + "</div>";
	}
	$("#searchDiv").html(content);
}

// 右侧菜单事件
function search() {
	var viewData = getViewParams();
	var searchDiv = $("#searchDiv");
	var width = viewData.width;
	if (searchDiv.is(":hidden") && $("#back_shadow").is(":hidden")) {
		searchDiv.css("left", (viewData.width - searchDiv.width()) + "px");
		searchDiv.fadeIn();
	} else {
		searchDiv.fadeOut();
	}
}

// 添加查询参数
function addParameter(parameter, pid) {
	//alert(parameter + "|" + pid+"columnid ="+columnid);
	if (pid == 420) {
		priceTemp = parameter;
	} else if (pid == 422) {
		weightTemp = parameter;
	} else if (pid == 423) {
		colorTemp = parameter;
	} else if (pid == 424) {
		clarityTemp = parameter;
	} else if (pid == 425) {
		cutTemp = parameter;
	}
//	alert(priceTemp + "|" + weightTemp + "|" + colorTemp + "|" + clarityTemp + "|" + cutTemp);
}
	
// 开始查找
function goSearch() {
	clearProductList();
	if (priceTemp != "" && priceTemp != null && priceTemp > 0) {
		typeCode = typeCode + priceTemp + "|";
	}
	if (weightTemp != "" && weightTemp != null && weightTemp > 0) {
		typeCode = typeCode + weightTemp + "|";
	}
	if (colorTemp != "" && colorTemp != null && colorTemp > 0) {
		typeCode = typeCode + colorTemp + "|";
	}
	if (clarityTemp != "" && clarityTemp != null && clarityTemp > 0) {
		typeCode = typeCode + clarityTemp + "|";
	}
	if (cutTemp != "" && cutTemp != null && cutTemp > 0) {
		typeCode = typeCode + cutTemp;
	}
	//$("#moreProduct").show();
	//loadMoreProduct();
	//alert("price_list.html?typeCode=" + typeCode);
	location.href = "price_list.html?typeCode=" + typeCode;
	
}

// 以价格查找
function priceSearch(price, pid) {
	typeCode = "";
	addParameter(price, pid);
	goSearch();
	search();
}

// 以价格查找
function sortSearch(sort, pid) {
	addParameter(sort, pid);
	goSearch();
}
	
//清空页面产品
function clearProductList(){
	//清空数据
	showProductCount = 0;
	$("#productList").html("");
}

function loadSort(id) {
	var sortData = jsServerData.sortData;
	var content = "<table id='sortTable' width='100%' style='padding: 2%'>";
	var count = 0;
	var titleList = new Array();
	for (var i = 0; i < sortData.length; i++) { // 找出选项标题
		if (sortData[i].pid == id) {
			titleList[count] = sortData[i];
			count++;
		}
	}
	var len = 0;
	var row = 0;
	var col = 1;
	for (var i = 0; i < titleList.length; i++) {
		content = content + "<tr><td class='sortTitle'>" + titleList[i].name + 
		":</td><td class='sortTd'><div class='sortContent selectSort' id='" + (0 - i) + "' pid=" + 
		titleList[i].id + " onclick='sortSearch(" + 
		(0 - i) + ", " + titleList[i].id + ")'>全部</div>";
		for (var j = 0; j < sortData.length; j++) {
			if (sortData[j].pid == titleList[i].id) {
//				alert(col);
//				if (col > 0 && (col % 3 == 0)) {
//					content = content + "</tr><tr><td class='sortTitle'></td>";
//				}
				content = content + "<div class='sortContent' id='" + sortData[j].id + 
				"' pid='" + titleList[i].id + "' onclick='sortSearch(" + 
				sortData[j].id + ", " + titleList[i].id + ")'>" + sortData[j].name + "</div>";
				col++;
			}
		}
		col = 1;
		content = content + "</td></tr>";
	}
	content = content + "</table>";
//	alert(content);
//	content = content + "<div align='center'><input id='subbut' type='button' value='提 交' onclick='goSearch()'></div>";
	$("#sortDiv").html(content);
}

//浏览大图
function bigPicture() {
	var small_bullets = document.getElementById('small_scroll_position').getElementsByTagName('li');
	var big_bullets = document.getElementById('big_scroll_position').getElementsByTagName('li');
	// 修改图片标志位
//	alert("page---" + startPic);
	for (var i = 0; i < small_bullets.length; i++) {
		big_bullets[i].className = ' ';
//		small_bullets[i].className = ' ';
		if (startPic == i) {
			big_bullets[i].className = 'on';
//			small_bullets[i].className = 'on';
		}
	}
	var viewData = getViewParams();
	var bodyDiv = $("#goods");
	var bigDiv = $("#bigDiv");
	if (pic == 1) {// 有轮播图
		if (bodyDiv.is(":hidden")) {
//			alert("当前显示大图，改为小图");
			/*Swipe(document.getElementById('bigImage'), {
				auto: 0,
				speed: 500,
				continuous: true,
				disableScroll: true, 
				startSlide: startPic,
				callback: function(pos) {
					var i = small_bullets.length;
					while (i--) {
						small_bullets[i].className = ' ';
					}
					small_bullets[pos].className = 'on';
					startPic = pos;
				}
			});*/
			bigDiv.hide();
			$("#bigList img").css("width", "0px");
			$("#bigList img").css("height", "0px");
			$("#bigList canvas").css("width", "0px");
			$("#bigList canvas").css("height", "0px");
			bigDiv.css("width","0px");
			bigDiv.css("height","0px");
			bodyDiv.css("width","100%");
			bodyDiv.css("height","100%");
			bodyDiv.show();
		} else {
//			alert("当前显示小图，改为大图");
			/*Swipe(document.getElementById('bigList'), {
				auto: 0,
				speed: 500,
				continuous: true,
				disableScroll: true, 
				startSlide: startPic,
				callback: function(pos) {
					var i = big_bullets.length;
					while (i--) {
						big_bullets[i].className = ' ';
					}
					big_bullets[pos].className = 'on';
					startPic = pos;
				}
			});*/
			
			/*$("#bigList ul").height(viewData.width / 3 * 4);
			$("#bigList li").width(viewData.width);
			$("#bigList li").height(viewData.width / 3 * 4);
			//  翻转的图片标签为canvas
			$("#bigList canvas").each(function() {
				$(this).width(viewData.width);
				$(this).height(viewData.width / 3 * 4);
			});

			$("#bigList canvas").bind("taphold", function() {
				if ($("#savePictureDiv").is(":hidden")) {
					saveTemp = true;
					saveUrl = $(this).attr("id");
					selectSave();
				}
			});*/
			
			bigDiv.show();
			bigDiv.css("width","0px");
			bigDiv.css("height","0px");
			bigDiv.css("width","100%");
			bigDiv.css("height",viewData.height);
			bodyDiv.hide();
		}
	} else {
//		messageBox("暂无大图");
		bodyDiv.hide();
		bigDiv.css("width","100%");
		bigDiv.css("height","100%");
		bigDiv.html("暂无大图");
	}
}

//隐藏大图层
function hideBigList(){
	var viewData = getViewParams();
	var bodyDiv = $("#goods");
	var bigDiv = $("#bigDiv");

	bigDiv.hide();
	$("#bigList img").css("width", "0px");
	$("#bigList img").css("height", "0px");
	$("#bigList canvas").css("width", "0px");
	$("#bigList canvas").css("height", "0px");
    bigDiv.css("width","0px");
    bigDiv.css("height","0px");
    bodyDiv.css("width","100%");
    bodyDiv.css("height","100%");
    bodyDiv.show();
}



//隐藏左侧菜单
function hideMenu(){
	var viewport_height = $(window).height();
    var leftMenu = $("#leftMenuDiv");
	var footer = $("#footer");
	var top_height = viewport_height-leftMenu.outerHeight()-footer.outerHeight();
	leftMenu.css("top",top_height);
	var viewData = getViewParams();
	var content = $("#content");
	var leftMenuDiv = $("#leftMenuDiv");
	var back_shadow = $("#back_shadow");

	if (!(leftMenuDiv.is(":hidden"))) {

		//div向下移动，相对于父DIV来说的，并不是绝对的移动
		// 当左菜单显示时执行
		var mune_top = (viewData.height) + "px";
		var foot_top = (viewData.height - 57) + "px";
//		back_shadow.fadeOut();
		back_shadow.css("display", "none");
		leftMenuDiv.animate({ 'top': mune_top }, "fast", function() {  	
			footer.css("display", "block").css("height", "55px").css({ "top": foot_top });
			if (footer.offset().top == (viewData.height - 57) || footer.offset().top == (viewData.height - 56)) {
				content.css("height", (viewData.height - 121) + "px");
			}
			leftMenuDiv.css("height","0px");
			leftMenuDiv.css("display", "none");
        });
	}
}

//右侧菜单事件
function hideSearch() {
	var viewData = getViewParams();
	var searchDiv = $("#searchDiv");
	var width = viewData.width;
	if (!searchDiv.is(":hidden")) {
		searchDiv.fadeOut();
	}
}

// 侧图标右移
function moveRight() {
	var viewData = getViewParams();
	var width = viewData.width;
	$(".right_icon").css("left", (width - 58) + "px");
}

// 改变产品展示样式
function modifyProductDiv(productWidth) {
	productDiv = $(".productDiv");
	// 找到样式为productDiv下所有的img图片，并设置图片的高度
	var img = $(".productDiv img");
	img.height(img.width() / 4 * 3);
	
	var li = $(".content li");
	
	var divHeight = (productWidth-6) / 4 * 3 + 78;
	li.height(divHeight+14);
	productDiv.height(divHeight);
}

// 创建头部
function createHead(type) {
	var navbar_div = $(".navbar_div");
	var viewData = getViewParams();
	var width = viewData.width;
	
	var headContent = "";
	if (type != "login") {
		headContent = headContent + '<td style="width:55px"><img id="head_left" src="../images/head_left.png" onclick="showProductList();"/></td>';
	} else {
		headContent = headContent + '<td style="width:55px"></td>';
	}
	headContent = headContent + '<td align="center"><img id="head_center" src="www/./images/logo1.png"/></td>';
	
	if (type == "search") {
		headContent = headContent + '<td style="width:55px"><img id="head_right" src="../images/head_search.png" onclick="search();" /></td>';
	} else if (type == "back") {
		headContent = headContent + '<td style="width:55px"><img id="head_right" src="../images/head_search.png" onclick="javascript:history.back(-1);"/></td>';
	} else if (type == "backlist") {
		headContent = headContent + '<td style="width:55px"><img id="head_right" src="../images/head_search.png"  onclick="backlist();"/></td>';
	}
	headContent = "<table width='100%'><tr>"+headContent+"</tr></table>";
	navbar_div.html(headContent);
}

// 点击左上角的图标显示全部产品列表
function showProductList(){
	location.href = "productListPage.html?";
}

// 得到图片路径
function getPicUrl(subList) {
	if (subList == null || subList.length == 0) {
		return "../images/testImage.jpg";
	} else {
		return (imagesRoot + subList[0].pic);
	}
}

// 获取文件名
function getpicname(url) {
	var pos = url.lastIndexOf("/");
	return url.substring(pos + 1);
}

// 用时间创建文件名 
function createPicName(url){
	var name = getpicname(url);
	var suffix = name.substring((name.lastIndexOf(".")));
	var dt = getNewDateInfo();
	return (dt+suffix);
}

function movePicture(obj, parameter) {
	
}


// 等待加载PhoneGap
document.addEventListener("deviceready", onDeviceReadyTime, false);
// PhoneGap加载完毕
function onDeviceReadyTime() {
	//window.localStorage.removeItem("newMessageId"); 
	//window.localStorage.removeItem("newGoodsId"); 
	
	// 定时任务 推送新资讯
	setInterval(sendMessageToTop,300000);
}

//向消息栏推送新资讯
function sendMessageToTop(){
	var formData = "func=getContentList&appid=3dd96b47ad344230bb2d13a26176b4cb&appsecret=123456&columnid=213&start=0&limit=1&a="+Math.random(); 
	$.ajax({ 
        type : "POST", 
        url  : "http://123.57.48.96/common/api/app/interface.jsp",  
        cache : false, 
        async : true,
        timeout: 10000,
        data : formData, 
        success : getNewMessageSuccess, 
        error : getNewMessageError 
    });
}

//得到新资讯成功
function getNewMessageSuccess(data,status){
	var newMessageId = window.localStorage.newMessageId;
	var dataList = data.funcdata.list;
	if(newMessageId=="" || newMessageId != dataList[0].id){
		window.localStorage.setItem("newMessageId",dataList[0].id);
		window.plugins.StatusBarNotificationPlugin.notify("", "", "尚珍阁资讯更新", "最新资讯："+dataList[0].title);
	}else{
		// 定时任务 推送新产品
		sendGoodsToTop();
	}
}

//得到新资讯失败
function getNewMessageError(data,status){
	
}

//向消息栏推送新商品
function sendGoodsToTop(){
	var formData = "func=getContentList&appid=3dd96b47ad344230bb2d13a26176b4cb&appsecret=123456&columnid="+columnid+"&b="+Math.random(); 
	$.ajax({ 
        type : "POST", 
        url  : "http://123.57.48.96/common/api/app/interface.jsp",  
        cache : false, 
        async : true,
        timeout : 3000,
        data : formData, 
        success : getNewGoodsSuccess, 
        error : getNewGoodsError 
    });
}

//得到新商品成功
function getNewGoodsSuccess(data,status){
	var newGoodsId = window.localStorage.newGoodsId;
	var dataList = data.funcdata.list;
	if(newGoodsId=="" || newGoodsId != dataList[0].id){
		window.localStorage.setItem("newGoodsId",dataList[0].id);
		window.plugins.StatusBarNotificationPlugin.notify("", "", "尚珍阁商品更新", "最新商品："+dataList[0].title);
	}
}

//得到新商品失败
function getNewGoodsError(data,status){
	
}

function gotoAppointLoaction(locationId){
    if( undefined != locationId ){
    var locationObj = document.getElementById(locationId);
    if( null!=locationObj ){
    window.location.href="#"+locationId;
	}else{
	    alert("定位失败，指定位置id不存在！");
	}
	}else{
	    alert("定位失败，指定位置id为空！");
	}
}


var winWidth = $(window).width();

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
function hideLoader(){  
  $.mobile.loading('hide');  
}

//默认3秒消失的信息提示框
function messageBox(str,second) {
	if(!second){second=3000;}
	
	showLoader(str,true); 
  var messageBox = setTimeout(function(){$.mobile.loading('hide')}, second);
}

//弹出隐藏层
function showDiv(show_div,bg_div){
	var clientHeight = document.body.scrollHeight;
	var clientWidth = document.body.scrollWidth;
	var show_div = document.getElementById(show_div);
	var bg_div = document.getElementById(bg_div);
	show_div.style.display = 'block';
	show_div.style.top = (clientHeight-show_div.offsetHeight)/2 + "px";
	show_div.style.left = (clientWidth-show_div.offsetWidth)/2 + "px";
	
	bg_div.style.display='block';
	bg_div.style.width = clientWidth + "px";
	bg_div.style.height = clientHeight + "px";
}
//关闭弹出层
function closeDiv(show_div,bg_div) {
	document.getElementById(show_div).style.display='none';
	document.getElementById(bg_div).style.display='none';
}

//判断设备的图标
function getComponentIcon(type, online){
	if(type=="erelay"){  // 灌溉机
		return "../images/category1.png";
	} else if(type=="erelay2"){  // goole卷帘机
		return "../images/category2.png";
	} else if(type=="cameraip"){
		if(online=="online"){  // 在线的摄像头
			return "../images/category3.png";
		} else {
			return "../images/category4.png";
		}
	} else if(type=="camera"){  // 拍照镜头
		return "../images/category5.png";
	} else if(type=="humidity-temperature"||type=="humidity"||type=="temperature"){   // 传感器
		return "../images/category7.png";
	}
}
function getDefaultNameByExtendType(name){
	if (name == "erelay2-shutter") {
		return "卷帘机控制器";
	} else if (name == "erelay-water-valve") {
		return "水阀控制器";
	} else if (name == "erelay_ventilation") {
		return "放风机控制器";
	} else if (name == "erelay_lamp") {
		return "灯光控制器";
	} else {
		return "未知控制器";
	}
}
//格式化时间 （2014-03-18 01:28:42）
function formatDate(date){
	var d=new Date(date); 
	var dates = "";
	if(d.getHours()<10){
		dates = dates+"0"+d.getHours();//+":";
	}else{
		dates = dates+d.getHours();//+":";
	}
	/*if(d.getMinutes()<10){
		dates = dates+"0"+d.getMinutes()+":";
	}else{
		dates = dates+d.getMinutes()+":";
	}
	if(d.getSeconds()<10){
		dates = dates+"0"+d.getSeconds();
	}else{
		dates = dates+d.getSeconds();
	}*/
	return dates;
}

function getState(online, status){
	if(online=="online"){
			return {icon:"../images/open.png",text:"打开",val:online,btn_icon:"../images/button_open.png"};
	} else {
		return {icon:"../images/close.png",text:"关闭",val:online,btn_icon:"../images/button_close.png"};
	}
}

function showCgqName(arr,parentId,type,cnt){
	var nameHtml = "";
	var name= "大棚环境平均值";
	var className = "first-btn foucs";
	nameHtml = nameHtml + "<button  id='name_"+(0+1)+"_"+cnt+"_"+type+"' name='name_"+cnt+"_"+type+"' class='"+className+"'>"+name+"&nbsp;</button>";
	document.getElementById(parentId).innerHTML = nameHtml;
}

//更改传感器名称的样式
function changeNameCss(index,total,type,cnt){
	if(total>1){  // 需要改变名称的样式
		var arr = document.getElementsByName("name_"+cnt+"_"+type);
		if(arr!=null && arr.length>0){
			for(var i=0; i<arr.length; i++){
				if(i==0){
					arr[i].className="first-btn";
				} else if(i==arr.length-1){
					arr[i].className="last-btn";
				} else {
					arr[i].className="middle-btn";
				}
			}
		}
		var className = "last-btn foucs";
		if(index==1){
			className="first-btn foucs";
		} else if(index==total){
			className="middle-btn foucs";
		}
		document.getElementById("name_"+index+"_"+cnt+"_"+type).className = className;
	}
}

var temperatureArr = new Array(6);
temperatureArr[0] = new Array(0,"#178D3E");
temperatureArr[1] = new Array(20,"#8CC752");
temperatureArr[2] = new Array(40,"#D6E02C");
temperatureArr[3] = new Array(60,"#FFD80F");
temperatureArr[4] = new Array(80,"#D87021");
temperatureArr[5] = new Array(100,"#ED1C24");

var humidityArr = new Array(6);
humidityArr[0] = new Array(20,"#178D3E");
humidityArr[1] = new Array(40,"#8CC752");
humidityArr[2] = new Array(60,"#D6E02C");
humidityArr[3] = new Array(80,"#FFD80F");
humidityArr[4] = new Array(100,"#D87021");
humidityArr[5] = new Array(150,"#ED1C24");

var chargeArr = new Array(3);
chargeArr[0] = new Array(0,"#D2232D");
chargeArr[1] = new Array(10,"#FFCB16");
chargeArr[2] = new Array(50,"#4FA03E");

function getColor(val,arr,flag){
	for(var i=0; i<arr.length; i++){
		if(i==0&&val<arr[i][0]){
			return arr[i][1];
		}else if(i==arr.length-1){
			return arr[i][1];
		} else if(val>=arr[i][0]&&val<arr[i+1][0]){
			return arr[i][1];
		}
	}
}

//测试的照片数据
var picArr = new Array(6);
picArr[0] = {dev_uuid:"111",component_id:4,url:"http://img13.360buyimg.com/n7/jfs/t907/207/70966349/442657/2621ce2e/54f959acN46e1b7c8.jpg",date:"2015-04-08 15:54:34"};
picArr[1] = {dev_uuid:"111",component_id:4,url:"http://img10.360buyimg.com/n7/g14/M04/1E/04/rBEhVlM-fdkIAAAAAAJBGnr41VUAALYCwLYnBwAAkEy423.jpg",date:"2015-04-08 15:54:34"};
picArr[2] = {dev_uuid:"111",component_id:4,url:"http://img10.360buyimg.com/n7/jfs/t193/98/880611957/350605/3ae8aac3/539ac9bbN79858776.jpg",date:"2015-04-08 15:54:34"};
picArr[3] = {dev_uuid:"111",component_id:4,url:"http://img10.360buyimg.com/n7/jfs/t1126/149/80606865/241837/fd89425c/550675ecN171a9783.jpg",date:"2015-04-08 15:54:34"};
picArr[4] = {dev_uuid:"111",component_id:4,url:"http://img10.360buyimg.com/n7/jfs/t673/349/330185098/223203/a74207e8/545ef856N28ac8a21.jpg",date:"2015-04-08 15:54:34"};
picArr[5] = {dev_uuid:"111",component_id:4,url:"http://img13.360buyimg.com/n7/jfs/t448/133/1110080866/256213/7a403624/54b4b424Nc243f4bf.jpg",date:"2015-04-08 15:54:34"};

var main_picArr = new Array(4);
main_picArr[0] = {dev_uuid:"111",component_id:4,url:"http://img13.360buyimg.com/n7/jfs/t907/207/70966349/442657/2621ce2e/54f959acN46e1b7c8.jpg",date:"2015-04-08 15:54:34"};
main_picArr[1] = {dev_uuid:"111",component_id:4,url:"http://img10.360buyimg.com/n7/g14/M04/1E/04/rBEhVlM-fdkIAAAAAAJBGnr41VUAALYCwLYnBwAAkEy423.jpg",date:"2015-04-08 15:54:34"};
main_picArr[2] = {dev_uuid:"111",component_id:4,url:"http://img10.360buyimg.com/n7/jfs/t193/98/880611957/350605/3ae8aac3/539ac9bbN79858776.jpg",date:"2015-04-08 15:54:34"};
main_picArr[3] = {dev_uuid:"111",component_id:4,url:"http://img10.360buyimg.com/n7/jfs/t1126/149/80606865/241837/fd89425c/550675ecN171a9783.jpg",date:"2015-04-08 15:54:34"};

//测试的报警数据
var alarmListJson = new Array(7);
alarmListJson[0] = {date:"2015-04-09 12:12:35",dev_type:"yydev1",dev_uuid:"1111",alarm_type:"上下线",alarm_val:"温度高于50c",alias:"温湿度传感器"};
alarmListJson[1] = {date:"2015-04-09 12:12:35",dev_type:"yydev1",dev_uuid:"1111",alarm_type:"上下线",alarm_val:"电量只剩5%，请尽快更换电池，预计还可以工作10天",alias:"普通开关继电器"};
alarmListJson[2] = {date:"2015-04-09 12:12:35",dev_type:"yydev1",dev_uuid:"1111",alarm_type:"上下线",alarm_val:"指定区域有物体运动",alias:"摄像头"};
alarmListJson[3] = {date:"2015-04-09 12:12:35",dev_type:"yydev1",dev_uuid:"1111",alarm_type:"上下线",alarm_val:"一氧化碳浓度过高",alias:"温湿度传感器"};
alarmListJson[4] = {date:"2015-04-09 12:12:35",dev_type:"yydev1",dev_uuid:"1111",alarm_type:"上下线",alarm_val:"二氧化碳浓度过低",alias:"温湿度传感器"};
alarmListJson[5] = {date:"2015-04-09 12:12:35",dev_type:"yydev1",dev_uuid:"1111",alarm_type:"上下线",alarm_val:"光照强度过高",alias:"温湿度传感器"};
alarmListJson[6] = {date:"2015-04-09 12:12:35",dev_type:"yydev1",dev_uuid:"1111",alarm_type:"上下线",alarm_val:"设备出现故障",alias:"拍照镜头"};
