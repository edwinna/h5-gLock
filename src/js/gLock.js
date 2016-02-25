(function($,window,document){
	"use strict";
	var defaults = {
		radius: 30, //圆半径
		marginW: 30 //距离边界的宽度
	}

	function Glock(options){
		this.options = options;
		this.canvas = document.getElementById(this.options.lockId)
		this.ctx = this.canvas.getContext('2d');
		this.init();
	}
	Glock.prototype = {
		constructor: Glock,
		//初始化位置
		init: function(){
			var opts = this.options;
			var bodyWidth =  document.body.offsetWidth;
			var canvas = this.canvas;
			opts.CW = opts.CW ? opts.CW : document.body.offsetWidth;
			canvas.width = opts.CW;  //设置画布的宽高
			canvas.height = opts.CH;
			var disX = opts.distance ? opts.distance : (opts.CW - 2*opts.marginW - 2*3*opts.radius) /2   //两个小球之间的横向距离;
			this.linePathArr = [];
			this.coordinateArr = this.calCoordinates(disX); //获取九宫格位置坐标
			this.drawCircle();
			this.initEvents();
		},
		//计算小球的坐标
		calCoordinates: function(dis){
			var opts = this.options;
			var r = opts.radius;
			var marginW = opts.marginW;
			var points = [];
			for(var row = 0; row < 3; row++){
				for(var col = 0; col < 3; col++){
				    var point = {
				    	X: marginW + dis * col + (2*col + 1) * r,
				    	Y: marginW + dis * row + (2*row +　1) * r
				    }
				    points.push(point);
				}
			}
			return points;
		},
		drawCircle: function(){
			var coordinateArr = this.coordinateArr; 
			var ctx = this.ctx;
			var opts = this.options;
			var linePathArr = this.linePathArr;  //记录经过的圆的索引
			for(var i = 0 ; i < coordinateArr.length; i++){
				var Point = coordinateArr[i];
				ctx.beginPath();
				ctx.fillStyle = "#627eed";
				ctx.arc(Point.X, Point.Y, opts.radius, 0, Math.PI * 2, true);  //绘制外圆
				ctx.fill();
				ctx.closePath(); 
				ctx.fillStyle = "#fff";
				ctx.beginPath();
				ctx.arc(Point.X, Point.Y, opts.radius - 3, 0, Math.PI * 2, true);  //绘制内圆，外圆减内圆就是最终的效果
				ctx.fill();
				ctx.closePath();
				if(linePathArr.indexOf(i) > 0){ //路径上的圆中心为实心
					ctx.beginPath();
					ctx.fillStyle = "blue";
					ctx.arc(Point.X, Point.Y, opts.radius - 15, 0, Math.PI *2, true);
					ctx.fill();
					ctx.closePath();
				}
			}
		},

		//添加经过的路径
		addLinePath: function(move){
			var coordinateArr = this.coordinateArr;
			for(var i = 0; i< coordinateArr.length; i++){
				var disX = move.pageX - coordinateArr[i].X;
				var disY = move.pageY - coordinateArr[i].Y;
				var dis = Math.pow(disX * disX + disY * disY, 0.5);

				if(dis < this.options.radius){

					if(this.linePathArr.indexOf(i) < 0){
						this.linePathArr.push(i);
					}
					break;
				}
			}
		},
		draw: function(touches){
			var _linePathArr = this.linePathArr;
			if(_linePathArr.length > 0){
				var coordinateArr = this.coordinateArr;
				var ctx = this.ctx;
				ctx.beginPath();
				for(var i = 0; i< _linePathArr.length; i++){
					var _linePathIndex = _linePathArr[i];
					ctx.lineTo(coordinateArr[_linePathIndex].X, coordinateArr[_linePathIndex].Y);
				}
				ctx.lineWidth = 10;
				ctx.strokeStyle = "#627eed";
				ctx.stroke();
				ctx.closePath();
				if(touches != null){
					var _lastIndex = _linePathArr[_linePathArr.length - 1]
					ctx.beginPath();
					ctx.moveTo(coordinateArr[_lastIndex].X, coordinateArr[_lastIndex].Y);
					ctx.lineTo(touches.pageX, touches.pageY);
					ctx.stroke();
					ctx.closePath();
				}
				this.drawCircle();
			}
		},
		initEvents: function(){
			var self = this;
			var canvas = this.canvas;
			canvas.addEventListener('touchstart', function(event){
				self.addLinePath(event.touches[0]);
			}, false);
			canvas.addEventListener('touchmove', function(event){
				event.preventDefault();
				self.addLinePath(event.touches[0]);
				self.ctx.clearRect(0,0,self.options.CW, self.options.CH);
				self.draw(event.touches[0]);
			}, false);
			canvas.addEventListener('touchend', function(event){
				self.ctx.clearRect(0,0,self.options.CW, self.options.CH);
				self.draw(null);
				this.linePathArr = [];
			}, false)
		}
	}

	window.gLock = function(options){
		var options = $.extend(defaults, options);
		return new Glock(options);
	}
	
})(jQuery,window,document)