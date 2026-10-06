import type { UserPattern } from "./patternEditing.ts";
export interface PatternRepository {
  list(): UserPattern[];
  save(pattern: UserPattern): void;
  remove(id: string): void;
}
