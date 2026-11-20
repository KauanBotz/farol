(function () {
  'use strict';
  window.buildFarolNeighborhood = function (T, scene) {
    const box = new T.BoxGeometry(1, 1, 1);
    const round = new T.CylinderGeometry(1, 1, 1, 10);
    const leaf = new T.IcosahedronGeometry(1, 1);
    const lit = new T.MeshStandardMaterial({ roughness: .86 });
    const glow = new T.MeshBasicMaterial();
    const batches = new Map();
    const traffic = [], canopies = [], streetlights = [];
    let moving = null;
    const city = new T.Group();
    scene.add(city);
    function part(geometry, material, color, x, y, z, w, h, d, angle = 0) {
      if (moving) {
        const mesh = new T.Mesh(geometry, material.clone());
        mesh.material.color.setHex(color);
        mesh.position.set(x,y,z); mesh.scale.set(w,h,d); mesh.rotation.y=angle;
        moving.add(mesh);
        return;
      }
      const key = geometry.id + ':' + material.id;
      if (!batches.has(key)) batches.set(key, { geometry, material, items: [] });
      batches.get(key).items.push([color, x, y, z, w, h, d, angle]);
    }
    const block = (c, x, y, z, w, h, d, a) => part(box, lit, c, x, y, z, w, h, d, a);
    const pole = (c, x, y, z, r, h) => part(round, lit, c, x, y, z, r, h, r);
    const light = (c, x, y, z, w, h, d) => part(box, glow, c, x, y, z, w, h, d);
    const roads = [-6.6, -3.3, 0, 3.3, 6.6];
    const centers = [-4.95, -1.65, 1.65, 4.95];
    const ink = 0x283f44, curb = 0xb8b9a6, asphalt = 0x39474a;
    const facades = [0xcab391, 0x9bb1ab, 0xe4c5a0, 0xb68068, 0xb6c6ba, 0x819da5];
    /* Sem plano de chão: o canvas fica transparente e o gradiente da seção atravessa a cena. */
    roads.forEach((road,i)=>{
      block(asphalt,road,-.034,(i%3-1)*.58,.96,.068,17.2+(i%2)*2);
      block(asphalt,(i%3-1)*.72,-.04,road,17.4+(i%2)*2,.079,.96);
    });
    function tree(x, z, scale = 1) {
      block(0x344740,x,.111,z,.3,.015,.3);
      pole(0x665243,x,.31*scale,z,.041*scale,.57*scale);
      if (Math.abs(x)<3) {
        moving = new T.Group();
        moving.position.set(x,.57*scale,z);
      }
      const cx=moving ? 0 : x, cz=moving ? 0 : z, y=moving ? -.57*scale : 0;
      part(leaf, lit, 0x527758,cx,y+.77*scale,cz,.31*scale,.37*scale,.33*scale);
      part(leaf, lit, 0x75945d,cx+.14*scale,y+.91*scale,cz-.05,.22*scale,.25*scale,.22*scale);
      if (moving) { city.add(moving); canopies.push(moving); moving=null; }
    }
    function lamp(x, z, side) {
      pole(ink,x,.48,z,.025,.88);
      pole(0x496262,x,.145,z,.059,.105);
      block(ink,x+side*.10,.905,z,.23,.032,.045);
      block(ink,x+side*.20,.907,z,.14,.062,.105);
      if (Math.abs(x)<2 && Math.abs(z)<5) {
        const bulb = new T.Mesh(box,new T.MeshBasicMaterial({color:0x7b795f}));
        bulb.position.set(x+side*.20,.872,z); bulb.scale.set(.106,.013,.08); city.add(bulb);
        streetlights.push(bulb);
      } else light(0xc4b18a,x+side*.20,.872,z,.106,.013,.08);
    }
    function building(x,z,w,d,floors,style) {
      const height = .19 + floors*.33, c = facades[style % facades.length];
      block(0x67776d,x+.08,.107,z+.07,w+.22,.016,d+.22);
      block(c,x,.10+height/2,z,w,height,d);
      block(0xe5d4b7,x,height+.105,z,w+.045,.09,d+.045);
      block(0x586565,x,height+.154,z,w-.08,.025,d-.08);
      block(0x899188,x+.14,height+.232,z-.11,.25,.13,.20);
      block(0x465653,x+.14,height+.30,z-.11,.17,.015,.13);
      for (let f=0; f<floors; f++) {
        const y = .38 + f*.33;
        for (const s of [-1,1]) {
          for (const col of [-.29,0,.29]) {
            block(0x554f44,x+col,y,z+s*(d/2+.008),.18,.23,.035);
            block((f+style)%4===0 ? 0xe3bf83 : 0x44626c,x+col,y+.009,z+s*(d/2+.028),.139,.177,.01);
            block(0xb6c7bd,x+col,y-.074,z+s*(d/2+.037),.142,.012,.01);
          }
          for (const col of [-.24,.24]) {
            block(0x59615a,x+s*(w/2+.008),y,z+col,.035,.23,.20);
            block((f+style)%3===0 ? 0xc0ab80 : 0x3c5865,x+s*(w/2+.027),y,z+col,.01,.18,.157);
          }
        }
        if (style%3===0 && f>0) {
          block(0xe1d5bb,x,y-.12,z+d/2+.09,.65,.038,.19);
          block(0x596f68,x,y-.052,z+d/2+.177,.62,.11,.018);
        }
      }
      block(ink,x,.231,z+d/2+.025,.23,.27,.036);
      if (style%2===0) {
        block(0x487266,x,.55,z+d/2+.09,w*.88,.055,.20);
        for (let i=-3;i<=3;i+=2) block(0xe6cf9d,x+i*.105,.563,z+d/2+.09,.088,.023,.205);
      }
    }
    centers.forEach((x,i)=>centers.forEach((z,j)=>{
      block(curb,x,.045,z,2.34,.09,2.34);
      block(0x919c8b,x,.093,z,2.11,.014,2.11);
      const k=i*4+j;
      if (k===10 || k===5) {
        block(0x637d56,x,.104,z,1.9,.02,1.91);
        block(0xc4b699,x,.122,z,.31,.018,1.9);
        block(0xc4b699,x,.122,z,1.9,.018,.29);
        for(const a of [-.62,.62]) for(const b of [-.62,.62]) tree(x+a,z+b,.97);
        block(0x745d44,x+.44,.25,z+.13,.42,.042,.13);
        block(ink,x+.44,.168,z+.13,.30,.12,.077);
      } else {
        building(x-.49,z-.16,.90,1.35,2+(k%5),k);
        building(x+.49,z-.12,.86,1.23,1+((k*3)%4),k+2);
        tree(x-.52,z+.83,.74);
      }
      lamp(x+(x<0 ? 1.04 : -1.04),z+.68,x<0 ? 1 : -1);
    }));
    /* Sem moldura verde nas bordas: a cidade continua em tiles além do quarteirão central. */
    for (const x of roads) for (const z of centers) {
      for(const shift of [-.64,0,.64]) block(0xc8c3ab,x,.008,z+shift,.025,.014,.27);
      for(const side of [-1,1]) block(0x9e9d85,x+side*.439,.008,z,.022,.014,2.25);
    }
    for (const z of roads) for (const x of centers) {
      for(const shift of [-.64,0,.64]) block(0xc8c3ab,x+shift,.008,z,.27,.014,.025);
    }
    for (const z of [-3.3,0,3.3]) {
      for(let i=-2;i<=2;i++) {
        block(0xe8dfc8,i*.14,.012,z+.61,.088,.017,.24);
        block(0xe8dfc8,.61,.012,z+i*.14,.24,.017,.088);
      }
      pole(ink,.56,.35,z-.58,.023,.64);
      block(ink,.56,.66,z-.58,.11,.25,.1);
      for(let i=0;i<3;i++) light([0xf48b65,0x977946,0x486650][i],.56,.733-i*.073,z-.519,.056,.045,.023);
    }
    function car(x,z,color,direction) {
      moving=new T.Group(); moving.position.set(x,0,z); moving.rotation.y=direction<0 ? Math.PI : 0;
      traffic.push({group:moving,z,direction});
      scene.add(moving);
      x=0; z=0;
      block(0x253331,x,.045,z,.25,.07,.46);
      block(color,x,.11,z,.25,.12,.46);
      block(0x294851,x,.193,z+.008,.21,.075,.247);
      block(color,x,.238,z+.018,.18,.028,.148);
      for(const side of [-1,1]) {
        light(0xffefcf,x+side*.079,.134,z-.235,.055,.034,.018);
        light(0xff886c,x+side*.079,.134,z+.235,.055,.029,.018);
      }
      moving=null;
    }
    car(-.26,3.25,0xd5a276,1); car(.26,2.4,0x76a6a7,-1); car(3.05,-2.6,0xb87960,1); car(-3.07,-4.5,0xd8ceaa,1);
    const matrix = new T.Object3D();
    const color = new T.Color();
    batches.forEach(({geometry, material, items}) => {
      const mesh = new T.InstancedMesh(geometry, material, items.length);
      items.forEach(([c,x,y,z,w,h,d,a],i)=>{
        matrix.position.set(x,y,z); matrix.scale.set(w,h,d); matrix.rotation.y=a; matrix.updateMatrix();
        mesh.setMatrixAt(i,matrix.matrix); mesh.setColorAt(i,color.setHex(c));
      });
      city.add(mesh);
    });
    /* A malha continua em 3x3: as ruas seguem para fora do enquadramento sem pesar a cena. */
    for (let ox = -1; ox <= 1; ox++) {
      for (let oz = -1; oz <= 1; oz++) {
        if (!ox && !oz) continue;
        const copy = city.clone(true);
        copy.position.set(ox * 13.2, 0, oz * 13.2);
        scene.add(copy);
      }
    }
    function route(points, tint) {
      const curve = new T.CurvePath();
      points.slice(1).forEach((p,i)=>{
        const a=points[i];
        curve.add(new T.LineCurve3(new T.Vector3(a[0],.042,a[1]),new T.Vector3(p[0],.042,p[1])));
      });
      const material = new T.MeshBasicMaterial({color:tint,transparent:true,depthWrite:false});
      scene.add(new T.Mesh(new T.TubeGeometry(curve,180,.05,6,false),material));
      return {curve, material};
    }
    const safe=route([[.32,6.6],[.32,3.0],[-3.0,3.0],[-3.0,-3.0],[.32,-3.0],[.32,-6.6]],0x55e0ff);
    const fast=route([[.32,6.6],[.32,-6.6]],0xffbe76); fast.material.opacity=.11;
    const marker=new T.Mesh(new T.OctahedronGeometry(.12,0),new T.MeshBasicMaterial({color:0xffffff}));
    marker.scale.y=1.5;
    scene.add(marker);
    const off = new T.Color(0x7b795f), on = new T.Color(0xffe7ac);
    return {safe,fast,marker,animate(progress) {
      traffic.forEach(({group,z,direction})=>{group.position.z=z+progress*3.4*direction;});
      canopies.forEach((tree,i)=>{tree.rotation.z=Math.sin(progress*18+i*.9)*.075;});
      streetlights.forEach((bulb,i)=>{bulb.material.color.copy(off).lerp(on,T.MathUtils.smoothstep(progress,.46+i*.038,.65+i*.038));});
    }};
  };
})();
