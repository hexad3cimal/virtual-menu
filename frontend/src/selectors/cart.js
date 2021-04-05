import { createSelector } from 'reselect';

const selectedProducts = state => state.order && state.order.selectedProducts || [];
let totalCost = 0;
const itemsInCart = createSelector(
    selectedProducts,
    products => (products.map(product => {
      return product["items"] && product["items"]
      .reduce((product1, product2) => product1.concat(product2), [])
}
  ).reduce((product1, product2) => product1.concat(product2), [])))

  const cost = createSelector(
    itemsInCart,
    items => items.map(product=>{
      totalCost =0;
        const productTotalPrice =
        product && product.customisations && product.customisations.reduce(
            (customisation1, customisation2) =>
              customisation1 + customisation2.price,
            0
          ) + product.price;
        if (product.quantity > 1)
          totalCost = totalCost + productTotalPrice * product.quantity;
        else {
          totalCost = totalCost + productTotalPrice;
        }
       return totalCost
      }
  ))
  export const cartOutput = createSelector(
    itemsInCart,
    cost,
    (items, cost) => ({ orderedProducts : items || [] , totalCost : cost.reduce(
      (price1, price2) =>
      price1 + price2,
      0
    )  || 0 })
  )