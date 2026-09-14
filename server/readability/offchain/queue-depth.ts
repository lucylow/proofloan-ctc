export class QueueDepth{private depth=0;inc(n=1){this.depth+=n}dec(n=1){this.depth=Math.max(0,this.depth-n)}value(){return this.depth}}
