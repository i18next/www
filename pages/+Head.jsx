// The look: G's CSS and script (theme, copy buttons, tabs), plus shell.css for what G has no style for.
export default function Head () {
  return (
    <>
      <link rel='icon' href='/favicon.ico' />
      <link rel='stylesheet' href='/assets/site.css' />
      <link rel='stylesheet' href='/assets/shell.css' />
      <script src='/assets/site.js' />
      <script src='/assets/consent-defaults.js' />
    </>
  )
}
