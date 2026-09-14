export class Throughput{private done=0;private started=Date.now();markComplete(n=1){this.done+=n}perSecond(){const seconds=Math.max(1,(Date.now()-this.started)/1000);return this.done/seconds}}
