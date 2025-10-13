import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
 
/// Used to merge Tailwind CSS class names, required by React Native Reusibles component library
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
