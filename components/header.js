import Head from 'next/head'

function Header(props) {
  var { title, description } = props.meta
  return (
    <div>
      <Head>
        <title>{ title || 'Next.js Test Title' }</title>
        <link href="/static/styles.css" rel="stylesheet" />
        <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.7.2/css/all.css" integrity="sha384-fnmOCqbTlWIlj8LyTjo7mOUStjsKC4pOpQbqyi7RrhN7udi9RwhKkMHpvLbHG9Sr" crossOrigin="anonymous"/>
        <meta name='description' content={description || 'Next.js Test Description'} />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <meta charSet='utf-8' />
      </Head>
    </div>
  )
}

export default Header