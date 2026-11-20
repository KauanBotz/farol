(function(){
  var canvas=document.getElementById('city-scene');
  if(!canvas || !window.THREE) return;
  try {
    var scene=new THREE.Scene();
    var camera=new THREE.OrthographicCamera(-6,6,6,-6,.1,100);camera.position.set(11,13,15);camera.lookAt(0,0,0);
    var renderer=new THREE.WebGLRenderer({canvas:canvas,alpha:true,antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));
    scene.add(new THREE.HemisphereLight(0xffffff,0x88a993,2));var light=new THREE.DirectionalLight(0xffffff,2);light.position.set(3,10,5);scene.add(light);
    var city=new THREE.Group();scene.add(city);
    var base=new THREE.Mesh(new THREE.BoxGeometry(10,.25,10),new THREE.MeshStandardMaterial({color:0xc7ddc9}));city.add(base);
    var building=new THREE.MeshStandardMaterial({color:0xf7faf4});var green=new THREE.MeshStandardMaterial({color:0x79ae89});
    for(var x=-4;x<=4;x+=2){for(var z=-4;z<=4;z+=2){if((x===0&&z===0)||(x===2&&z===0))continue;var h=0.5+((x*x+z*z+Math.abs(x*z))%5)*.22;var block=new THREE.Mesh(new THREE.BoxGeometry(1.25,h,1.25),((x+z)%4===0)?green:building);block.position.set(x,h/2+.13,z);city.add(block);}}
    var pin=new THREE.Group();var stem=new THREE.Mesh(new THREE.CylinderGeometry(.08,.08,1.1,12),new THREE.MeshStandardMaterial({color:0x145a46}));stem.position.y=.6;pin.add(stem);var orb=new THREE.Mesh(new THREE.SphereGeometry(.42,24,16),new THREE.MeshStandardMaterial({color:0x145a46}));orb.position.y=1.3;pin.add(orb);pin.position.set(0,.2,0);city.add(pin);
    function resize(){var w=canvas.clientWidth,h=canvas.clientHeight;renderer.setSize(w,h,false);camera.left=-6*w/h;camera.right=6*w/h;camera.top=6;camera.bottom=-6;camera.updateProjectionMatrix();renderer.render(scene,camera)}
    resize();window.addEventListener('resize',resize);
    if(window.gsap&&!matchMedia('(prefers-reduced-motion: reduce)').matches){gsap.from(city.rotation,{y:-.2,duration:1.6,ease:'power2.out',onUpdate:function(){renderer.render(scene,camera)}});}
  } catch(e) { canvas.style.display='none'; }
})();
