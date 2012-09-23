console.log('test');

//var load = function (id, n) {
//  var url = "https://raw.github.com/cvdlab-cg/" + id 
//    + "/master/2012-05-04/exercise" + n + ".js";
//
//  var script = document.createElement('script');
//  script.src = url;
//  document.body.appendChild(script);
//
//  return url;
//};

var domA = INTERVALS(1)(16);
var domB = INTERVALS(1)(8);
var dom2d = DOMAIN([
	[0, 1],
	[0, 1]
])([10,10]);

var domeDomain = DOMAIN([[0,1],[0,1]])([12,12]);

var octagonPlan = function (a) {
	return function(l){
		return SIMPLICIAL_COMPLEX([[0,0],[-l,-a],[l,-a],[a,-l],[a,l],[l,a],[-l,a],[-a,l],[-a,-l]])
								  ([[0,1,2],[2,0,3],[3,4,0],[0,5,4],[5,6,0],[0,7,6],[7,0,8],[8,1,0]]);
	};
};

var churchPlan = function(r){
	return function(h){
		var l = r*SIN(PI/8);
		var a = r*COS(PI/8);

		var octP1 = octagonPlan(a)(l);
		octP1 = EXTRUDE([h])(octP1);
		octP1 = BOUNDARY(octP1);
		var chapBasement = SIMPLICIAL_COMPLEX([[-a,-l],[-a,l],[-(a+1.5*l),l],[-(a+1.5*l),-l]])([[0,1,2],[2,3,0]]);
		chapBasement = EXTRUDE([h])(chapBasement);
		chapBasement = BOUNDARY(chapBasement);
		chapBasements = STRUCT(REPLICA(4)([chapBasement,R([0,1])(PI/2)]));
		octP1 = STRUCT([octP1,chapBasements]).scale([2],[-1]);
		octP1 = octP1.color([0.8,0.5,0.2,1]);
		return STRUCT([octP1]);
	};
};

var multiLevelChurchPlan = function(l){
	return function(model){
		return STRUCT(REPLICA(l)([model,T([2])([-0.1]),S([0,1])([1.1,1.1])]));

	};
};

var planSection = function(r){
	var p00 = [-r*SIN(PI/40),-r*COS(PI/8)];
	var p01 = [-r*SIN(PI/8),-r*COS(PI/8)];
		
	var p10 = [-r*SIN(PI/40),-(r+0.1)*COS(PI/8)];
	var p11 = [-(r+0.1)*SIN(PI/8),-(r+0.1)*COS(PI/8)];

	var halfS0 = POLYLINE([p01,p00,p10]);
	var halfS1 = S([0])([-1])(halfS0).rotate([0,1],-PI/4);
	var w1 = POLYLINE([p11,p10]);
	var octCorner = STRUCT([w1,halfS0,halfS1]).rotate([0,1],PI/4).scale([0],[-1]);

	var p20 = [-r*SIN(PI/40),-(r+0.3)*COS(PI/8)];
	var w2 = POLYLINE([p10,p20]);
	var p30 = [0,-(r+0.1)*COS(PI/8)-(2*(r))*SIN(PI/8)];
	var p31 = [-(r+0.1)*SIN(PI/8),-(r+0.1)*COS(PI/8)-(2*(r))*SIN(PI/8)];

	var chap = POLYLINE([p11,p31,p30]);

	var c = CUBIC_HERMITE(S0)([[0,-(r+0.1)*COS(PI/8)-(2*(r-0.1))*SIN(PI/8)],p20,[-2*.6*r,0], [2*.6*r*COS(PI/16),2*.6*r*SIN(PI/16)]]);
	var chapIn = MAP(c)(domA);

	var cr = 0.05*r;
	var cAlfa = MAP(CUBIC_HERMITE(S0)([[cr,0],[0,cr],[0,(PI/2)*cr],[-(PI/2)*cr,0]]))(domB);
	var columnA = STRUCT(REPLICA(4)([cAlfa,R([0,1])(PI/2)])).translate([0,1],[-r*0.8*SIN(PI/8),-r*0.8*COS(PI/8)]);
	return STRUCT([octCorner,w2,chap,chapIn,columnA]);

};

var centralPlan = function(r){
	return function(n){
		var s0 = planSection(r);
		var s1 = S([0])([-1])(s0);
		var s = STRUCT([s0,s1]);
		return STRUCT(REPLICA(n)([s, R([0,1])([PI/2])]));
	};
};

var plan2d = function(r) {
	var basement = multiLevelChurchPlan(3)(churchPlan(r*1.25)(.1));
	var plan = centralPlan(r)(4);
	return STRUCT([basement,plan]);
};


var domeBaseStripe = function(r) {
	return function(n){
		var dx = r*COS(PI/n);
		var raggio = r*SIN(PI/n);
		var c1 = CUBIC_HERMITE(S0)([[-dx,0,0],[-dx*.1,0,r],[0,0,2*r],[1.5*dx,0,0]]);
		var c2 = CUBIC_HERMITE(S0)([[-dx,raggio,0],[-dx*.1,raggio*.1,r],[0,0,2*r],[1.5*dx,-1.5*raggio,0]]);
		var csup1 = BEZIER(S1)([c1,c2]);
		var corner1 = MAP(csup1)(domeDomain);
		var corner2 = S([0])([-1])(corner1).rotate([0,1],[-PI-PI/4]);
		return STRUCT([corner1,corner2]).rotate([0,1],PI/2);
	};
};

var domeBase = function(r){
	return function(n){
		return function(l){
			var strip = domeBaseStripe(r)(n);
			var d = STRUCT(REPLICA(l)([strip, R([0,1])([-PI/4])]));
			return d;
		};
	};
};

var domeTrave = function(r){
	return function(n){
		var dy = r*COS(PI/(n));
		var dx = r*SIN(PI/(n))*.25;
		var c1 = CUBIC_HERMITE(S0)([[-1.05*dx,-1.035*dy,0],[-dx*1.05*.1,-1.035*dy*.1,r],[0,0,2*r],[1.5*dx,1.5*dy,0]]);
		var c2 = CUBIC_HERMITE(S0)([[1.05*dx,-1.035*dy,0],[dx*1.05*.1,-1.035*dy*.1,r],[0,0,2*r],[-1.5*dx,1.5*dy,0]]);
		var c3 = CUBIC_HERMITE(S0)([[0,-1.01*r,0],[0,-1.035*dy*.1,1.01*r],[0,0,2*r],[0,1.5*r,0]]);
		var s1 = BEZIER(S1)([c1,c3]);
		var s2 = BEZIER(S1)([c2,c3]);
		var s3 = BEZIER(S1)([c1,c2]);

		var sup1 = MAP(s1)(domeDomain);
		var sup2 = MAP(s2)(domeDomain);
		var sup3 = MAP(s3)(domeDomain);
		return STRUCT([sup1,sup2,sup3]).rotate([0,1],-PI/4);

	};
};

var drawDome = function(r,n,l){
	var db = domeBase(r)(n)(l);
	var dt1 = domeTrave(r)(n);
	var dc1= campanile(r).translate([2], [r]);
	var dc = STRUCT(REPLICA(l)([dc1,R([0,1])(-PI/4)]));
	dt1 = dt1.rotate([0,1],PI/8);
	dt1 = dt1.color([0.8,0.5,0.2,1]);
	var dt = STRUCT(REPLICA(l)([dt1,R([0,1])(-PI/4)]));
	return STRUCT([db,dt,dc]);
};

var doorA = function(r){

	var l = r*SIN(PI/8);
	var a = r*COS(PI/8);

	var seg00 = SIMPLEX_GRID([[l/6],[.1],[-l/6,5*l/3,-l/6]]);
	var seg01 = SIMPLEX_GRID([[-l/2,l/6,-l/3],[.1],[-l/6,2*l/3,-l/6]]);
	var seg10 = SIMPLEX_GRID([[4*l/6],[.1],[l/6]]);
	var seg11 = SIMPLEX_GRID([[-l/2,l/2],[.1],[-5*l/6,l/6]]);
	var seg12 = SIMPLEX_GRID([[l],[.1],[-5*l/3,l/6]]);

	var lA = 1.5*l;

	var wA = SIMPLEX_GRID([[-l/6,l/3],[-0.04,0.02],[-l/6,5/6*l]]);
	var wB0 = SIMPLICIAL_COMPLEX([
							[(l - (lA/2)*COS(PI/6)),l+0.01],
							[(l - (lA/2)*COS(PI/6)),11/6*l],
							[l,11/6*l],
							[l,l+0.01+((lA/2)*SIN(PI/6))]

						])([
							[0,1,2],
							[2,0,3]
						]);

	var wB1 = SIMPLEX_GRID([[-l/6,5/6*l],[-0.04,0.02,-0.04],[-l,0.01]]);
	var wC = SIMPLEX_GRID([[-l/6,(l - (l/2)*COS(PI/6))],[-0.04,0.02,-0.04],[-l,5/6*l]]);

	wA.color([0.999999,0.999999,0.999999,1]);
	wB0.color([0.999999,0.999999,0.999999,1]);
	wB1.color([0.999999,0.999999,0.999999,1]);
	wC.color([0.999999,0.999999,0.999999,1]);

	var tA = SIMPLICIAL_COMPLEX([
									[(lA/2)*COS(PI/6),0],
									[0,0],
									[(lA/2)*COS(PI/6),(lA/2)*SIN(PI/6)],
									[(lA/2)*COS(PI/6),(lA/2)*SIN(PI/9)],
									[(lA/3.5)*COS(PI/6),(lA/2)*SIN(PI/24)],
									[(lA/2)*COS(PI/6),(lA/2)*SIN(PI/24)]
								])([
									[0,1,5],
									[5,1,4],
									[4,1,2],
									[2,4,3]
								]);
	tA = tA.extrude([.1]);
	tA = BOUNDARY(tA);
	tA = tA.rotate([1,2],PI/2);
	tA = tA.translate([0,2],[(l - (lA/2)*COS(PI/6)),l+0.01]);
	
	var tC = SIMPLICIAL_COMPLEX([
									[(lA/2)*COS(PI/6),(lA/2)*SIN(PI/9)],
									[(lA/3.5)*COS(PI/6),(lA/2)*SIN(PI/24)],
									[(lA/2)*COS(PI/6),(lA/2)*SIN(PI/24)]
							])([
								[0,1,2]
							]);

	tC = COLOR([1,1,1,0.7])(tC);
	tC = tC.translate([0,1],[(l - (lA/2)*COS(PI/6)),l+0.01]);
	tC = STRUCT([tC,wB0]);
	tC = tC.extrude([.02]);
	tC = tC.rotate([1,2],PI/2);
	tC = tC.translate([1],[-0.04]);

	var tB = STRUCT([seg00,seg01,seg10,seg11,seg12,wA,wB1,wC]).scale([1],[-1]);
	return STRUCT([tA,tB,tC]);
};

var doorB = function(r){

	var l = r*SIN(PI/8);
	var a = r*COS(PI/8);

	// var c01 = CUBIC_HERMITE(S0)([[-l/4*3.18,0],[-l,5/6*l],[0,PI/2*l],[-PI/6*l,0]]);
	// var c02 = CUBIC_HERMITE(S0)();
	var c01 = CUBIC_HERMITE(S0)([[-l/4*3,0],[-l/4*3,5/6*l],[0,0],[0,0]]);
	var c02 = CUBIC_HERMITE(S0)([[-l/4*3,5/6*l],[-l,13/12*l],[0,PI/2*l/4],[-PI/2*l/4,0]]);

	var c1 = CUBIC_HERMITE(S0)([[0,0],[0,11/6*l],[0,0],[0,0]]);
	var c2 = CUBIC_HERMITE(S0)([[0,11/6*l],[-l,11/6*l],[0,0],[0,0]]);
	var s1 = BEZIER(S1)([c01,c1]);
	var s2 = BEZIER(S1)([c02,c2]);

	var s = STRUCT([MAP(s1)(dom2d),MAP(s2)(dom2d)]);

	s = EXTRUDE([.1*r])(s).rotate([1,2],PI/2);
	s.material = new plasm.materials.LineMaterial();
	s.color([0.999999,0.999999,0.999999,1]);
	return s;

};

var cornerSection3d = function(r){
	var l = r*SIN(PI/8);
	var a = r*COS(PI/8);

	var dA = doorA(r);
	var axisA = cornerAxis(PI/8);
	axisA = axisA.extrude([11/6*l]);
	dA = STRUCT([dA,axisA]);

	var dB = doorB(r);
	var axisB = SIMPLICIAL_COMPLEX([
									[0,0],
									[0,-.1],
									[.1/COS(PI/8)*SIN(PI/8),-.1]
								])([
									[0,1,2]
								]);
	axisB = axisB.extrude([11/6*l]);

	dB = STRUCT([dB, axisB]);
	dB = dB.rotate([0,1],-PI/4);

	var intermediateSection = BOUNDARY(octagonalRingSection(r,PI/8).extrude([.05]).translate([2],[11/6*l]));

	var halfChapelLV1 = chapWall(r,PI/4).translate([0,1],[-l+.05,-2*a+.1]);
	var halfChapelLV2 = chapWalls(r*.3)(4)(PI/8).scale([2],[1.5]).rotate([0,1],-3/4*PI).translate([1,2],[-a-r*.525,11/6*l+.05]);
	var halfChapelLV2Ring = STRUCT(REPLICA(4)([octagonalRingCorner(r*.3)(0.5).extrude([.05]), R([0,1])([-PI/4])])).translate([1,2],[-a-r*.525,11/6*l+.05+1.5*11/6*(r*.3)*SIN(PI/8)]);
	var halfChapelLV2Dome = drawDome(r*.35,8,4).translate([1,2],[-a-r*.525,11/6*l+.05+1.5*11/6*(r*.3)*SIN(PI/8)+.05]);

	var halfChapel = STRUCT([halfChapelLV1,halfChapelLV2,halfChapelLV2Ring,halfChapelLV2Dome]);

	var centralChapelWalls = chapWalls(r)(1)(PI/8).translate([2],[11/6*l]);
	var centralChapelRing = octagonalRingCorner(r)(0.2).extrude([.1]).translate([2],[11/3*l]);
	var centralChapelDome = drawDome(r*1.1,8,1).translate([2],[11/3*l+.1]);
	//var centralChapelCamp = campanile(r).translate([2], [11/3*l+.1+r*1.1]);

	var centralChapel = STRUCT([centralChapelWalls, centralChapelRing, centralChapelDome]);
	
	var corner = STRUCT([dA,dB]);
	corner = corner.translate([0,1],[-l,-a]).scale([0],[-1]).rotate([0,1],-PI/4);
	corner.material = new plasm.materials.LineMaterial();

	var column = BOUNDARY(DISK([0.05*r])().extrude([11/6*l]).translate([0,1],[-r*0.8*SIN(PI/8),-r*0.8*COS(PI/8)]));

	return STRUCT([corner,column,intermediateSection,halfChapel,centralChapel]);

};

var centralPlan3d = function(r){
	return function(n){
		var s0 = cornerSection3d(r).rotate([0,1],PI/4);
		var s1 = S([0])([-1])(s0);
		var s = STRUCT([s0,s1]);
		return STRUCT(REPLICA(n)([s, R([0,1])([PI/2])]));
	};
};

var cornerAxis = function(ang){
		return SIMPLICIAL_COMPLEX([
									[0,0],
									[0,-.1],
									[-.1/COS(ang)*SIN(ang),-.1]
								])([
									[0,1,2]
								]);
};

var halfChapWall = function(r,a){
	var l = r*SIN(PI/8);
	
	var seg00 = SIMPLEX_GRID([[l/6],[.1],[-l/6,5*l/3,-l/6]]);
	var seg01 = SIMPLEX_GRID([[-l/2,l/6],[.1],[-2/3*l,2*l/3,-2/3*l]]);
	var seg10 = SIMPLEX_GRID([[l],[.1],[l/6,-9*l/6,l/6]]);
	var seg11 = SIMPLEX_GRID([[-l/2,l/2],[.1],[-l/2,l/6,-2*l/3,l/6,-l/2]]);
	var seg12 = SIMPLEX_GRID([[-l/6,5/6*l],[-.04,.02,-.04],[-l/6,5*l/3,-l/6]]).color([0.999999,0.999999,0.999999,1]);;

	var wall = STRUCT([seg00,seg01,seg10,seg11,seg12]);

	wall = wall.translate([1],[-.1]);
	
	return wall;
};

var chapWall = function(r,a){
	var w0 = STRUCT([halfChapWall(r,a),cornerAxis(a).extrude([11/6*r*SIN(PI/8)])]);
	var w1 = S([0])([-1])(w0).rotate([0,1],-a*2);
	var w2 = halfChapWall(r,a).scale([0],[-1]).rotate([0,1],PI/2).translate([0,1],[-.1,2*r*SIN(PI/8)]);
	return STRUCT([w0,w1,w2]);
}

var chapWalls = function(r){
	return function(n){
		return function(a){
			var w0 = STRUCT([halfChapWall(r,a),cornerAxis(a).extrude([11/6*r*SIN(PI/8)])]);
			var w1 = S([0])([-1])(w0).rotate([0,1],-a*2);

			var w = STRUCT([w0,w1]).translate([0,1],[-r*SIN(a),-r*COS(a)]);

			return STRUCT(REPLICA(n)([w, R([0,1])(a*2)]));

		};
	};
};

var octagonalRingSection = function(r,a){
	var l = r*SIN(PI/8);
	var a = r*COS(PI/8);

	var pc00 = [l,l/3];
	var pc01 = [l/3,5/6*l];

	var cp00 = 0;

	var c00 = CUBIC_HERMITE(S0)([pc00,pc01,[-4/6*l*PI/2,0],[0,PI/2*4/6*l]]);
	var c01 = BEZIER(S0)([[l,cp00-l/6],[cp00,cp00-l/6]]);
	var c02 = BEZIER(S0)([[cp00,cp00-l/6],[cp00,l]]);

	var s01 = MAP(BEZIER(S1)([c01,c00]))(dom2d);
	var s02 = MAP(BEZIER(S1)([c02,c00]))(dom2d);
	var s0 = STRUCT([s01,s02]);

	var section0 = STRUCT([s0,T([1])([5/3*l])(S([1])([-1])(s0))]);

	var dy = ((.2)*SIN(PI/8));

	var section1a = SIMPLICIAL_COMPLEX([[l,cp00],[cp00,cp00],[l,cp00-dy],[cp00-dy,cp00-dy]])([[0,1,2],[2,1,3]]);
	var section1b = S([0])([-1])(section1a).rotate([0,1],-PI/2);
	var section1c = SIMPLICIAL_COMPLEX([[cp00,l],[cp00,11/6*l],[cp00-dy,l],[cp00-dy,11/6*l]])([[0,1,2],[2,1,3]]);
	var section1d = SIMPLICIAL_COMPLEX([[cp00-dy,cp00-dy],[l,cp00-dy],[l,cp00-2*dy],[cp00-dy,cp00-2*dy]])([[0,1,2],[2,0,3]]);

	var section = STRUCT([section1a,section1b,section1c,section0,section1d]);

	section = section.translate([0,1],[-l,-a-(11/6*l)-((.15)*COS(PI/8))]);

	var p00 = [0,0];
	var p01 = [-l*.7,0];
	var p10 = [0, -(.5)*COS(PI/8)];
	var p11 = [-(r*1.2)*SIN(PI/8),-(r*.5)*COS(PI/8)];

	var octCorner0 = SIMPLICIAL_COMPLEX([p00,p01,p10,p11])([[0,1,2],[2,1,3]]).translate([1],[-a*.7]);
	var octCorner1 = STRUCT([R([0,1])(-PI/4)(S([0])([-1])(octCorner0))]);

	var interLevel = STRUCT([octCorner0,octCorner1,section]);
	return interLevel;
};

var intermediateLevelRing = function(r){
	return function(n){
		var ors0 = octagonalRingSection(r);
		var ors1 = S([0])([-1])(ors0);
		var ors = STRUCT([ors0,ors1]);
		return STRUCT(REPLICA(n)([ors,R([0,1])(PI/2)]));
	};
};

var octagonalRingCorner = function(r){
	return function(delta){
		var l = r*SIN(PI/8);
		var a = r*COS(PI/8);
		var p00 = [0,0];
		var p01 = [-l,0];
		var p10 = [0, -delta*a];
		var p11 = [-(1+delta)*l, -delta*a];

		var octCorner0 = SIMPLICIAL_COMPLEX([p00,p01,p10,p11])([[0,1,2],[2,1,3]]).translate([1],[-a]);
		var octCorner1 = STRUCT([S([0])([-1])(R([0,1])(PI/4)(octCorner0))]);

		return STRUCT([octCorner0,octCorner1]);
	};
};


/* Roof lantern */
var campanile = function(r){
	var d0 = doorB(r);
	var d1 = S([0])([-1])(d0).rotate([0,1],PI/4);

	var d = STRUCT([d0,d1]).rotate([0,1],-PI/4);

	var ax01 = cornerAxis(PI/8).extrude([r*SIN(PI/8)*11/6]);
	var ax02 = S([0])([-1])(ax01).rotate([0,1],-PI/4);

	var dax = STRUCT([d,ax01,ax02]);
	dax = dax.scale([0,1,2],[0.1,0.1,0.25]);
	dax = dax.translate([0,1],[-.1*r*SIN(PI/8),-.1*r*COS(PI/8)]);

	var ring = octagonalRingCorner(.098*r)(0.15).extrude([.005*r]).translate([2],[0.25*11/6*r*SIN(PI/8)]);

	var ap0 = SIMPLICIAL_COMPLEX([[0,0,.25*r+0.25*11/6*r*SIN(PI/8)+.005*r],[0,-.105*r*COS(PI/8),0.25*11/6*r*SIN(PI/8)+.005*r],[-.105*r*SIN(PI/8),-.105*r*COS(PI/8),0.25*11/6*r*SIN(PI/8)+.005*r]])([[0,1,2]]);
	var ap1 = S([0])([-1])(ap0).rotate([0,1],-PI/4);

	var ap = STRUCT([ap0,ap1]);

	var camp = STRUCT([dax,ring,ap]);

	return camp;
};

var drawAll = function(){
	var a = centralPlan3d(2.5)(4);
	var b = plan2d(2.5);
	DRAW(a);
	DRAW(b);
};

var draw3dSection = function(){

	var c = cornerSection3d(1);

	DRAW(c);
};

var buildChurch = function(n){
	var a = multiLevelChurchPlan(3)(churchPlan(1.25)(.1));
	var b = centralPlan(1)(4);
	var c01 = cornerSection3d(1);
	var c02 = S([0])([-1])(c01).rotate([0,1],-PI/2);
	var c = STRUCT([c01,c02]);

	c = STRUCT(REPLICA(n)([c,R([0,1])(PI/2)]));
	DRAW(a);
	DRAW(b);
	DRAW(c);

};
