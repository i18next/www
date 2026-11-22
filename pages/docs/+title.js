// "Trans Component | react-i18next documentation"; a section's start page that bears the section's name
// ("next-i18next") says "i18next documentation"; a section whose name is not one of ours ("Astro") says
// "i18next in Astro".
export default ({ data }) => {
  const s = data.section.title
  if (!s.includes('i18next')) return `${data.title} | i18next in ${s}`
  return `${data.title} | ${data.title === s ? 'i18next' : s} documentation`
}
