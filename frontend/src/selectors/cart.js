import { createSelector } from 'reselect';

const selectedProducts = state => state.order && state.order.selectedProducts || [];
let totalCost = 0;
const itemsInCart = createSelector(
    selectedProducts,
    (product) => product["items"]
      .reduce((product1, product2) => product1.concat(product2), []) || []
  )
  const cost = createSelector(
    itemsInCart,
    (product) => {
        const productTotalPrice =
          product.customisations.reduce(
            (customisation1, customisation2) =>
              customisation1 + customisation2.price,
            0
          ) + product.price;
        if (product.quantity > 1)
          totalCost = totalCost + productTotalPrice * product.quantity;
        else {
          totalCost = totalCost + productTotalPrice;
        }
    }
  )
  export const cartOutput = createSelector(
    itemsInCart,
    cost,
    (items, cost) => ({ items , cost })
  )