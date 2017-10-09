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

class TiltFillSketch {
	constructor(fields) {
		this.fields = fields;
		this.columns = fields[0].length;
		this.rows = fields.length;


		this.fieldWidth = 30;
		this.canvasMargin = 40;
		this.canvasWidth = this.columns*this.fieldWidth+2*this.canvasMargin;
		this.canvasHeight = this.rows*this.fieldWidth+2*this.canvasMargin;
	}

	drawField(p, x, y){
		var cPolyomino = p.color(180, 167, 166);
		var cParticle = p.color(42,44,74);
		if(this.fields[y][x]>0){
			if(this.fields[y][x]==2){
				p.fill(p.color(cParticle));
			} else {
				p.fill(cPolyomino);
			}
		} 
		p.rect(this.canvasMargin+x*this.fieldWidth, this.canvasMargin+y*this.fieldWidth, this.fieldWidth, this.fieldWidth);
		if(this.fields[y][x]>1){
			p.fill(p.color(cParticle))
			p.ellipse(this.canvasMargin+(x+0.5)*this.fieldWidth,
				this.canvasMargin+(y+0.5)*this.fieldWidth,
				0.9*this.fieldWidth,
				0.9*this.fieldWidth);
		}
	}

	moveParticles(direction){
		var changed = false;
		if(direction=="n"){
			for(var x=0; x<this.columns; ++x){
				for(var y=1; y<this.rows; ++y){
					if(this.fields[y][x]>1 && this.fields[y-1][x]==1){
						this.fields[y-1][x]=3;
						changed=true;
						if(this.fields[y][x]==3) this.fields[y][x]=1;
					}
				}
			}
		} else if(direction=="s"){
			for(var x=0; x<this.columns; ++x){
				for(var y=this.rows-2; y>=0; --y){
					if(this.fields[y][x]>1 && this.fields[y+1][x]==1){
						this.fields[y+1][x]=3;
						changed=true;
						if(this.fields[y][x]==3) this.fields[y][x]=1;
					}
				}
			}
		} else if(direction=="e"){
			for(var x=this.columns-1; x>=0; --x){
				for(var y=0; y<this.rows; ++y){
					if(this.fields[y][x]>1 && this.fields[y][x+1]==1){
						this.fields[y][x+1]=3;
						changed=true;
						if(this.fields[y][x]==3) this.fields[y][x]=1;
					}
				}
			}
		} else if(direction=="w"){
			for(var x=1; x<this.columns; ++x){
				for(var y=0; y<this.rows; ++y){
					if(this.fields[y][x]>1 && this.fields[y][x-1]==1){
						this.fields[y][x-1]=3;
						changed=true;
						if(this.fields[y][x]==3) this.fields[y][x]=1;
					}
				}
			}
		}
		return changed;
	}

	drawArrow(p, direction, f){
		p.fill(f);
		var triangleWidth = 40;
		var triangleHeight = 20;
		if(direction=="n"){
			p.triangle(
				this.canvasWidth/2-triangleWidth/2, 	triangleHeight,
				this.canvasWidth/2,			 		0,
				this.canvasWidth/2+triangleWidth/2, 	triangleHeight);
		} else if (direction=="s"){
			p.triangle(
				this.canvasWidth/2-triangleWidth/2, 	this.canvasHeight-triangleHeight,
				this.canvasWidth/2,			 		this.canvasHeight,
				this.canvasWidth/2+triangleWidth/2, 	this.canvasHeight-triangleHeight);
		} else if (direction=="w"){
			p.triangle(
				triangleHeight,	this.canvasHeight/2+triangleWidth/2,
				0,				this.canvasHeight/2,
				triangleHeight,	this.canvasHeight/2-triangleWidth/2);
		} else if(direction=="e"){
			p.triangle(
				this.canvasWidth-triangleHeight,	this.canvasHeight/2+triangleWidth/2,
				this.canvasWidth,				this.canvasHeight/2,
				this.canvasWidth-triangleHeight,	this.canvasHeight/2-triangleWidth/2);
		}
	}

	getMouseDirection(p){
		if(p.mouseX<0 || p.mouseX>this.canvasWidth || p.mouseY<0 || p.mouseY>this.canvasHeight) {p.noLoop(); return;}

		if(p.mouseX<0.2*this.canvasWidth) return "w";
		if(p.mouseX>0.8*this.canvasWidth) return "e";
		if(p.mouseY<0.2*this.canvasHeight) return "n";
		if(p.mouseY>0.8*this.canvasHeight) return "s";
	}

	reset(p){
		for(var x=0; x<this.columns; ++x){
			for(var y=0; y<this.rows; ++y){
				if(this.fields[y][x]==3) this.fields[y][x]=1;
			}
		}
		p.loop();
	}



}

function createTiltFillSketch(html_parent, fields){
	var tiltFillSketch = new TiltFillSketch(fields);
	var tiltFillSketchP5 = new p5(function(p){
		p.mousePressed = function (){
			var d= tiltFillSketch.getMouseDirection(p);
			while(tiltFillSketch.moveParticles(d));
			p.loop();
		}

		p.setup = function () {
			var canvas = p.createCanvas(tiltFillSketch.canvasWidth, tiltFillSketch.canvasHeight);
			canvas.parent(html_parent);
			p.frameRate(5);
		}

		p.draw = function() {
			if(!p.focused){
				p.noLoop();
				return;
			}
			p.background(255);
			p.fill(100);
			for(var x=0; x<tiltFillSketch.columns; ++x){
				for(var y=0; y<tiltFillSketch.rows; ++y){
					if(fields[y][x]>0) tiltFillSketch.drawField(p, x, y);
				}
			}
			tiltFillSketch.drawArrow(p, "n", p.color(255,255,255));
			tiltFillSketch.drawArrow(p, "e", p.color(255,255,255));
			tiltFillSketch.drawArrow(p, "s", p.color(255,255,255));
			tiltFillSketch.drawArrow(p, "w", p.color(255,255,255));
			mDir = tiltFillSketch.getMouseDirection(p);
			tiltFillSketch.drawArrow(p, mDir, p.color(0,0,0));
		}

	});
	return [tiltFillSketchP5, tiltFillSketch];
}


var html_parent_2 = 'sketch-holder-tilt-fill';

// 1==polyomino field, 2==entry field, 0==nothing, 3==particle
var fields_2 = [
	[1,1,1,0,0,0,0,0,0,0,0,0,0,0,1,1,1],
	[1,1,1,0,0,0,0,0,2,0,0,0,0,0,1,1,1],
	[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
	[0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
	[0,1,1,0,0,0,0,0,1,0,0,0,0,0,1,1,1],
	[1,1,1,1,0,0,0,0,0,0,0,0,0,0,1,1,1]
];

var [tiltFillSketchP5, tiltFillSketch] = createTiltFillSketch(html_parent_2, fields_2);








