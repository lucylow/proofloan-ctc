export class DrainController{private draining=false;begin(){this.draining=true}isDraining(){return this.draining}allowNewJobs(){return!this.draining}allowCompletion(){return true}}
