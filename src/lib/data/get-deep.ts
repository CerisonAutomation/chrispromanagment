"use client";

type PathPart = string | number;

export function getDeep(obj: any, path: string | PathPart[]): any {
  if (!obj || !path) return undefined;
  
  const parts = typeof path === "string" ? path.split(".") : path;
  
  let current = obj;
  
  for (const part of parts) {
    if (current === null || current === undefined) {
      return undefined;
    }
    current = current[part];
  }
  
  return current;
}

export function setDeep(obj: any, path: string | PathPart[], value: any): any {
  if (!path) return obj;
  
  const parts = typeof path === "string" ? path.split(".") : path;
  
  if (parts.length === 0) return value;
  
  const result = Array.isArray(obj) ? [...obj] : { ...obj };
  let current = result;
  
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    const nextPart = parts[i + 1];
    
    if (current[part] === undefined) {
      current[part] = typeof nextPart === "number" ? [] : {};
    } else {
      current[part] = Array.isArray(current[part]) 
        ? [...current[part]] 
        : { ...current[part] };
    }
    
    current = current[part];
  }
  
  const lastPart = parts[parts.length - 1];
  current[lastPart] = value;
  
  return result;
}
