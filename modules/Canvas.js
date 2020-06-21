export function createCanvas(parent=document.body,w=300,h=200,offset=[0,0]) {
  const c=document.createElement("canvas");
  c.width=w;
  c.height=h;
  c.style.position="fixed";
  c.style.left=offset[0]+"px";
  c.style.top=offset[1]+"px";
  parent.appendChild(c);
  const ctx=c.getContext("2d");
  return [c,ctx,w,h,offset];
}
export function fitScreen(c,r) {
  let [w,h]=[innerWidth,innerWidth/r];
  if(h>innerHeight) [w,h]=[innerHeight*r,innerHeight];
  c.width=w;
  c.height=h;
  const offset=[(innerWidth-w)/2,(innerHeight-h)/2];
  c.style.left=offset[0]+"px";
  c.style.top=offset[1]+"px";
  return [w,h,offset];
}
