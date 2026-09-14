import type { Logger } from "./types";
export const consoleLogger:Logger={debug:(m,meta)=>console.debug(`[readability] ${m}`,meta??""),info:(m,meta)=>console.info(`[readability] ${m}`,meta??""),warn:(m,meta)=>console.warn(`[readability] ${m}`,meta??""),error:(m,meta)=>console.error(`[readability] ${m}`,meta??"")};
