// The YouTube Data API's category browsing (videoCategories.list) only
// returns category labels, not a way to list videos by category directly,
// and results vary by region. A curated search query per sidebar item is
// more reliable and keeps results on-topic across regions.

export const categories = [
  { id: 'all', label: 'Full Archive', query: 'documentary educational' },
  { id: 'science', label: 'Science & Nature', query: 'science nature documentary' },
  { id: 'history', label: 'History', query: 'history documentary' },
  { id: 'technology', label: 'Technology', query: 'technology engineering explained' },
  { id: 'art', label: 'Art & Design', query: 'art design documentary' },
  { id: 'space', label: 'Space', query: 'space astronomy documentary' },
]

export function getCategory(categoryId) {
  return categories.find((c) => c.id === categoryId) || categories[0]
}
