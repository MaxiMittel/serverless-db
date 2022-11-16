import { join } from "./join";

export const joinThread = async (
  leftTable: any[],
  rightTable: any[],
  leftKey: { table: string; column: string },
  rightKey: { table: string; column: string },
  keyLookupTable: any,
  type?: "LEFT JOIN" | "RIGHT JOIN" | "INNER JOIN" | "FULL JOIN"
): Promise<any[]> => {
  return join(leftTable, rightTable, leftKey, rightKey, keyLookupTable, type);
};
