import catalog from './catalog.json'

export const products = catalog
export const productsById = new Map(products.map((product) => [product.id, product]))
export const optionsById = new Map(products.flatMap((product) =>
  product.options.map((option) => [option.id, { product, option }])
))

