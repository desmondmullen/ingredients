import React from 'react'
import '../../index.css'

// The ...props means, spread all of the passed props onto this element
// That way we don't have to define them all individually
function BtnExample (props) {
  return (
    <span className='btn-example' { ...props } role='button' tabIndex='0'>
      Example
    </span>
  )
}

export default BtnExample
