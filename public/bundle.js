(()=>{"use strict";var s={769:(t,C,o)=>{Object.defineProperty(C,"__esModule",{value:!0}),C.gameTick=C.hydraulicPressLocation=C.world=void 0;const M=o(357),S=[-1,-1,-1,0,0,1,1,1],L=[-1,0,1,-1,1,-1,0,1];function s(t,e,o,s,i){const r=i.length,n=i[0].length;var a=3*n/2|0,l=3*r/2|0,c=Symbol(),h=Array(3*r).fill(void 0).map(()=>Array(3*n).fill(!1));for(let o=0;o<3*r;++o)for(let t=0;t<3*n;++t)i[o/3|0][t/3|0]&&(h[o][t]=!0);var d,p=new M.SoftBody;const u=Array(3*r).fill(void 0).map(()=>Array(3*n));for(let i=0;i<3*r;++i)for(let s=0;s<3*n;++s)if(h[i][s]){let o=!1;for(let t=0;t<S.length;++t){var y=i+S[t],f=s+L[t];0<=y&&0<=f&&y<3*r&&f<3*n&&!1!==h[y][f]||(o=!0)}o&&((d=new M.PointMass(p)).position.y=2*(i-l)+e,d.position.x=2*(s-a)+t,d.radius=2,d.collisionGroup=c,u[i][s]=d)}{let t=0,o=-1,s=3*r-1,i;for(i=0;i<3*n&&!u[s][i];++i);var m=s,v=i;function b(t,o){return 0<=t&&0<=o&&t<3*r&&o<3*n&&u[t][o]}do{var x=u[s][i];if(!b(s+t,i+o))if(b(s+o,i-t)){var g=o;o=-t,t=g}else{if(!b(s-o,i+t))throw 0;g=o;o=t,t=-g}s+=t,i+=o,x.userdata=u[s][i]}while(s!==m||i!==v)}for(const k of u)for(const P of k)void 0!==P&&p.nodes.push(P);function j(t,o,s){0<=o&&o<u.length&&void 0!==u[o][s]&&((t=new M.Spring(t,u[o][s])).autoLength(),t.strength=1e3,t.damping=100,C.world.springs.add(t))}p.userdata={color:o,strokeColor:s},C.world.addBody(p);for(let o=0;o<3*r;++o)for(let t=0;t<3*n;++t){var w=u[o][t];w&&(j(w,o+1,t),j(w,o,t+1),j(w,o+1,t+1),j(w,o+1,t-1))}return p}C.world=new M.PhysicsWorld;const i=[{color:"#0cc",strokeColor:"#0aa",data:[[!0,!0,!0,!0]]},{color:"#04f",strokeColor:"#03c",data:[[!0,!1,!1,!1],[!0,!0,!0,!0]]},{color:"#f70",strokeColor:"#c50",data:[[!1,!1,!1,!0],[!0,!0,!0,!0]]},{color:"#fc0",strokeColor:"#ca0",data:[[!0,!0],[!0,!0]]},{color:"#0c0",strokeColor:"#0a0",data:[[!1,!0,!0],[!0,!0,!1]]},{color:"#c0c",strokeColor:"#a0a",data:[[!1,!0,!1],[!0,!0,!0]]},{color:"#f00",strokeColor:"#c00",data:[[!0,!0,!1],[!1,!0,!0]]}];C.hydraulicPressLocation=144,C.world.topLine=C.hydraulicPressLocation;let e,r=!1,n=!1;const a=new Set,l=(document.addEventListener("keydown",t=>{a.add(t.code)}),document.addEventListener("keyup",t=>{a.delete(t.code)}),document.getElementById("game-over"));o=document.getElementById("restart");const c=document.getElementById("show-board");o.addEventListener("click",()=>{l.style.display="none",h=void 0,n=r=!1,C.world.topLine=C.hydraulicPressLocation=144,C.world.softBodyStructure=!0;for(const t of C.world.bodies)C.world.removeBody(t);for(const o of C.world.springs)C.world.springs.delete(o);p()});let h;c.addEventListener("click",()=>{c.disabled=!0,h&&(C.hydraulicPressLocation=144,n=!0,C.world=h,h=void 0)});let d;function p(){if(!r){let t;for(;(t=Math.random()*i.length|0)===d;);d=t;var o=i[t];return(e=s(0,132,o.color,o.strokeColor,o.data)).collisionCallback=t=>{("bottom"===t||t instanceof M.SoftBody)&&(132<=e.computeCenterOfMass().y&&(h=C.world.clone(),r=!0,l.style.display="flex",c.disabled=!1),e.collisionCallback=void 0,e=void 0,setTimeout(p,500))},e}}p();const u=1/60;let y=0;C.gameTick=function(t){y+=t;var o=0|Math.min(y/u,60);y%=u;for(let t=0;t<o;++t)0<C.hydraulicPressLocation&&r&&!n&&(C.hydraulicPressLocation-=.5,C.world.topLine=C.hydraulicPressLocation,C.hydraulicPressLocation<30)&&(C.world.softBodyStructure=!1),e&&((a.has("ArrowLeft")||a.has("KeyA"))&&-30<e.computeVelocity().x&&e.applyImpulse(-3,0),(a.has("ArrowRight")||a.has("KeyD"))&&e.computeVelocity().x<30&&e.applyImpulse(3,0),(a.has("ArrowDown")||a.has("KeyS"))&&e.applyImpulse(0,-3),a.has("Space")&&e.applyImpulse(0,-100),a.has("KeyQ")&&e.computeAngularVelocity()<5&&e.applyAngularImpulse(.5),a.has("KeyE"))&&-5<e.computeAngularVelocity()&&e.applyAngularImpulse(-.5)}},357:(t,o)=>{Object.defineProperty(o,"__esModule",{value:!0}),o.SoftBody=o.PointMass=o.Spring=o.PhysicsWorld=o.Vec2=void 0;const s=1/120;class i{constructor(t,o){this.x=t,this.y=null!=o?o:t}addFactor(t,o){return this.x+=t.x*o,this.y+=t.y*o,this}lerp(t,o){return this.x+=(t.x-this.x)*o,this.y+=(t.y-this.y)*o,this}add(t){return"number"==typeof t?(this.x+=t,this.y+=t):(this.x+=t.x,this.y+=t.y),this}sub(t){return"number"==typeof t?(this.x-=t,this.y-=t):(this.x-=t.x,this.y-=t.y),this}mul(t){return"number"==typeof t?(this.x*=t,this.y*=t):(this.x*=t.x,this.y*=t.y),this}div(t){return"number"==typeof t?(this.x/=t,this.y/=t):(this.x/=t.x,this.y/=t.y),this}set(t){return"number"==typeof t?(this.x=t,this.y=t):(this.x=t.x,this.y=t.y),this}distanceTo(t){var o=this.x-t.x,t=this.y-t.y;return Math.sqrt(o*o+t*t)}dot(t){return this.x*t.x+this.y*t.y}cross(t){return this.x*t.y-this.y*t.x}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}normalize(){var t=this.length();return Math.abs(t)<1e-12?this:this.div(t)}clone(){return new i(0).set(this)}rot90(){var t=this.x,o=this.y;return this.x=-o,this.y=t,this}rotate(t){var o=this.x,s=this.y;return this.x=o*Math.cos(t)-s*Math.sin(t),this.y=o*Math.sin(t)+s*Math.cos(t),this}}o.Vec2=i;o.PhysicsWorld=class f{constructor(){this.springs=new Set,this.objects=new Set,this.bodies=new Set,this.gravity=new i(0,-50),this.topLine=1/0,this.softBodyStructure=!0,this.lag=0}clone(){var t=new f,o=new Map;for(const a of this.objects){var s=a.clone();o.set(a,s),t.objects.add(s)}for(const l of t.objects)o.has(l.userdata)&&(l.userdata=o.get(l.userdata));for(const c of this.springs){var i=o.get(c.obj0),e=o.get(c.obj1);if(void 0===i||void 0===e)throw{objectMap:o,spring:c};(i=new u(i,e)).length=c.length,i.strength=c.strength,i.damping=c.damping,t.springs.add(i)}for(const h of this.bodies){var r=new y;for(const d of h.nodes){var n=o.get(d);if(void 0===n)throw{objectMap:o,cloneNode:n};r.nodes.push(n)}for(const p of h.idealPositions)r.idealPositions.push(p.clone());o.has(r.userdata)?r.userdata=o.get(h.userdata):r.userdata=h.userdata,t.bodies.add(r)}return t.gravity.set(this.gravity),t.topLine=this.topLine,t.softBodyStructure=this.softBodyStructure,t}addBody(t){this.bodies.add(t);var o=t.computeCenterOfMass();for(const s of t.nodes)t.idealPositions.push(s.position.clone().sub(o)),this.objects.add(s)}removeBody(t){this.bodies.delete(t);for(const o of t.nodes)this.objects.delete(o)}applyGravity(t){for(const o of this.objects)0!==o.mass&&o.velocity.addFactor(this.gravity,t)}*findWorldCollisions(t){t.position.y-t.radius<0&&(yield{obj0:"bottom",obj1:t,normal:new i(0,1),depth:-(t.position.y-t.radius)}),t.position.x-t.radius<-30&&(yield{obj0:"left",obj1:t,normal:new i(1,0),depth:-(t.position.x-t.radius)-30}),30<t.position.x+t.radius&&(yield{obj0:"right",obj1:t,normal:new i(-1,0),depth:t.position.x+t.radius-30}),t.position.y+t.radius>this.topLine&&(yield{obj0:"top",obj1:t,normal:new i(0,-1),depth:t.position.y+t.radius-this.topLine})}*findCollisions(){var i=new Map;for(const h of this.objects){var t=Math.floor((h.position.x-h.radius)/4),e=Math.floor((h.position.y-h.radius)/4),o=Math.ceil((h.position.x+h.radius)/4),r=Math.ceil((h.position.y+h.radius)/4);for(let s=t;s<o;++s)for(let o=e;o<r;++o){var n=67108864*(s+33554432)+(o+33554432);let t=i.get(n);t||(t=[],i.set(n,t)),t.length<30&&t.push(h)}}for(const d of i.values())for(let o=0;o<d.length;++o){var s=d[o];yield*this.findWorldCollisions(s);for(let t=o+1;t<d.length;++t){var a,l,c=d[t];s.collisionGroup===c.collisionGroup&&void 0!==s.collisionGroup||s.position.distanceTo(c.position)<s.radius+c.radius&&(0===(a=c.position.clone().sub(s.position)).length()&&(a.x=1,a.y=0),l=a.length(),yield{obj0:s,obj1:c,normal:a.normalize(),depth:s.radius+c.radius-l})}}}applyCollisions(t){for(const r of this.findCollisions()){var o,s,i,e;("string"!=typeof r.obj0&&0!==r.obj0.mass||0!==r.obj1.mass)&&(0===r.obj1.mass&&(o=r.obj0,r.obj0=r.obj1,r.obj1=o,r.normal.mul(-1)),"string"==typeof r.obj0||0===r.obj0.mass?((o=r.obj1).position.addFactor(r.normal,r.depth),i=r.normal.clone().mul(r.normal.dot(o.velocity)),(s=o.velocity.clone().sub(i)).mul(Math.exp(-o.friction*t)),i.mul(-o.elasticity).add(s),o.velocity.set(i),o.parent.collisionCallback&&o.parent.collisionCallback("string"==typeof r.obj0?r.obj0:r.obj0.parent)):(s=r.obj0,i=r.obj1,s.position.addFactor(r.normal,-r.depth/2),i.position.addFactor(r.normal,r.depth/2),e=(s.elasticity+i.elasticity)/2,e=2*(s.velocity.dot(r.normal)-i.velocity.dot(r.normal))/(s.mass+i.mass)*e,s.velocity.addFactor(r.normal,-e*s.mass),i.velocity.addFactor(r.normal,e*i.mass),s.parent.collisionCallback&&s.parent.collisionCallback(i.parent),i.parent.collisionCallback&&i.parent.collisionCallback(s.parent)))}}applySprings(t){for(const r of this.springs){var o,s,i,e;0===r.obj0.mass&&0===r.obj1.mass||(r.obj0,r.obj1,r.obj1.mass,o=r.obj0.position.distanceTo(r.obj1.position),s=r.obj1.position.clone().sub(r.obj0.position).normalize(),i=r.obj1.velocity.clone().sub(r.obj0.velocity).dot(s),0===r.obj0.mass?(e=(r.strength*(r.length-o)-r.damping*i)*t,r.obj1.velocity.addFactor(s,e)):(e=(r.strength*(r.length-o)-r.damping*i)/(r.obj0.mass+r.obj1.mass)*t,r.obj0.velocity.addFactor(s,-e*r.obj1.mass),r.obj1.velocity.addFactor(s,e*r.obj0.mass)))}}applySoftBodies(i){if(this.softBodyStructure)for(const u of this.bodies){var e=u.computeCenterOfMass();let o=0,s=0;for(let t=0;t<u.nodes.length;++t){var r=u.nodes[t].position.clone().sub(e);o+=r.dot(u.idealPositions[t]),s+=r.cross(u.idealPositions[t])}var n=-Math.atan2(s,o),a=u.computeVelocity(),l=u.computeAngularVelocity();for(let t=0;t<u.nodes.length;++t){var c=u.nodes[t],h=e.clone().add(u.idealPositions[t].clone().rotate(n)),d=u.idealPositions[t].length(),d=h.clone().sub(e).normalize().rot90().mul(l*d/c.mass).add(a),p=(h=h.sub(c.position)).length();h.normalize(),d=d.clone().sub(c.velocity).dot(h),c.velocity.addFactor(h,(1e3*p+10*d)*i)}}}fixedStep(t){this.applyCollisions(t),this.applySprings(t),this.applySoftBodies(t),this.applyGravity(t);for(const o of this.objects)o.position.addFactor(o.velocity,t)}step(t){this.lag+=t;var o=0|Math.min(this.lag/s,120);this.lag%=s;for(let t=0;t<o;++t)this.fixedStep(s)}};class u{constructor(t,o){this.obj0=t,this.obj1=o,this.length=10,this.strength=20,this.damping=10}autoLength(){this.length=this.obj0.position.distanceTo(this.obj1.position)}}o.Spring=u;o.PointMass=class e{constructor(t){this.parent=t,this.collisionGroup=void 0,this.radius=1,this.mass=1,this.elasticity=.7,this.friction=15,this.velocity=new i(0),this.position=new i(0)}clone(){var t=new e(this.parent);return t.collisionGroup=this.collisionGroup,t.radius=this.radius,t.mass=this.mass,t.elasticity=this.elasticity,t.friction=this.friction,t.userdata=this.userdata,t.velocity.set(this.velocity),t.position.set(this.position),t}};class y{constructor(){this.nodes=[],this.idealPositions=[]}applyAngularImpulse(o){var s=this.computeCenterOfMass();for(let t=0;t<this.nodes.length;++t){var i=this.nodes[t],e=i.position.distanceTo(s),r=i.position.clone().sub(s).normalize().rot90();i.velocity.addFactor(r,o*e)}}applyImpulse(o,s){if("number"!=typeof o&&(s=o.y,o=o.x),void 0===s)throw 0;for(let t=0;t<this.nodes.length;++t){var i=this.nodes[t];i.velocity.x+=o,i.velocity.y+=s}}move(o,s){if("number"!=typeof o&&(s=o.y,o=o.x),void 0===s)throw 0;for(let t=0;t<this.nodes.length;++t){var i=this.nodes[t];i.position.x+=o,i.position.y+=s}}computeCenterOfMass(t=new i(0)){t.set(0);let o=0;for(const s of this.nodes)t.addFactor(s.position,s.mass),o+=s.mass;return t.div(o),t}computeVelocity(t=new i(0)){t.set(0);let o=0;for(const s of this.nodes)t.addFactor(s.velocity,s.mass),o+=s.mass;return t.div(o),t}computeAngularVelocity(){var t=this.computeCenterOfMass();let o=0,s=0;for(const r of this.nodes){var i=r.position.distanceTo(t),e=r.position.clone().sub(t).normalize().rot90();o+=r.velocity.dot(e)/i*r.mass,s+=r.mass}return o/s}}o.SoftBody=y},419:(t,o,s)=>{Object.defineProperty(o,"__esModule",{value:!0}),o.Renderer=void 0;const e=s(769);o.Renderer=class{constructor(){this.ctx=null,this.pressImg=new Image,this.pressImg.src="hydraulic-press.svg",this.canvas=document.getElementById("canvas")}render(){if((null===this.ctx||this.canvas.width!==this.canvas.offsetWidth||this.canvas.height!==this.canvas.offsetHeight)&&(this.canvas.width=this.canvas.offsetWidth,this.canvas.height=this.canvas.offsetHeight,this.ctx=this.canvas.getContext("2d"),!this.ctx))throw 0;this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height),this.ctx.translate(this.canvas.width/2,this.canvas.height/2),this.ctx.scale(5,-5),this.ctx.translate(0,-72),this.ctx.fillStyle="#eee",this.ctx.beginPath(),this.ctx.roundRect(-30,0,60,144,2),this.ctx.fill(),this.ctx.save(),this.ctx.beginPath(),this.ctx.roundRect(-30,0,60,144,2),this.ctx.clip();for(const i of e.world.bodies){this.ctx.fillStyle=i.userdata.color,this.ctx.lineJoin="round",this.ctx.beginPath();let t=i.nodes[0];var s=t;this.ctx.moveTo(t.position.x,t.position.y);let o=0;for(;t=t.userdata,this.ctx.lineTo(t.position.x,t.position.y),s!==t&&o++<50;);this.ctx.closePath(),this.ctx.lineWidth=4,this.ctx.strokeStyle=i.userdata.strokeColor,this.ctx.stroke(),this.ctx.lineWidth=3,this.ctx.strokeStyle=i.userdata.color,this.ctx.stroke(),this.ctx.fill()}this.ctx.lineWidth=.5,this.ctx.strokeStyle="#f00",this.ctx.setLineDash([1,1]),this.ctx.lineDashOffset=.5,this.ctx.lineCap="round",this.ctx.beginPath(),this.ctx.moveTo(-30,120),this.ctx.lineTo(30,120),this.ctx.stroke(),this.ctx.scale(1,-1),this.ctx.drawImage(this.pressImg,-30,-e.hydraulicPressLocation-21,60,21),this.ctx.restore(),this.ctx.lineWidth=.5,this.ctx.strokeStyle="#000",this.ctx.setLineDash([]),this.ctx.beginPath(),this.ctx.roundRect(-30,0,60,144,2),this.ctx.stroke(),this.ctx.resetTransform()}}}},i={};function e(t){var o=i[t];return void 0!==o||(o=i[t]={exports:{}},s[t](o,o.exports,e)),o.exports}{const r=e(419),n=e(769);r.Renderer.instance=new r.Renderer;let s=performance.now()/1e3;!function t(){requestAnimationFrame(t);var o=performance.now()/1e3;n.world.step(o-s),(0,n.gameTick)(o-s),s=o,r.Renderer.instance.render()}()}})();