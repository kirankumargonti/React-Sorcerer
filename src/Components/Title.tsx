import {memo} from 'react'

const Title = memo(({name}: {name: string}) => {
  return <h1 className='title'>Demo Editor by {name}</h1>
})

export default Title
