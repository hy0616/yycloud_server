function putCanvasInDiv(divId,canvas){
    document.getElementById(divId).appendChild(canvas);
}

function initJsonParams(canvasJson){
    if( undefined==canvasJson.lineWidth ){
	    canvasJson.lineWidth = 1;
	}
	if( undefined==canvasJson.strokeStyle ){
	    canvasJson.strokeStyle = "red";//"Black";
	}
	if( undefined==canvasJson.fillStyle ){
	    canvasJson.fillStyle = "red";//"Black";
	}
	if( undefined==canvasJson.arrowsLength ){////箭头长度
	    canvasJson.arrowsLength = 100;
	}
	if( undefined==canvasJson.aRSCircleRadius ){//箭头底端圆半径
	    canvasJson.aRSCircleRadius = 10;
	}
	if( undefined==canvasJson.dialMaxValue ){//表盘最大值
	    canvasJson.dialMaxValue = 100;
	}
	if( undefined==canvasJson.dialMinValue ){//表盘最小值
	    canvasJson.dialMinValue = 0;
	}
	if( undefined==canvasJson.dialValue ){//表盘箭头指向值
	    canvasJson.dialValue = 0;
	}
	if( undefined==canvasJson.pointerImage ){//指针默认图片
	    canvasJson.pointerImage = "../images/pointer.png";
	}
	if( undefined==canvasJson.bpImgHeight ){//表盘高
	    canvasJson.bpImgHeight = 94;
	}
	if( undefined==canvasJson.bpImgWidth ){//表盘宽
	    canvasJson.bpImgWidth = 190;
	}
	if( undefined==canvasJson.pointerImgHeight ){//指针图片高
	    canvasJson.pointerImgHeight = 10;
	}
	if( undefined==canvasJson.pointerImgWidth ){//指针图片宽
	    canvasJson.pointerImgWidth = 40;
	}
	if(undefined==canvasJson.className){ // 样式
		canvasJson.className = "";
	}

	return canvasJson;
}

function getDrawLineCanvas(canvasJson){
    canvasJson = initJsonParams(canvasJson);
    var newCanvas = document.createElement('canvas');
	newCanvas.setAttribute('width',canvasJson.width);
	newCanvas.setAttribute('height',canvasJson.height);
	if( undefined != canvasJson.backgroundImage ){
	    newCanvas.style.backgroundImage=canvasJson.backgroundImage;
	}
    newCanvas.innerHTML = "浏览器不支持Canvas渲染";
	var context = newCanvas.getContext("2d");	//context.beginPath();
	context.strokeStyle = canvasJson.strokeStyle;
	context.fillStyle = canvasJson.fillStyle;//"red";
	context.lineWidth = canvasJson.lineWidth;  
	context.translate(canvasJson.width/2,canvasJson.height);

	var aRSCircleRadius = canvasJson.aRSCircleRadius;//箭头底端圆半径
	var arrowsLength = canvasJson.arrowsLength;//箭头长度
	var radian = canvasJson.dialValue/canvasJson.dialMaxValue * Math.PI ; //弧度
	var arrowsX = -Math.round( Math.cos( radian ) * arrowsLength ); //箭头x坐标
	var arrowsY = - Math.round( Math.sin( radian ) * arrowsLength ); //箭头y坐标
	
	//箭头低端圆圈
	context.arc(0,-aRSCircleRadius,aRSCircleRadius,0,Math.PI*2); 
    context.fill();
	context.moveTo(0, 0);
	//context.rotate(canvasJson.angle*Math.PI/180);	
	//context.lineTo(-canvasJson.width/2,0);
	//alert(aRSCircleRadius +"    "+arrowsX + "    "+ (-arrowsY));
	if( aRSCircleRadius> (-arrowsY) ){
	    arrowsY = arrowsY - aRSCircleRadius;
	}

	if( radian == (Math.PI/2) ){//箭头垂直向上
	    context.lineTo(-aRSCircleRadius,-aRSCircleRadius);
		context.lineTo(0,-arrowsLength);
		context.lineTo(aRSCircleRadius,-aRSCircleRadius);
	}else{
		context.lineTo(arrowsX,arrowsY);//箭头顶端
		context.lineTo(0,-2*aRSCircleRadius);
	}
	
	context.closePath(); 
	context.stroke();  
	context.fill();
	return  newCanvas;    	 
}		

//获取表盘显示 图片指针
function drawPointImgCanvas(canvasJson){
    canvasJson = initJsonParams(canvasJson);
    var newCanvas = document.createElement('canvas');
	newCanvas.setAttribute('width',canvasJson.canvasWidth);
	newCanvas.setAttribute('height',canvasJson.canvasHeight);
	newCanvas.setAttribute('class',canvasJson.className);
	
	var bpImg = new Image();
	bpImg.src = canvasJson.backgroundImage;
	bpImg.onload = function(){  
		var pointImg = new Image();
		pointImg.src = canvasJson.pointerImage;
		pointImg.height = canvasJson.pointerImgHeight;
		pointImg.width = canvasJson.pointerImgWidth;
		pointImg.onload = function(){
			var pointImgHeight = pointImg.height;
			if( undefined != canvasJson.backgroundImage ){
			    newCanvas.style.backgroundSize= canvasJson.canvasWidth+"px " +canvasJson.canvasHeight+"px";
			    newCanvas.style.backgroundImage='url('+canvasJson.backgroundImage+')';
			    newCanvas.style.backgroundRepeat='no-repeat';
			}else{
				alert("canvasJson.backgroundImage is undefined");
			}
			newCanvas.innerHTML = "浏览器不支持Canvas渲染";
			var aRSCircleRadius = pointImgHeight/2;// canvasJson.aRSCircleRadius;//箭头底端圆半径
			var context = newCanvas.getContext("2d");
			context.translate(canvasJson.canvasWidth/2 ,(canvasJson.canvasHeight-aRSCircleRadius));
			
			var maxRelativeValue = (canvasJson.dialMaxValue-canvasJson.dialMinValue);
			if( canvasJson.dialValue < canvasJson.dialMinValue ){
				pointRelativeValue = 0;
			}else{
				pointRelativeValue = (canvasJson.dialValue -canvasJson.dialMinValue);
			}

			if( pointRelativeValue > maxRelativeValue ){
				pointRelativeValue = maxRelativeValue;
			}
			var radian = pointRelativeValue / maxRelativeValue *180 ; //弧度
			context.rotate((radian-180)*Math.PI/180);
			context.drawImage(pointImg,-aRSCircleRadius,-aRSCircleRadius,40,10);
			putCanvasInDiv(canvasJson.objId,newCanvas);
		};
    };  
}