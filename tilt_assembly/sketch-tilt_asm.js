// MIT License
//
// Copyright (c) 2017, Dominik Krupke
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.
//
// This code uses the p5.js library.



class TiltAssemblySketch {

	constructor(fields){

		this.fields = fields;
		this.firstTilePlaced=false;
		this.tileHistory = new Array();

		this.columns = this.fields[0].length;
		this.rows = this.fields.length;

		for(var x=0; x<this.columns; ++x){
			for(var y=0; y<this.rows; ++y){
				if(this.fields[y][x]==1) this.fields[y][x]=3;
			}
		}

		this.fieldWidth = 30;
		this.canvasMargin = 1;
		this.canvasWidth = this.columns*this.fieldWidth+2*this.canvasMargin;
		this.canvasHeight = this.rows*this.fieldWidth+2*this.canvasMargin;
	}

	drawField(p, x, y){
		if(this.fields[y][x]==0) return;

		//colors
		var cParticle = p.color(106,92,100);
		var cFeasible = p.color(155,197,61);
		var cInfeasible = p.color(158,43,37);

		if(this.fields[y][x]==3){
			p.fill(cFeasible);
		} else if(this.fields[y][x]==2){
			p.fill(cParticle);
		} else {
			p.fill(cInfeasible);
		}
		p.rect(this.canvasMargin+x*this.fieldWidth, this.canvasMargin+y*this.fieldWidth, this.fieldWidth, this.fieldWidth);
	}

	highestX(y){
		if(y<0) return -1;
		if(y>=this.rows) return -1;
		for(var x = this.columns-1; x>=0; --x){
			if(this.fields[y][x]==2) return x; 
		}
		return -1;
	}
	lowestX(y){
		if(y<0) return this.columns;
		if(y>=this.rows) return this.columns;
		for(var x = 0; x<this.columns; ++x){
			if(this.fields[y][x]==2) return x; 
		}
		return this.columns;
	}
	highestY(x){
		if(x<0 || x>=this.columns) return -1;
		for(var y = this.rows-1; y>=0; --y){
			if(this.fields[y][x]==2) return y;
		}
		return -1;
	}
	lowestY(x){
		if(x<0 || x>=this.columns) return this.rows;
		for(var y = 0; y<this.rows; ++y){
			if(this.fields[y][x]==2) return y;
		}
		return this.rows;
	}

	isReachableFrom(x,y,d){
		if(d=="n"){
			return y<=this.lowestY(x) && y<=this.lowestY(x-1) && y<=this.lowestY(x+1);
		} else if(d=="s"){
			return y>=this.highestY(x) && y>=this.highestY(x-1) && y>=this.highestY(x+1);
		} else if(d=="e"){
			return x>=this.highestX(y) && x>= this.highestX(y-1) && x>=this.highestX(y+1);
		} else if(d=="w"){
			return x<=this.lowestX(y) && x<=this.lowestX(y-1) && x<=this.lowestX(y+1);
		}
	}

	isReachable(x, y){
		return this.isReachableFrom(x,y, "n") || this.isReachableFrom(x,y, "s") || this.isReachableFrom(x, y, "e") || this.isReachableFrom(x, y, "w");	
	}

	isDockable(x, y){
		return (x>0 && this.fields[y][x-1]==2) || (x<this.columns-1 && this.fields[y][x+1]==2) 
			|| (y>0 && this.fields[y-1][x]==2) || (y<this.rows-1 && this.fields[y+1][x]==2)
	}

	evaluateReachability(){
		for(var x=0; x<this.columns; ++x){
			for(var y=0; y<this.rows; ++y){
				if(this.fields[y][x]==1 || this.fields[y][x]==3) {
					if( this.isReachable(x,y) && this.isDockable(x,y)){
						this.fields[y][x]=3;
					} else {
						this.fields[y][x]=1;
					}
				}
			}
		}
	}

	resetPolyomino(p){
		for(var x=0; x<this.columns; ++x){
			for(var y=0; y<this.rows; ++y){
				if(this.fields[y][x]>0) this.fields[y][x]=3;
			}
		}
		this.firstTilePlaced=false;
		this.history = new Array();
		p.loop();
	}

	getField(mX, mY) {
		if(mX<this.canvasMargin || mX>this.canvasWidth-this.canvasMargin || mY<this.canvasMargin || mY>this.canvasHeight-this.canvasMargin) { return [-1,-1];}
		mX -= this.canvasMargin;
		mY -= this.canvasMargin;
		var x = Math.floor(mX/this.fieldWidth);
		var y = Math.floor(mY/this.fieldWidth);
		return [x,y];
	}

	mousePressedInside(p){
		var [x,y] = this.getField(p.mouseX, p.mouseY);
		if(x<0) return;
		if(this.fields[y][x]==3){ 
			this.fields[y][x]=2; 
			this.firstTilePlaced=true;
			this.tileHistory.push([x,y]);
		}
		if(this.firstTilePlaced) this.evaluateReachability();
		p.loop();
	}

	undoTile(p){

		if(this.tileHistory.length>0){
			var latest = this.tileHistory.pop();
			this.fields[latest[1]][latest[0]] = 3;
		}
		if(this.tileHistory.length==0){ this.resetPolyomino(p);} else {
			if(this.firstTilePlaced) this.evaluateReachability();
			p.loop();
		}
	}
}

// 1==polyomino field, 2==tile, 3==reachable, 0==nothing
var fields = [
	[1,1,1,1,1,1,0,0,0,0,0,0,1,1,1,1,1],
	[1,1,1,0,1,1,0,0,1,0,0,0,1,0,1,1,1],
	[1,1,1,0,0,0,0,1,1,1,1,1,0,1,1,1,1],
	[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
	[1,1,1,1,1,1,1,1,1,0,0,0,0,0,1,1,1],
	[1,1,1,1,0,0,0,0,0,0,0,0,0,0,1,1,1]
];

html_parent = 'sketch-holder-tilt-asm';
function createTiltAssemblySketch(html_parent, fields){
	var tiltAssemblySketch = new TiltAssemblySketch(fields);
	var tiltAssemblySketchP5 = new p5(function(p){
		p.setup = function(){ 
			var canvas = p.createCanvas(tiltAssemblySketch.canvasWidth, tiltAssemblySketch.canvasHeight);
			canvas.mousePressed(function(){tiltAssemblySketch.mousePressedInside(p)});
			canvas.parent(html_parent);
			p.frameRate(5);
			p.noLoop();
		};
		p.draw = function(){
			if(!p.focused){p.noLoop(); return;}
			p.background(255);
			p.fill(100);
			for(var x=0; x<tiltAssemblySketch.columns; ++x){
				for(var y=0; y<tiltAssemblySketch.rows; ++y){
					if(tiltAssemblySketch.fields[y][x]>0) tiltAssemblySketch.drawField(p, x, y);
				}
			}
		};
	});
	return [tiltAssemblySketchP5, tiltAssemblySketch];
}

var [tiltAssemblySketchP5, tiltAssemblySketch] = createTiltAssemblySketch(html_parent, fields);


