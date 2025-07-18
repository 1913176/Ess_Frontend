export const getItemName = (item) =>
    item?.type === "product" ? item?.item_name : item?.service_name;
  
  export const getItemStockQty = (item) => item?.opening_stock || 0;
  