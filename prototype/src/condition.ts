import { getValue } from "./helpers";

export const filterAndProject = (options: any) => {
  const { items, keyLookupTable, where, columns } = options;

  let newItems = items;
  if (where) {
    newItems = items.filter((item: any) =>
      filterItem(keyLookupTable, item, where)
    );
  }

  if (columns !== "*") {
    return newItems.map((item: any) =>
      projectItem(keyLookupTable, item, columns)
    );
  }

  return newItems;
};

export const filterItem = (
  keyLookupTable: any,
  item: any,
  filter: any
): any => {
  switch (filter.type) {
    case "binary_expr":
      const leftValue = getValue(keyLookupTable, item, filter.left);
      const rightValue = getValue(keyLookupTable, item, filter.right);

      switch (filter.operator) {
        case "AND":
          return (
            filterItem(keyLookupTable, item, filter.left) &&
            filterItem(keyLookupTable, item, filter.right)
          );
        case "OR":
          return (
            filterItem(keyLookupTable, item, filter.left) ||
            filterItem(keyLookupTable, item, filter.right)
          );
        case "=":
          return leftValue === rightValue;
        case "!=":
          return leftValue !== rightValue;
        case ">":
          return leftValue > rightValue;
        case "<":
          return leftValue < rightValue;
        case ">=":
          return leftValue >= rightValue;
        case "<=":
          return leftValue <= rightValue;
        default:
          return false;
      }
    default:
      return false;
  }
};

export const projectItem = (
  keyLookupTable: any,
  item: any,
  columns: any
): any => {
  let projectedItem: { [key: string]: any } = {};

  for (const column of columns) {
    switch (column.expr.type) {
      case "column_ref":
        if (column.as) {
          projectedItem[column.as] = item[keyLookupTable[column.expr.column]];
        } else {
          projectedItem[column.expr.column] =
            item[keyLookupTable[column.expr.column]];
        }
        break;
      case "number":
        if (column.as) {
          projectedItem[column.as] = parseInt(column.expr.value);
        } else {
          projectedItem[column.expr.value] = parseInt(column.expr.value);
        }
        break;
      case "string":
      case "single_quote_string":
        if (column.as) {
          projectedItem[column.as] = column.expr.value;
        } else {
          projectedItem[column.expr.value] = column.expr.value;
        }
        break;
      default:
        break;
    }
  }
  return projectedItem;
};
