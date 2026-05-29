"use client";

type ClassNameFactory = (...args: any[]) => string;

type ClassNameFactoryOptions = {
  separator?: string;
  prefix?: string;
};

export default function getClassNameFactory(
  name: string,
  styles?: Record<string, string>,
  options?: ClassNameFactoryOptions
): ClassNameFactory {
  const { separator = "-" } = options || {};
  
  return (...args: any[]) => {
    // Handle no arguments (get base class name)
    if (args.length === 0) {
      return name;
    }
    
    // Handle single string argument (additional class name)
    if (args.length === 1 && typeof args[0] === "string") {
      if (styles && styles[args[0]]) {
        return styles[args[0]]!;
      }
      return `${name}${separator}${args[0]}`;
    }
    
    // Handle object argument (modifiers)
    if (args.length === 1 && typeof args[0] === "object" && args[0] !== null) {
      const modifiers = args[0];
      const classes: string[] = [name];
      
      for (const [key, value] of Object.entries(modifiers)) {
        if (value === true) {
          if (styles && styles[key]) {
            classes.push(styles[key]);
          } else {
            classes.push(`${name}${separator}${key}`);
          }
        } else if (value && typeof value === "string") {
          if (styles && styles[key]) {
            classes.push(styles[key]);
          } else {
            classes.push(`${name}${separator}${key}`);
          }
          classes.push(value);
        }
      }
      
      return classes.join(" ");
    }
    
    // Handle multiple arguments
    const classes: string[] = [name];
    
    for (const arg of args) {
      if (typeof arg === "string") {
        if (styles && styles[arg]) {
          classes.push(styles[arg]);
        } else {
          classes.push(`${name}${separator}${arg}`);
        }
      } else if (typeof arg === "object" && arg !== null) {
        for (const [key, value] of Object.entries(arg)) {
          if (value === true) {
            if (styles && styles[key]) {
              classes.push(styles[key]);
            } else {
              classes.push(`${name}${separator}${key}`);
            }
          }
        }
      }
    }
    
    return classes.join(" ");
  };
}
