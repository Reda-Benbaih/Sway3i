export function paginate(items, page, size) {
  const totalPages = Math.max(1, Math.ceil(items.length / size))
  const safePage = Math.min(page, totalPages - 1)
  return {
    pageItems: items.slice(safePage * size, safePage * size + size),
    totalPages,
    page: safePage,
  }
}
