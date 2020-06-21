class Component {
  constructor(ctx,x,y,id,groups=[]) {
    this.id=id;
    this.ctx=ctx;
    this.x=x;
    this.y=y;
    Component.components.push(this);
    groups.forEach(name=> {
      if(Component.groups[name]==undefined) Component.groups[name]=[];
      Component.groups[name].push(this);
    });
  }
  translateAnim(x,y,dur,exp=1) {
    this.anim={
      x0:this.x,
      y0:this.y,
      x1:x,
      y1:y,
      dur:dur,
      exp:exp,
      start:Date.now()
    }
  }
  update(t) {
    if(this.anim!=null) {
      let progress=(t-this.anim.start)/(this.anim.dur/2);
      if(progress<1) {
        this.x=this.anim.x0+(this.anim.x1-this.anim.x0)/2*Math.pow(progress,this.anim.exp);
        this.y=this.anim.y0+(this.anim.y1-this.anim.y0)/2*Math.pow(progress,this.anim.exp);
      } else if(progress<2) {
        progress-=2;
        this.x=this.anim.x0+(this.anim.x1-this.anim.x0)/2*(Math.pow(progress,this.anim.exp)+2);
        this.y=this.anim.y0+(this.anim.y1-this.anim.y0)/2*(Math.pow(progress,this.anim.exp)+2);
      } else {
        this.x=this.anim.x1;
        this.y=this.anim.y1;
        this.anim=null;
      }
    }
  }
  static components=[];
  static groups={};
  static getById(arg) {
    return Component.components.find(item=>item.id==arg);
  }
  static getByGroup(arg) {
    return Component.groups[arg];
  }
}

class Text extends Component {
  constructor(ctx,content,x,y,styles,id,groups=[]) {
    super(ctx,x,y,id,groups);
    this.content=content;
    this.styles=styles;
    this.font=`${this.styles["font-style"]||"normal"} ${this.styles["font-size"]||"12px"} ${this.styles["font-family"]||"Arial"}`;
  }
  getDimensions() {
    if(this.styles["padding"]==undefined) this.styles.padding=[5,5];
    this.ctx.font=this.font;
    this.w=this.ctx.measureText(this.content).width+2*this.styles["padding"][1];
    this.h=Number(this.font.split(" ")[1].slice(0,-2))+this.styles["padding"][0];
  }
  drawText() {
    this.ctx.beginPath();
    this.ctx.font=this.font;
    this.ctx.fillStyle=this.styles["color"]||"black";
    this.ctx.textAlign="center";
    this.ctx.textBaseline="middle";
    this.ctx.fillText(this.content,this.x,this.y);
  }
  draw() {
    this.drawText();
  }
}

class Button extends Text {
  constructor(ctx,content,x,y,styles,id,groups=[]) {
    super(ctx,content,x,y,styles,id,groups);
    this.onhover=false;
    this.onclick=function(){};
    this.getDimensions();
    Button.buttons.push(this);
  }
  draw() {
    this.ctx.beginPath();
    this.ctx.fillStyle=this.styles["background"]||"white";
    this.ctx.strokeStyle=this.styles["border-color"]||"black";
    this.ctx.lineWidth=this.styles["border-size"]||"1";
    this.ctx.rect(this.x-this.w/2,this.y-this.h/2,this.w,this.h);
    this.ctx.fill();
    this.ctx.stroke();
    this.drawText();
    if(this.onhover) {
      this.ctx.beginPath();
      this.ctx.fillStyle="rgba(0,0,0,.5)";
      this.ctx.fillRect(this.x-this.w/2,this.y-this.h/2,this.w,this.h);
    }
  }
  setDimensions(w,h) {
    this.w=w;
    this.h=h;
  }
  isMouseOver(x,y) {
    return Math.abs(this.x-x)<=this.w/2&&Math.abs(this.y-y)<=this.h/2?true:false;
  }
  static buttons=[];
}

class Picture extends Component {
  constructor(ctx,img,x,y,w,h,origin,id,groups=[]) {
    super(ctx,x,y,id,groups);
    this.img=img;
    this.w=w;
    this.h=h=="auto"?img.height*w/img.width:h;
    switch(origin) {
      case "center":
        this.origin=[this.w/2,this.h/2];
        break;
      case "top":
        this.origin=[this.w/2,0];
        break;
      default:
        this.origin=[0,0];
    }
  }
  draw() {
    this.ctx.beginPath();
    this.ctx.drawImage(this.img,this.x-this.origin[0],this.y-this.origin[1],this.w,this.h);
  }
}
