
export default function (state) {
  const { document, selection } = state
  const texts = document.getTexts()
  const first = texts.first()
  const range = selection.merge({
    anchorKey: first.key,
    anchorOffset: first.length - 1,
    focusKey: first.key,
    focusOffset: first.length - 1
  })

  return state
    .transform()
    .deleteForwardAtRange(range)
    .apply()
}
