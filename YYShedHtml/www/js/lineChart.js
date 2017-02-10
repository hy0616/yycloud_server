var LineChart={
	keynames:[],//数据信息数组
	can:undefined,
	ctx:undefined,
	width:undefined,
	lineColor:undefined,
	dotColor:undefined,
	isBg:false,
	isMultiData:false,
	xTitle:undefined,
	x_r:undefined,   // 图最右边空出的长度
	y_t:undefined,   // 图最上边空出的长度
	setData:function(canId,data,padding,lineColor,dotColor,isBg,isMultiData,xTitle){
		this.lineColor = lineColor;
		this.dotColor = dotColor;
		this.can = document.getElementById(canId);
		this.ctx = this.can.getContext("2d");
		this.isBg = isBg;
		this.isMultiData = isMultiData;
		this.xTitle = "温度c";
		this.x_r = 20;
		this.y_t = 14;
		this.drawXY(data,0,padding,this.can);
	},
	isMultiData:function(data){
		if(data.values.length>1){
			this.isMultiData = true;
		}
	},//是否是多条数据线
	drawXY:function(data,key,padding,can){
		this.ctx.lineWidth="1";
		this.ctx.strokeStyle="black";
		this.ctx.font = '15px sans-serif';
		this.ctx.beginPath();
		this.ctx.moveTo(padding,this.y_t)
		this.ctx.lineTo(padding,can.height-padding);
		this.ctx.lineTo(can.width-this.x_r,can.height-padding);
		this.ctx.stroke();
		var perwidth = this.getPixel(data,key,can.width,padding,this.x_r);//x 轴每一个数据占据的宽度
		var xcount = data.values[key]["value"+key].length;
		
		var y_arr = new Array(0,20,30,40,50,60,70,80,90,100);
		var maxY =  this.getMax(data,0,this.isMultiData);//获得Y轴上的最大值
		var minY = this.getMin(data,0,this.isMultiData);  //获取Y轴上的最小值
		if(minY<0){
			y_arr = new Array(-20,0,20,30,40,50,60,70,80,90,100);
		}
		var yPixel = this.getYPixel(y_arr.length,can.height,padding,this.y_t);
		var ycount = y_arr.length;
		
		for( var i=0,ptindex;i<xcount;i++ ){
			var x_y = can.height-padding+20;
			var x_x = i*perwidth+padding-this.x_r;
			this.ctx.fillText(data.values[key]["value"+key][i].x,x_x,x_y,perwidth);
		}
		this.ctx.textAlign = "right"//y轴文字靠右写
		this.ctx.textBaseline = "middle";//文字的中心线的调整
		var yCnt = 0;
		for(var i=ycount-1;i>=0;i--){
			var y_x = padding-5;
			var y_y = i*yPixel+padding-this.y_t;
			this.ctx.fillText(y_arr[yCnt],y_x,y_y,perwidth);
			yCnt++;
		}
		if(this.isBg){
			var x =  padding;
			this.ctx.lineWidth="1";
			this.ctx.strokeStyle="#F0F0F0";
			for(var i=0;i<ycount-1;i++){    //画横线
				var y = can.height - padding - (i+1)*yPixel;
				if(i==ycount-2)y=1+this.y_t;
				this.ctx.moveTo(x,y);
				this.ctx.lineTo(can.width-this.x_r,y);
				this.ctx.stroke();
			}
			var y = can.height-padding;
			for(var i=0;i<xcount-1;i++){  // 画竖线
				x = (i+1)*perwidth+padding;
				if(i==xcount-2){
					x = can.width-1-this.x_r;
				}
				this.ctx.moveTo(x,y);
				this.ctx.lineTo(x,this.y_t);
				this.ctx.stroke();
			}
		}//选择绘制背景线
		this.ctx.closePath();
		this.drawData(data,0,padding,perwidth,yPixel,this.isMultiData,this.lineColor,can.height,y_arr);
	},//绘制XY坐标 线 以及点
	drawData:function(data,key,padding,perwidth,yPixel,isMultiData,lineColor,canHeight,y_arr){
		if(!isMultiData){
			var keystr = "value"+key;
			this.ctx.beginPath();
			this.ctx.lineWidth="2";
			if(arguments[6]){
				this.ctx.strokeStyle=lineColor;
			}else{
				this.ctx.strokeStyle=this.lineColor;
			}
			var startX = this.getCoordX(padding,perwidth,0);
			var startY = this.getCoordY(padding,yPixel,data.values[key][keystr][0].y);
			this.ctx.beginPath();
			this.ctx.lineWidth="2";
			for( var i=0;i< data.values[key][keystr].length;i++){
				var value = data.values[key][keystr][i].y;

				var y = 0;
				for(var j=0; j<y_arr.length; j++){
					if(j==y_arr.length-1){
						y = this.getCoordY(padding,yPixel,value,i,value-Number(y_arr[j]));
					} else if(value>=Number(y_arr[j]) && value<Number(y_arr[j+1])){
						y = this.getCoordY(padding,yPixel,value,j,value-Number(y_arr[j]));
						break;
					}
				}

				if(i>0){
					
				}

				var x = i*perwidth+padding;
				this.ctx.lineTo(x,y);

			}
			this.ctx.stroke();
			this.ctx.closePath();
			/*下面绘制数据线上的点*/
			this.ctx.beginPath();
			this.ctx.fillStyle=this.dotColor;
			for( var i=0;i< data.values[key][keystr].length;i++ ){
				var x = i*perwidth+padding;
				var value = data.values[key][keystr][i].y;
				var y = 0;
				for(var j=0; j<y_arr.length; j++){
					if(j==y_arr.length-1){
						y = this.getCoordY(padding,yPixel,value,i,value-Number(y_arr[j]));
					} else if(value>=Number(y_arr[j]) && value<Number(y_arr[j+1])){
						y = this.getCoordY(padding,yPixel,value,j,value-Number(y_arr[j]));
						break;
					}
				}

				this.ctx.moveTo(x,y);
				this.ctx.arc(x,y,3,0,Math.PI*2,true);//绘制数据线上的点
				this.ctx.fill();
			}
			this.ctx.closePath();
		}else{//如果是多条数据线
			for( var i=0;i< data.values.length;i++ ){
				var color = "rgb("+parseInt(Math.random()*256)+","+parseInt(Math.random()*256)+","+parseInt(Math.random()*256)+")";
				LineChart.drawData(data,i,padding,perwidth,yPixel,false,color);
				LineChart.drawKey(color,this.keynames[i],padding,i);
			}
		}
	},//绘制数据线和数据点
	getPixel:function(data,key,width,padding,r){
		var count = data.values[key]["value"+key].length-1;
		return parseInt((width-padding-r)/count);
	},//宽度
	getCoordX:function(padding,perwidth,ptindex){
		return 2.5*perwidth*ptindex+padding+10-2*perwidth;
	},//横坐标X 随ptindex 获得
	getCoordY:function(padding,yPixel,value,index,c){
		//var y = yPixel*value;
		//return this.can.height-padding-y;
		
		var y = yPixel*index+yPixel/20*c;
		//alert(yPixel+"  "+index+"  "+c);
		return this.can.height-padding-y;

	},//纵坐标X 随ptindex 获得(注意 纵坐标的算法是倒着的因为原点在最上面)
	getYPixel:function(ycount,height,padding,t){
		//var ycount = (parseInt(parseInt(maxY-minY)/10)+1)*10+10;//y轴最大值
		return parseInt((height-padding-t)/(ycount-1));
	},//y轴的单位长度
	getMax:function(data,key,isMultiData){
		if(!isMultiData){
			var maxY = data.values[key]["value"+key][0].y;
			var length = data.values[key]["value"+key].length;
			var keystr = "value"+key;
			for( var i=1;i< length;i++ ){
				if(maxY< data.values[key][keystr][i].y) maxY=data.values[key][keystr][i].y;
			}
			return maxY;//返回最大值 如果不是多数据
		}else{
			var maxarr=[];
			var count = data.values.length;//多条数据的数据长度
			for(var i=0;i< count;i++){
				maxarr.push(LineChart.getMax(data,i,false));
			}
			var maxvalue = maxarr[0];
			for(var i=1;i< maxarr.length;i++){
				maxvalue = (maxvalue< maxarr[i])?maxarr[i]:maxvalue;
			}
			return maxvalue;
		}//如果是多数据
	},
	getMin:function(data,key,isMultiData){
		if(!isMultiData){
			var minY = data.values[key]["value"+key][0].y;
			var length = data.values[key]["value"+key].length;
			var keystr = "value"+key;
			for( var i=1;i< length;i++ ){
				if(minY>data.values[key][keystr][i].y) minY=data.values[key][keystr][i].y;
			}
			return minY;//返回最小值 如果不是多数据
		}else{
			var minarr=[];
			var count = data.values.length;//多条数据的数据长度
			for(var i=0;i< count;i++){
				minarr.push(LineChart.getMin(data,i,false));
			}
			var minvalue = minarr[0];
			for(var i=1;i< minarr.length;i++){
				minvalue = (minvalue>minarr[i])?minarr[i]:minvalue;
			}
			return minvalue;
		}//如果是多数据
	},
	setKey:function(keynames){//keynames 是数组
		for(var i=0;i< keynames.length;i++){
			this.keynames.push(keynames[i]);//存入数组中
		}
	},
	drawKey:function(color,keyname,padding,lineindex){
		var x = padding+10;
		var y = this.can.height - padding+20+13*(lineindex+1);
		this.ctx.beginPath();
		this.ctx.strokeStyle = color;
		this.ctx.font="10px";
		this.ctx.moveTo(x,y);
		this.ctx.lineTo(x+50,y);
		this.ctx.fillText(":"+keyname,x+80,y,30);
		this.ctx.stroke();
		this.ctx.closePath();
	}	
}