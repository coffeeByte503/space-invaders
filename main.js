const w0=500,h0=700;

const enemyList={
  types:{
    "outlaw":{
      spritesheet:["outlaw_red1","outlaw_red2","outlaw_red3"],
      w:64,
      h:64,
      anims:{"move":[0,1,2,1]},
      hp:100,
      speed:60
    },
    "roamer":{
      spritesheet:["roamer_torquoise1","roamer_torquoise2","roamer_torquoise3"],
      w:64,
      h:64,
      anims:{"move":[0,1,2,1]},
      hp:100,
      speed:60
    },
  },
  configs:{
    "straightMiddle":{
      x:w0/2,
      y:-100,
      actions:[["play",["move",10]],["straight",[w0/2,h0+100]],["clear"]]
    },
    "straightLeft":{
      x:w0/4,
      y:-100,
      actions:[["play",["move",10]],["straight",[w0/4,h0+100]],["clear"]]
    },
    "straightRight":{
      x:w0/4*3,
      y:-100,
      actions:[["play",["move",10]],["straight",[w0/4*3,h0+100]],["clear"]]
    },
  }
};

const level1=[
  [2000],
  [0,"outlaw","straightLeft",1],
  [0,"outlaw","straightMiddle",1],
  [0,"outlaw","straightRight",1],
  [2000],
  [1000,"outlaw","straightMiddle",5],
  [2000],
  [1000,"roamer","straightLeft",5],
  [2000],
  [1000,"outlaw","straightMiddle",5],
  [2000],
  [1000,"roamer","straightRight",5],
  [2000]
];

let c,ctx,w,h,offset=[0,0],zoom;

let loader;
let last;

let enemies=[];

let level;

const mouse={
  clicked:false,
  x0:0,
  y0:0,
  x1:0,
  y1:0
};

main();

async function main() {
  loader=new Loader({
    "desert":"assets/images/desert.jpg",
    "outlaw_red1":"assets/images/outlaw_red1.png",
    "outlaw_red2":"assets/images/outlaw_red2.png",
    "outlaw_red3":"assets/images/outlaw_red3.png",
    "roamer_torquoise1":"assets/images/roamer_torquoise1.png",
    "roamer_torquoise2":"assets/images/roamer_torquoise2.png",
    "roamer_torquoise3":"assets/images/roamer_torquoise3.png",
  });
  await loader.load();

  await Loader.loadFonts({
    "Invasion":"assets/fonts/INVASION2000.TTF",
    "Arcade":"assets/fonts/ARCADECLASSIC.TTF"
  });


  [c,ctx,w,h]=createCanvas();
  [w,h,offset]=fitScreen(c,w0/h0);
  zoom=w/w0;

  addEventListener("resize",()=> {
    [w,h,offset]=fitScreen(c,w0/h0);
    zoom=w/w0;
  });

  addEventListener("ontouchstart" in document?"touchstart":"mousemove",e=> {
    if(e.changedTouches) e=e.changedTouches[0];
    let [x,y]=[(e.pageX-offset[0])/zoom,(e.pageY-offset[1])/zoom];
    for(let button of Button.buttons) button.onhover=button.isMouseOver(x,y);
  });
  addEventListener("click",e=> {
    if(e.changedTouches) e=e.changedTouches[0];
    let [x,y]=[(e.pageX-offset[0])/zoom,(e.pageY-offset[1])/zoom];
    for(let button of Button.buttons) if(button.isMouseOver(x,y)) button.onclick();
  });

  addEventListener("ontouchstart" in document?"touchstart":"mousedown",e=> {
    if(e.changedTouches) e=e.changedTouches[0];
    let [x,y]=[(e.pageX-offset[0])/zoom,(e.pageY-offset[1])/zoom];
    mouse.clicked=true;
    mouse.x0=x;
    mouse.y0=y;
  });
  addEventListener("ontouchstart" in document?"touchmove":"mousemove",e=> {
    if(e.changedTouches) e=e.changedTouches[0];
    let [x,y]=[(e.pageX-offset[0])/zoom,(e.pageY-offset[1])/zoom];
    if(mouse.clicked) {
      mouse.x1=x;
      mouse.y1=y;
      mouse.x0=mouse.x1;
      mouse.y0=mouse.y1;
    }
  });
  addEventListener("ontouchstart" in document?"touchend":"mouseup",e=> {
    if(e.changedTouches) e=e.changedTouches[0];
    mouse.clicked=false;
    mouse.x0=mouse.x1;
    mouse.y0=mouse.y1;
  });

  new Picture(ctx,loader.get("desert"),0,0,w0,"auto","topleft","bg",groups=[]);

  /*new Text(ctx,"Space Invaders",w0/2,100,styles={"font-size":"48px","font-family":"Arcade","color":"orange"},"title",groups=[]);

  new Button(ctx,"Play",w0/2,200,styles={"font-size":"26px","font-family":"Invasion"},"play",groups=["menu"]);
  Component.getById("play").onclick=function() {
    Component.getByGroup("level").forEach(item=> {
      item.translateTo(item.x-w0,item.y,500,3);
    });
    Component.getByGroup("menu").forEach(item=> {
      item.translateTo(item.x-w0,item.y,500,3);
    });
  }
  new Button(ctx,"Setting",w0/2,260,styles={"font-size":"26px","font-family":"Invasion"},"setting",groups=["menu"]);
  new Button(ctx,"Exit",w0/2,320,styles={"font-size":"26px","font-family":"Invasion"},"exit",groups=["menu"]);
  Component.getByGroup("menu").forEach(item=> {
    item.w=140;
  });

  new Text(ctx,"Select Level",w0/2,180,styles={"font-size":"28px","font-family":"Invasion","color":"white"},"label",groups=["level"]);
  for(let i=0;i<3;i++) {
    for(let j=0;j<4;j++) {
      let btn=new Button(ctx,(i+1)*(j+1),w0/2+(j-1.5)*60,260+i*60,styles={"font-size":"26px","font-family":"Arcade","padding":[10,10]},"play",groups=["level"]);
      btn.w=btn.h;
    }
  }
  new Button(ctx,"Back",w0/2,440,styles={"font-size":"26px","font-family":"Invasion"},"tomenu",groups=["level"]);
  Component.getById("tomenu").onclick=function() {
    Component.getByGroup("level").forEach(item=> {
      item.translateTo(item.x+w0,item.y,500,3);
    });
    Component.getByGroup("menu").forEach(item=> {
      item.translateTo(item.x+w0,item.y,500,3);
    });
  }
  Component.getByGroup("level").forEach(item=> {
    item.x+=w0;
  });*/

  level=new Level(ctx,loader,enemyList,level1);

  frame();

}

function frame() {
  const current=Date.now();
  if(last==undefined) last=current;
  const dt=Math.min(current-last,30);
  last=current;

  ctx.clearRect(0,0,w,h);
  ctx.save();
  ctx.scale(zoom,zoom);

  Component.components.forEach(item=> {item.update(dt)});
  level.update(dt);

  ctx.restore();
  requestAnimationFrame(frame);
}

/*async function createLevel(enemyMap) {
  for(let x of enemyMap) {
    if(x.length>1) {
      for(let i=0;i<x[3];i++) {
        addEnemy(enemyList.types[x[0]],enemyList.configs[x[1]]);
        await sleep(x[2]);
      }
    } else {
      await sleep(x[0]);
    }
  }
}

function addEnemy(type,config) {
  enemies.push(new Enemy(ctx,loader.get(type.spritesheet),config.x,config.y,type.w,type.h,type.anims,type,config));
}

function sleep(dur) {
  return new Promise(resolve=> {
    setTimeout(()=> {
      resolve(dur);
    },dur);
  });
}*/
