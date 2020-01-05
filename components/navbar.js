import React from 'react'
import Link from 'next/link'

export default () => (
  <nav className='nav' disabled={props.disabled}>
    <ul>
      <li>
        <Link href='/'>
          <a>
            Home
          </a>
        </Link>
      </li>
      <li>
        <Link href='/dogs'>
          <a>
            Dogs
          </a>
        </Link>
      </li>
      <li>
          <a href='/breed/shepherd' >
            Only Shepherds
          </a>
      </li>
    </ul>
  </nav>
)
