class Sprite {
  constructor(ctx,spritesheet,x,y,w,h,anims={}) {
    this.ctx=ctx;
    this.spritesheet=spritesheet;
    this.x=x;
    this.y=y;
    this.w=w;
    this.h=h;
    this.angle=0;
    this.anim=null;
    this.animList=anims;
  }
  createAnim(name,numbers) {
    this.animList[name]=numbers;
  }
  playAnim(name,rate,repeat=true) {
    this.anim={
      frames:this.animList[name],
      current:0,
      counter:0,
      rate:rate,
      repeat:repeat
    }
  }
  updateAnim() {
    if(this.anim==undefined) return;
    if((this.anim.counter+=1)>=this.anim.rate) {
      this.anim.counter=0;
      if((this.anim.current+=1)>=this.anim.frames.length) {
        this.anim.repeat?this.anim.current=0:this.anim=null;
      }
    }
  }
  draw() {
    this.updateAnim();
    if(this.anim==undefined) return;
    this.ctx.save();
    this.ctx.translate(this.x,this.y);
    this.ctx.rotate(this.angle);
    this.ctx.beginPath();
    this.ctx.drawImage(this.spritesheet[this.anim.frames[this.anim.current]],-this.w/2,-this.h/2,this.w,this.h);
    this.ctx.restore();
  }
}

class Solid extends Sprite {
  constructor(ctx,spritesheet,x,y,w,h,anims={}) {
    super(ctx,spritesheet,x,y,w,h,anims);
    this.vx=0;
    this.vy=0;
  }
  isColliding(another) {
    return Math.abs(this.x-another.x)<(this.w+another.w)/2&&Math.abs(this.y-another.y)<(this.h+another.h)/2?true:false;
  }
  update(dt) {
    this.x+=this.vx*dt;
    this.y+=this.vy*dt;
  }
}

class Enemy extends Solid {
  constructor(ctx,spritesheet,x,y,w,h,anims,type,config) {
    super(ctx,spritesheet,x,y,w,h,anims);
    this.actions=config.actions;
    this.idx=0;
    this.action=null;
    this.hp=type.hp;
    this.stats={
      hp:type.hp,
      speed:type.speed,
      guns:[] // [x,y,sprite,dmg,rate,type,number=1]
    };
    this.startAction();
  }
  update(dt) {
    if(this.action!=null) {
      let step=1;
      if(this.action.counter!=undefined) {
        this.action.counter+=dt;
        step=this.action.counter/this.action.dur;
      }
      switch (this.action.type) {
        case "straight":
          this.x=this.action.x0+(this.action.x1-this.action.x0)*step;
          this.y=this.action.y0+(this.action.y1-this.action.y0)*step;
          break;
        case "curved":
          this.x=this.action.cx+this.action.cr*Math.cos(this.action.angle0+this.action.rad*step);
          this.y=this.action.cy+this.action.cr*Math.sin(this.action.angle0+this.action.rad*step);
          break;
      }
      if(step>=1) {
        this.startAction();
      }
    }
    this.draw();
  }
  startAction() {
    if(this.idx<this.actions.length) {
      let item=this.actions[this.idx++];
      switch(item[0]) {
        case "straight":
          this.straightTo(...item[1]);
          break;
        case "curved":
          this.curvedTo(...item[1]);
          break;
        case "sleep":
          this.sleep(...item[1]);
          break;
        case "play":
          this.playAnim(...item[1]);
          this.startAction();
          break;
        case "cancel":
          this.anim=null;
          this.startAction();
          break;
        case "goto":
          this.idx=item[1];
          this.startAction();
      }
    } else {
      this.action=null;
    }
  }
  sleep(dur) {
    this.action={
			type:"sleep",
			dur:dur,
			counter:0
    }
  }
  straightTo(x,y) {
    const dur=Math.hypot(this.x-x,this.y-y)/this.stats.speed*1000;
		this.action={
			type:"straight",
			x0:this.x,
			y0:this.y,
			x1:x,
			y1:y,
			dur:dur,
			counter:0
    }
  }
  curvedTo(cx,cy,deg) {
    const rad=deg/180*Math.PI;
    const cr=Math.hypot(this.x-cx,this.y-cy);
		const angle0=Math.atan2(this.y-cy,this.x-cx);
		const dur=Math.abs(rad)*cr/this.stats.speed*1000;
		this.action={
			type:"curved",
			cx:cx,
			cy:cy,
			cr:cr,
			angle0:angle0,
			rad:rad,
			dur:dur,
			counter:0
		};
  }
}

class Level {
    constructor(ctx,loader,list,lvlMap) {
      this.ctx=ctx;
      this.loader=loader;
      this.list=list;
      this.lvl=[];
      this.idx=0;
      this.counter=0;
      this.enemies=[];
      this.init(lvlMap);
    }
    init(lvlMap) {
      lvlMap.forEach(x=> {
        if(x.length==4) {
          for(let i=0;i<x[3];i++) this.lvl.push([x[0],x[1],x[2]]);
        } else {
          this.lvl.push(x);
        }
      });
    }
    update(dt) {
      this.enemies.forEach(enemy=> {enemy.update(dt)});
      const x=this.lvl[this.idx];
      if(x==undefined) return;
      if((this.counter+=dt)>=x[0]) {
        this.counter=0;
        if(x.length==3) {
          this.addEnemy(this.list.types[x[1]],this.list.configs[x[2]]);
        }
        this.idx++;
      }
    }
    addEnemy(type,config) {
      this.enemies.push(new Enemy(this.ctx,this.loader.get(type.spritesheet),config.x,config.y,type.w,type.h,type.anims,type,config));
    }
}
