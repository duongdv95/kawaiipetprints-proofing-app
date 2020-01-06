import Head from 'next/head'

function Header(props) {
  var { title, description } = props.meta
  return (
    <div>
      <Head>
        <title>{ title || 'Next.js Test Title' }</title>
        <link href="/static/styles.css" rel="stylesheet" />
        <link rel="stylesheet" type="text/css" charSet="UTF-8" href="https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.6.0/slick.min.css" />
        <link rel="stylesheet" type="text/css" href="https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.6.0/slick-theme.min.css" />
        <meta name='description' content={description || 'Next.js Test Description'} />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <meta charSet='utf-8' />
      </Head>
    </div>
  )
}

export default Header