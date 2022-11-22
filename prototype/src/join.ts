import { getValue } from "./helpers";

export const join = (options: any) => {
  const { leftTable, rightTable, leftKey, rightKey, keyLookupTable, type } =
    options;
  const newItems = [];

  if (type) {
    if (type === "LEFT JOIN") {
      for (const leftItem of leftTable) {
        let found = false;
        for (const rightItem of rightTable) {
          const combined = { ...leftItem, ...rightItem };
          const leftValue = getValue(keyLookupTable, combined, leftKey);
          const rightValue = getValue(keyLookupTable, combined, rightKey);

          if (leftValue === rightValue) {
            newItems.push(combined);
            found = true;
          }
        }

        if (!found) {
          newItems.push(leftItem);
        }
      }
    } else if (type === "INNER JOIN") {
      for (const leftItem of leftTable) {
        for (const rightItem of rightTable) {
          const combined = { ...leftItem, ...rightItem };
          const leftValue = getValue(keyLookupTable, combined, leftKey);
          const rightValue = getValue(keyLookupTable, combined, rightKey);

          if (leftValue === rightValue) {
            newItems.push(combined);
          }
        }
      }
    } else if (type === "RIGHT JOIN") {
      for (const rightItem of rightTable) {
        let found = false;
        for (const leftItem of leftTable) {
          const combined = { ...leftItem, ...rightItem };
          const leftValue = getValue(keyLookupTable, combined, leftKey);
          const rightValue = getValue(keyLookupTable, combined, rightKey);

          if (leftValue === rightValue) {
            newItems.push(combined);
            found = true;
          }
        }

        if (!found) {
          newItems.push(rightItem);
        }
      }
    } else if (type === "FULL JOIN") {
      for (const leftItem of leftTable) {
        let found = false;
        for (const rightItem of rightTable) {
          const combined = { ...leftItem, ...rightItem };
          const leftValue = getValue(keyLookupTable, combined, leftKey);
          const rightValue = getValue(keyLookupTable, combined, rightKey);

          if (leftValue === rightValue) {
            newItems.push(combined);
            found = true;
            break;
          }
        }

        if (!found) {
          newItems.push(leftItem);
        }
      }

      for (const rightItem of rightTable) {
        let found = false;
        for (const leftItem of leftTable) {
          const combined = { ...leftItem, ...rightItem };
          const leftValue = getValue(keyLookupTable, combined, leftKey);
          const rightValue = getValue(keyLookupTable, combined, rightKey);

          if (leftValue === rightValue) {
            found = true;
          }
        }

        if (!found) {
          newItems.push(rightItem);
        }
      }
    }
  } else {
    // Cross join
    for (const leftItem of leftTable) {
      for (const rightItem of rightTable) {
        newItems.push({ ...leftItem, ...rightItem });
      }
    }
  }

  return newItems;
};
