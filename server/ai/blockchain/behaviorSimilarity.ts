export function cosineSimilarity(a:number[],b:number[]):number{
 const n=Math.min(a.length,b.length); let dot=0,aa=0,bb=0;
 for(let i=0;i<n;i++){dot+=a[i]*b[i];aa+=a[i]*a[i];bb+=b[i]*b[i];}
 return aa&&bb?dot/(Math.sqrt(aa)*Math.sqrt(bb)):0;
}
