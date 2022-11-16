export const getValue = (keyLookupTable: any, item: any, key: any) => {
  switch (key.type) {
    case "column_ref":
      if (key.table) {
        return item[keyLookupTable[`${key.table}.${key.column}`]];
      }
      return item[keyLookupTable[key.column]];
    case "number":
      return parseInt(key.value);
    case "string":
    case "single_quote_string":
      return key.value;
    default:
      break;
  }
};
