export function normalizeTitle(title:string):string{return title.trim().replace(/\s+/g," ").slice(0,160);} export function normalizeDescription(d:string):string{return d.trim().slice(0,5000);}
