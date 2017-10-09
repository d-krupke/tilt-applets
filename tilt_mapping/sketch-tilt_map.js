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

class TiltMapSketch {
	constructor(fields) {
		this.fields = fields;
		this.columns = fields[0].length;
		this.rows = fields.length;

		this.fields_clone = new Array();
		for(var y=0; y<this.rows; ++y){
			this.fields_clone.push(new Array());
			for(var x=0; x<this.columns; ++x){
				this.fields_clone[y].push(this.fields[y][x]);
			}
		}

		this.fieldWidth = 30;
		this.canvasMargin = 40;
		this.canvasWidth = this.columns*this.fieldWidth+2*this.canvasMargin;
		this.canvasHeight = this.rows*this.fieldWidth+2*this.canvasMargin;
	}

	drawField(p, x, y){
		var cUnknown = p.color(180, 167, 166);
		var cPolyomino = p.color(243, 233, 199);
		var cExterior = p.color(66,74,89);
		var cParticle = p.color(227, 86, 70);
		// 1==undiscovered polyomino field, 2==particle, 0==undiscovered exterior, 3==discovered polygomino field, 4==discovered exterior.
		if(this.fields[y][x]==0 || this.fields[y][x]==1) {
			p.fill(cUnknown);
		} else if(this.fields[y][x]==3 || this.fields[y][x]==2){
			p.fill(cPolyomino);
		} else {
			p.fill(cExterior);
		}

		p.rect(this.canvasMargin+x*this.fieldWidth, this.canvasMargin+y*this.fieldWidth, this.fieldWidth, this.fieldWidth);
		if(this.fields[y][x]==2){
			p.fill(cParticle);
			p.ellipse(this.canvasMargin+(x+0.5)*this.fieldWidth,
				this.canvasMargin+(y+0.5)*this.fieldWidth,
				0.9*this.fieldWidth,
				0.9*this.fieldWidth);
		}
	}

	moveParticle(x1, y1, x2, y2){
		if(this.fields[y1][x1]==2){
			if(this.fields[y2][x2]==1 || this.fields[y2][x2]==3){ 
				this.fields[y2][x2]=2; 
				this.fields[y1][x1]=3;
				return true;
			} else if(this.fields[y2][x2]==0){
				this.fields[y2][x2]=4;
				return true;
			}
		}
		return false;
	}

	moveParticles(direction){
		// 1==undiscovered polyomino field, 2==particle, 0==nothing, 3==discovered polygomino field, 4==discovered exterior.
		var changed = false;
		if(direction=="n"){
			for(var x=0; x<this.columns; ++x){
				for(var y=1; y<this.rows; ++y){
					changed = this.moveParticle(x, y, x, y-1) || changed;
				}
			}
		} else if(direction=="s"){
			for(var x=0; x<this.columns; ++x){
				for(var y=this.rows-2; y>=0; --y){
					changed = this.moveParticle(x, y, x, y+1) || changed;
				}
			}
		} else if(direction=="e"){
			for(var x=this.columns-1; x>=0; --x){
				for(var y=0; y<this.rows; ++y){
					changed = this.moveParticle(x, y, x+1, y) || changed;
				}
			}
		} else if(direction=="w"){
			for(var x=1; x<this.columns; ++x){
				for(var y=0; y<this.rows; ++y){
					changed = this.moveParticle(x, y, x-1, y) || changed;
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
		
		for(var y=0; y<this.rows; ++y){
			for(var x=0; x<this.columns; ++x){
				this.fields[y][x]=this.fields_clone[y][x];
			}
		}
		p.loop();
	}



}

function createTiltMapSketch(html_parent, fields){
	var tiltMapSketch = new TiltMapSketch(fields);
	var tiltMapSketchP5 = new p5(function(p){


		p.setup = function () {
			var canvas = p.createCanvas(tiltMapSketch.canvasWidth, tiltMapSketch.canvasHeight);
			canvas.mousePressed(function (){
				var d= tiltMapSketch.getMouseDirection(p);
				tiltMapSketch.moveParticles(d);
				p.loop();
			});
			canvas.parent(html_parent);
			p.frameRate(5);
			p.noLoop();
		}

		p.draw = function() {
			if(!p.focused) return;
			p.background(255);
			p.fill(100);
			for(var x=0; x<tiltMapSketch.columns; ++x){
				for(var y=0; y<tiltMapSketch.rows; ++y){
					tiltMapSketch.drawField(p, x, y);
				}
			}
			tiltMapSketch.drawArrow(p, "n", p.color(255,255,255));
			tiltMapSketch.drawArrow(p, "e", p.color(255,255,255));
			tiltMapSketch.drawArrow(p, "s", p.color(255,255,255));
			tiltMapSketch.drawArrow(p, "w", p.color(255,255,255));
			mDir = tiltMapSketch.getMouseDirection(p);
			tiltMapSketch.drawArrow(p, mDir, p.color(0,0,0));
		}

	});
	return [tiltMapSketchP5, tiltMapSketch];
}


var html_parent_3 = 'sketch-holder-tilt-map';

// 1==undiscovered polyomino field, 2==particle, 0==nothing, 3==discovered polygomino field, 4==discovered exterior.
var fields_3 = [
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,1,1,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,1,1,0],
	[0,1,1,0,0,0,1,1,0,0,0,0,0,2,1,0,0,0,0,1,1,0],
	[0,1,1,1,1,1,1,1,1,2,1,1,1,1,1,1,1,1,1,1,1,0],
	[0,1,1,1,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
	[0,1,1,0,0,0,1,1,0,0,0,1,1,1,0,0,0,1,0,1,1,0],
	[0,1,1,1,0,0,1,1,1,0,0,1,0,0,0,0,1,1,0,2,1,0],
	[0,0,0,2,1,0,1,0,0,0,0,1,0,0,1,0,0,1,0,0,0,0],
	[0,0,1,1,1,1,1,0,0,0,0,0,0,0,1,1,1,1,1,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
];

var [tiltMapSketchP5, tiltMapSketch] = createTiltMapSketch(html_parent_3, fields_3);








