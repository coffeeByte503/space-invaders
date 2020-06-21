class Loader {
    constructor(mapURL) {
        this.mapURL=mapURL;
        this.loaded=new Map();
    }
    get() {
        if(arguments.length==1) return this.loaded.get(arguments[0]);
        const arr=[];
        for(let i=0;i<arguments.length;i++) {
          arr.push(this.loaded.get(arguments[i]));
        }
        return arr;
    }
    load() {
        const names=[];
        const loads=[];
        for(let name in this.mapURL) {
            names.push(name);
            const url=this.mapURL[name];
            url.match(/(\.ogg|\.mp3)/)?loads.push(Loader.loadAudio(url)):loads.push(Loader.loadImage(url));
        }
        this.mapURL={};
        return Promise.all(loads).then(objects=> {
            for(let i=0;i<names.length;i++) {
                this.loaded.set(names[i],objects[i]);
            }
        });
    }
    static loadImage(url) {
        return new Promise(resolve=> {
            const image=new Image();
            image.src=url;
            image.onload=function() {
                resolve(image);
            }
        });
    }
    static loadAudio(url) {
        return new Promise(resolve=> {
            const audio=new Audio();
            audio.src=url;
            audio.oncanplay=function() {
                resolve(audio);
            }
        });
    }
    static async loadFonts(names) {
      const toLoad=[];
      names.forEach(name=> {
        toLoad.push(document.fonts.load(`1em ${name}`));
      });
      await Promise.all(toLoad);
    }
}
