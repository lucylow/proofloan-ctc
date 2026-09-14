export class Watermark{private block=0;advance(next:number){if(next<this.block)throw new Error("watermark regression");this.block=next;return this.block}value(){return this.block}}
