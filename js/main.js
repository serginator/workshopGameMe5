function BufferLoader(e,o,n){this.context=e,this.urlList=o,this.onload=n,this.bufferList=[],this.loadCount=0,this.loadBuffer=function(e,o){var n=new XMLHttpRequest;n.open("GET",e,!0),n.responseType="arraybuffer";var t=this;n.onload=function(){t.context.decodeAudioData(n.response,function(n){return n?(t.bufferList[o]=n,++t.loadCount===t.urlList.length&&t.onload(t.bufferList),void 0):(alert("error decoding file data: "+e),void 0)},function(e){console.error("decodeAudioData error",e)})},n.onerror=function(){alert("BufferLoader: XHR error")},n.send()},this.load=function(){for(var e=0;e<this.urlList.length;++e)this.loadBuffer(this.urlList[e],e)}}var requirejs,require,define;!function(e){function o(e,o){return w.call(e,o)}function n(e,o){var n,t,i,r,s,a,u,c,p,d,f=o&&o.split("/"),g=l.map,h=g&&g["*"]||{};if(e&&"."===e.charAt(0))if(o){for(f=f.slice(0,f.length-1),e=f.concat(e.split("/")),c=0;c<e.length;c+=1)if(d=e[c],"."===d)e.splice(c,1),c-=1;else if(".."===d){if(1===c&&(".."===e[2]||".."===e[0]))break;c>0&&(e.splice(c-1,2),c-=2)}e=e.join("/")}else 0===e.indexOf("./")&&(e=e.substring(2));if((f||h)&&g){for(n=e.split("/"),c=n.length;c>0;c-=1){if(t=n.slice(0,c).join("/"),f)for(p=f.length;p>0;p-=1)if(i=g[f.slice(0,p).join("/")],i&&(i=i[t])){r=i,s=c;break}if(r)break;!a&&h&&h[t]&&(a=h[t],u=c)}!r&&a&&(r=a,s=u),r&&(n.splice(0,s,r),e=n.join("/"))}return e}function t(o,n){return function(){return p.apply(e,v.call(arguments,0).concat([o,n]))}}function i(e){return function(o){return n(o,e)}}function r(e){return function(o){g[e]=o}}function s(n){if(o(h,n)){var t=h[n];delete h[n],m[n]=!0,c.apply(e,t)}if(!o(g,n)&&!o(m,n))throw new Error("No "+n);return g[n]}function a(e){var o,n=e?e.indexOf("!"):-1;return n>-1&&(o=e.substring(0,n),e=e.substring(n+1,e.length)),[o,e]}function u(e){return function(){return l&&l.config&&l.config[e]||{}}}var c,p,d,f,g={},h={},l={},m={},w=Object.prototype.hasOwnProperty,v=[].slice;d=function(e,o){var t,r=a(e),u=r[0];return e=r[1],u&&(u=n(u,o),t=s(u)),u?e=t&&t.normalize?t.normalize(e,i(o)):n(e,o):(e=n(e,o),r=a(e),u=r[0],e=r[1],u&&(t=s(u))),{f:u?u+"!"+e:e,n:e,pr:u,p:t}},f={require:function(e){return t(e)},exports:function(e){var o=g[e];return"undefined"!=typeof o?o:g[e]={}},module:function(e){return{id:e,uri:"",exports:g[e],config:u(e)}}},c=function(n,i,a,u){var c,p,l,w,v,b,x=[];if(u=u||n,"function"==typeof a){for(i=!i.length&&a.length?["require","exports","module"]:i,v=0;v<i.length;v+=1)if(w=d(i[v],u),p=w.f,"require"===p)x[v]=f.require(n);else if("exports"===p)x[v]=f.exports(n),b=!0;else if("module"===p)c=x[v]=f.module(n);else if(o(g,p)||o(h,p)||o(m,p))x[v]=s(p);else{if(!w.p)throw new Error(n+" missing "+p);w.p.load(w.n,t(u,!0),r(p),{}),x[v]=g[p]}l=a.apply(g[n],x),n&&(c&&c.exports!==e&&c.exports!==g[n]?g[n]=c.exports:l===e&&b||(g[n]=l))}else n&&(g[n]=a)},requirejs=require=p=function(o,n,t,i,r){return"string"==typeof o?f[o]?f[o](n):s(d(o,n).f):(o.splice||(l=o,n.splice?(o=n,n=t,t=null):o=e),n=n||function(){},"function"==typeof t&&(t=i,i=r),i?c(e,o,n,t):setTimeout(function(){c(e,o,n,t)},4),p)},p.config=function(e){return l=e,l.deps&&p(l.deps,l.callback),p},define=function(e,n,t){n.splice||(t=n,n=[]),o(g,e)||o(h,e)||(h[e]=[e,n,t])},define.amd={jQuery:!0}}(),define("almond.js",function(){}),window.requestAnimFrame=function(){return window.requestAnimationFrame||window.webkitRequestAnimationFrame||window.mozRequestAnimationFrame||window.oRequestAnimationFrame||window.msRequestAnimationFrame||function(e){window.setTimeout(e,1e3/60)}}();var arrayRemove=function(e,o){var n=e.slice(o+1||e.length);return e.length=0>o?e.length+o:o,e.push.apply(e,n)},game=function(){function e(){for(var e=0,n=bo.length,t=0;n>t;t++){var i=new Image;i.src=bo[t],i.onload=function(){e++,e===n&&o()},xo.push(i)}}function o(){for(var e=0,o=Mo.concat(ko),n=o.length,t=0;n>t;t++){var i=new Audio;i.addEventListener("canplaythrough",function(){e++,e===n&&r(!0)},!1),i.src=o[t]}}function n(){Y(),y()}function t(e,o){for(var n in o)e[n]=o[n];return e}function i(){S.width=.85*window.innerWidth,S.height=.85*window.innerHeight,P.width=S.width,P.height=S.height,n()}function r(o){if(o){so=15*(S.height/40),to=xo[Xo.fire],no=new E(C),window.AudioContext=window.AudioContext||window.webkitAudioContext,ao=new window.AudioContext,uo=new window.BufferLoader(ao,Mo.concat(ko),s),uo.load(),R=new Image,R.src="images/background-1.jpg",R.posX=0,D=new Image,D.src="images/background-2.jpg",D.posX=R.width,z=new Image,z.src="images/background-3.jpg",z.posX=2*R.width,O=new Image,O.src="images/background-4.jpg",O.posX=3*R.width,W=new Image,W.src="images/background-4-mirror.jpg",W.posX=4*R.width,H=new Image,H.src="images/background-3-mirror.jpg",H.posX=5*R.width,U=new Image,U.src="images/background-2-mirror.jpg",U.posX=6*R.width,G=new Image,G.src="images/background-1-mirror.jpg",G.posX=0,V=new Image,V.src="images/foreground-1.png",V.posX=0,N=new Image,N.src="images/foreground-2.png",N.posX=V.width,Q=new Image,Q.src="images/foreground-3.png",Q.posX=2*V.width,Z=new Image,Z.src="images/foreground-4.png",Z.posX=3*V.width,J=new Image,J.src="images/starfield-2.png",J.posX=0,K=new Image,K.src="images/starfield-2.png",K.posX=J.width,$=new Image,$.src="images/starfield-2.png",$.posX=2*J.width,_=new Image,_.src="images/starfield-2.png",_.posX=3*J.width,eo=new Image,eo.src="images/starfield-2.png",eo.posX=4*J.width,oo=new Image,oo.src="images/starfield-2.png",oo.posX=5*J.width,po=0,io=new d,I(document,"keydown",M),I(document,"keyup",k),document.addEventListener("touchstart",function(e){io.moveTo(e.touches[0]),jo=!0,io.firing=!0,e.preventDefault()}),document.addEventListener("touchmove",function(e){io.moveTo(e.touches[0]),e.preventDefault()}),document.addEventListener("touchend",function(e){io.moveTo(e.touches[0]),io.firing=!1,e.preventDefault()}),I(window,"resize",i);var n=function(){i(),window.requestAnimFrame(n)};n()}else S=document.getElementById("canvas"),q=S.getContext("2d"),P=document.createElement("canvas"),C=P.getContext("2d"),q.fillStyle="#fff",q.font="italic 25px arial",q.textBaseline="bottom",q.fillText("Loading...",P.width-200,P.height-50),e()}function s(){var e,o;for(co=[],fo=ao.createGain(),e=0,o=Mo.length;o>e;e++)a(e);for(e=Mo.length,o=e+ko.length;o>e;e++)a(e),co[e].loop=!1;fo.connect(ao.destination),co[0].start(0),Eo=!0}function a(e){co[e]=ao.createBufferSource(),co[e].buffer=uo.bufferList[e],co[e].connect(fo),co[e].loop=!0}function u(){co[po].stop(0),po++,po>Mo.length-1&&(po-=Mo.length),a(po),co[po].start(0)}function c(e){var o=co[e];o.playing&&o.stop(0),a(e),o.loop=!1,o.start(0),o.playing=!0}function p(){fo.gain.value=1===fo.gain.value?0:1}function d(e){return e=xo[Xo.ship],e.posX=e.width,e.posY=R.height/2-e.height/2,e.centerX=e.posX+e.width/2,e.centerY=e.posY+e.height/2,e.rotate=0,e.firing=!1,e.bombing=!1,e.cooldown=0,e.weapon={count:1,chaos:0,spreadBase:9,spacing:0,speed:30,color:"#00ffff",shape:0,firerate:20},e.weapon.spread=Math.PI/e.weapon.spreadBase,e.moveTo=function(o){var n=o.pageX-e.width/2,t=o.pageY-e.height/2;n>0&&n<S.width&&t>0&&t<S.height&&(e.posX=n,e.posY=t)},e.increaseWeaponSpread=function(){e.weapon.spreadBase<20&&(e.weapon.spreadBase+=.2,e.weapon.spread=Math.PI/e.weapon.spreadBase)},e.decreaseWeaponSpread=function(){e.weapon.spreadBase>2&&(e.weapon.spreadBase-=.2,e.weapon.spread=Math.PI/e.weapon.spreadBase)},e.increaseBullets=function(){e.weapon.count<20&&(e.weapon.count+=1)},e.decreaseBullets=function(){e.weapon.count>=2&&(e.weapon.count-=1)},e.checkForFire=function(){e.cooldown-=60,e.firing&&e.cooldown<=0&&(e.fire(),e.cooldown=e.weapon.firerate)},e.fire=function(){var o=0,n=0,t=0,i=0;e.weapon.count>1&&(o=-e.weapon.spread/2,n=e.weapon.spacing/2,t=e.weapon.spread/(e.weapon.count-1),i=e.weapon.spacing/(e.weapon.count-1));for(var r,s=e.rotate*ho,a=e.posX+34*Math.cos(s)-5*Math.sin(s),u=e.posY+34*Math.sin(s)+5*Math.cos(s),p=0,d=this.weapon.count;d>p;p++){var g=Math.cos(s-Math.PI/2)*(n-p*i),h=Math.sin(s-Math.PI/2)*(n-p*i);r=new f({shot:this,direction:s+o+p*t,shotX:a+g+Math.random()*e.weapon.chaos-e.weapon.chaos/2,shotY:u+h+Math.random()*e.weapon.chaos-e.weapon.chaos/2,speed:e.weapon.speed}),r.add()}Eo&&c(Mo.length+yo.shot)},e.focusOn=function(){e.speed=3,e.src="images/ship-focused.png"},e.focusOff=function(){e.speed=7,e.src="images/ship.png"},e}function f(e){return e.shot=new Image,e.shot.src="images/shot.png",e.shot.posX=e.shotX,e.shot.posY=e.shotY,e.shot.direction=e.direction||0,e.shot.speed=e.speed||256,e.shot.color=e.color||"F00",e.shot.add=function(){lo.push(e.shot)},e.shot.del=function(e){arrayRemove(lo,e)},e.shot}function g(e){return e=xo[Xo.boss],e.posX=S.width-e.width,e.posY=S.height/2-e.width/2,e.life=700,e.kill=function(){no.createExplosion(e.posX,e.posY,130,15,70,3,0),To+=1e3,Bo=!1},e}function h(e){return e=new Image,e.src="images/bugger.png",e.initPos=Math.random()*(R.height-120)+60,e.posX=S.width+Math.random()*(S.width/2)+1,e.posY=e.initPos,e.speed=5,e.update=function(){e.posX-=e.speed,e.posY-=3*Math.sin(e.initPos*Math.PI/64),e.initPos++,e.posY<0&&(e.posY=0),e.posY>R.height-100&&(e.posY=R.height-100)},e.add=function(){vo.push(e)},e.del=function(e){arrayRemove(vo,e)},e}function l(e,o,n){var t=o.posX,i=o.posY,r=o.width,s=o.height;return o.fire&&(t+=5,i-=15,s=15,r=20),e.posX>=t&&e.posX<=t+r&&(e.posY>=i&&e.posY<=i+s||e.posY<=i&&i<e.posY+e.width)?(n(),B(e.posX,e.posY),Eo&&c(Mo.length+yo.explosion),!0):!1}function m(e){return l(e,ro,function(){ro.life>1?ro.life--:ro.kill(),e.del(parseInt(e.id,10)),To+=10})}function w(e){var o;return lo.forEach(function(n){return o=l(n,e,function(){n.del(parseInt(n.id,10)),e.del(parseInt(e.id,10)),To+=50}),o?!0:void 0}),l(e,io,function(){To-=20,e.del(parseInt(e.id,10))})}function v(e,o,n,t,i){o.save(),o.translate(n,t),o.rotate(i*ho),o.drawImage(e,-(e.width/2),-(e.height/2)),o.restore()}function b(){io.rotate-=5,io.rotate<=-360&&(io.rotate=0)}function x(){io.rotate+=5,io.rotate>=360&&(io.rotate=0)}function X(){return mo.focus?io.focusOn():io.focusOff(),mo.spaceBar?!1:(mo.up&&io.posY>io.height/2&&(io.posY-=io.speed),mo.down&&io.posY<S.height-io.height/2&&io.posY<R.height&&(io.posY+=io.speed),mo.left&&io.posX>io.width/2&&(io.posX-=io.speed),mo.right&&io.posX<S.width-io.width/2&&(io.posX+=io.speed),mo.rotateLeft&&b(),mo.rotateRight&&x(),mo.fireMoreSpread&&io.increaseWeaponSpread(),mo.fireLessSpread&&io.decreaseWeaponSpread(),mo.increaseBullets&&io.increaseBullets(),mo.decreaseBullets&&io.decreaseBullets(),mo.fire?io.firing=!0:mo.fire!==!1||jo||(io.firing=!1),mo.fire2&&T(),mo.speedUp&&10>go&&(go+=1,console.log(go)),mo.speedDown&&go>=2&&(go-=1,console.log(go)),mo.toggleMusic&&Eo&&(Io||(Io=!0,u(),console.log("Changing music"))),mo.mute&&Eo&&(Io||(Io=!0,p(),console.log("Mute"))),mo.buggerMode&&(Yo||(Yo=!0,Bo=!1,ro=null,A())),mo.bossMode&&(Bo||(Bo=!0,Yo=!1,L(),ro=new g)),mo.clearEnemies&&(Bo&&(Bo=!1,ro=null),Yo&&(Yo=!1,L())),void 0)}function I(e,o,n,t){if(t=t||!1,window.addEventListener)e.addEventListener(o,n,t);else{if(!window.attachEvent)return!1;e.attachEvent("on"+o,n)}}function M(e){var o=window.event?e.keyCode:e.which;for(var n in wo)o===wo[n]&&(e.preventDefault(),mo[n]=!0)}function k(e){var o=window.event?e.keyCode:e.which;(84===o||77===o)&&(Io=!1);for(var n in wo)o===wo[n]&&(e.preventDefault(),mo[n]=!1)}function y(){q.drawImage(P,0,0)}function T(){io.bombing||(io.bombing=!0,Eo&&c(Mo.length+yo.bomb),no.createExplosion(0,0,130,15,70,3,0),no.createExplosion(S.width,0,130,15,70,3,0),no.createExplosion(0,R.height,130,15,70,3,0),no.createExplosion(S.width,R.height,130,15,70,3,0),no.createExplosion(S.width/2,R.height/2,100,10,70,3,0,function(){setTimeout(function(){io.bombing=!1},1500)}),L())}function Y(){Ao([{source:[R,D,z,O,G,U,H,W],speed:.5,orientation:"horizontal",moveTo:"left"},{source:[V,N,Q,Z,V,N,Q,Z],speed:3,orientation:"horizontal",moveTo:"left"},{source:[J,K,$,_,eo,oo],speed:7,orientation:"horizontal",moveTo:"left"}]),v(io,C,io.posX,io.posY,io.rotate),Bo&&C.drawImage(ro,ro.posX,ro.posY),io.checkForFire(),lo.length>0&&lo.forEach(function(e,o){e.id=o,Bo&&m(e)||(e.posX+=Math.cos(e.direction)*e.speed,e.posY+=Math.sin(e.direction)*e.speed,(e.posX<0||e.posY<0||e.posX>S.width||e.posY>S.height)&&e.del(parseInt(e.id,10)),C.drawImage(e,e.posX,e.posY))}),Yo&&vo.length>0&&vo.forEach(function(e,o){e.id=o,w(e)||(e.update(),(e.posX<0||e.posX>S.width)&&e.del(parseInt(e.id,10)),C.drawImage(e,e.posX,e.posY))}),Yo&&io.bombing===!1&&A(),X(),no.draw(),C.font="italic 25px arial",Bo&&(C.fillStyle="#f00",C.fillText(ro.life,ro.posX-23+ro.width/2,ro.posY-20)),C.fillStyle="#fff",C.fillText("Score: "+To,50,50),Eo||C.fillText("Music still loading...",50,100),F()}function B(e,o){no.createExplosion(e,o,25,4,70,3,.1)}function E(e){var o=[],n=e;this.draw=function(){for(var e=[],t=o.length-1;t>=0;t--)o[t].moves++,o[t].x+=o[t].xunits,o[t].y+=o[t].yunits+o[t].gravity*o[t].moves,o[t].moves<o[t].life&&(e.push(o[t]),n.globalAlpha=5/o[t].moves,n.drawImage(to,Math.floor(o[t].x),Math.floor(o[t].y),o[t].width,o[t].height),n.globalAlpha=1);o=e},this.createExplosion=function(e,n,t,i,r,s,a,u){var c,p;for(e-=.5*t,n-=.5*t,s=.01*t*s,c=1;i>c;c++)for(p=0;10*c>p;p++)o.push(j(e,n,t,t,c*s,a,r));u&&u()}}function j(e,o,n,t,i,r,s){var a=Math.floor(360*Math.random()),u=a*Math.PI/180;return{x:e,y:o,width:n,height:t,speed:i,life:s,gravity:r,xunits:Math.cos(u)*i,yunits:Math.sin(u)*i,moves:0}}function A(){for(var e=null,o=0,n=so-vo.length;n>o;o++)e=new h,e.add()}function L(){vo.forEach(function(e){e=null}),vo.length=0}function F(){C.font="italic 15px arial",C.fillText("[Arrows] -> Move",10,S.height-70),C.fillText("[1] -> Buggers Mode",10,S.height-50),C.fillText("[2] -> Boss Mode",10,S.height-30),C.fillText("[X] -> Shoot",10,S.height-10),C.fillText("[C] -> Bombs",150,S.height-70),C.fillText("[Z] -> Focus",150,S.height-50),C.fillText("[A] -> Rotate left",150,S.height-30),C.fillText("[D] -> Rotate right",150,S.height-10),C.fillText("[W] -> Fire more spread",280,S.height-70),C.fillText("[I] -> Increase bullets",280,S.height-50),C.fillText("[O] -> Decrease bullets",280,S.height-30),C.fillText("[T] -> Change music",280,S.height-10),C.fillText("[M] -> Mute",450,S.height-70),C.fillText("[Av Pag] -> Speed up",450,S.height-50),C.fillText("[Re Pag] -> Speed down",450,S.height-30),C.fillText("[0] -> Clear enemies",450,S.height-10)}var S,q,P,C,R,D,z,O,W,H,U,G,V,N,Q,Z,J,K,$,_,eo,oo,no,to,io,ro,so,ao,uo,co,po,fo,go=2,ho=Math.PI/180,lo=[],mo={},wo={left:37,up:38,right:39,down:40,rotateLeft:65,rotateRight:68,fireMoreSpread:87,fireLessSpread:83,fire:88,fire2:67,increaseBullets:73,decreaseBullets:79,focus:90,speedUp:34,speedDown:33,toggleMusic:84,spaceBar:32,mute:77,buggerMode:49,bossMode:50,clearEnemies:48},vo=[],bo=["images/fire.png","images/background-1.jpg","images/background-2.jpg","images/background-3.jpg","images/background-4.jpg","images/background-4-mirror.jpg","images/background-3-mirror.jpg","images/background-2-mirror.jpg","images/background-1-mirror.jpg","images/foreground-1.png","images/foreground-2.png","images/foreground-3.png","images/foreground-4.png","images/starfield-2.png","images/ship.png","images/ship-focused.png","images/shot.png","images/boss.png","images/bugger.png"],xo=[],Xo={fire:0,background1:1,background2:2,background3:3,background4:4,background4m:5,background3m:6,background2m:7,background1m:8,foreground1:9,foreground2:10,foreground3:11,foreground4:12,starfield:13,ship:14,shipFocused:15,shot:16,boss:17,bugger:18},Io=!1,Mo=["music/16-bits-TFIV-Stand-Up-Against-Myself.ogg","music/32-bits-TFV-Steel-Of-Destiny.ogg","music/128-bits-Ikaruga-Ideal.ogg"],ko=["music/FX/bomb.ogg","music/FX/shot.ogg","music/FX/explosion.ogg"],yo={bomb:0,shot:1,explosion:2},To=0,Yo=!1,Bo=!1,Eo=!1,jo=!1,Ao=function(e){Array.isArray(e)||(e=[e]),e.forEach(function(e){var o,n,i,r,s,a,u,c={source:[],orientation:"horizontal",moveTo:"right"};if(e.mirrorAtEnd){var p=O;e.source.push(p)}for(o=e.source.length,t(c,e),c.speed=e.speed?go*e.speed:go;o--;)n="horizontal"===c.orientation?"X":"Y",i="horizontal"===c.orientation?"width":"height",r="down"===c.moveTo||"right"===c.moveTo?"negative":"positive",u=S.width/c.source[o][i],"positive"===r?c.source[o]["pos"+n]-=c.speed:c.source[o]["pos"+n]+=c.speed,s="positive"===r?c.source[o]["pos"+n]+c.source[o][i]>0:c.source[o]["pos"+n]<c.source[o][i],s?(a=c.source[o]["pos"+n],C.drawImage(c.source[o],"X"===n?a:0,"Y"===n?a:0)):(a=c.source[o][i]*(e.source.length-(e.source.length%4?1:2)),c.source[o]["pos"+n]="positive"===r?a:-1*Math.abs(a))})};return{init:r}}();define("main",function(){}),require(["main"]);
//# sourceMappingURL=main.js.map