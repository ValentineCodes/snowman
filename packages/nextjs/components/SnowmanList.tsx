import React, {useState, useEffect} from 'react'

import Snowman from './cards/Snowman'

type Props = {balance: number}

const SnowmanList = ({balance}: Props) => {
    const [snowmen, setSnowmen] = useState(null)

    useEffect(() => { 
        // loop through balance to retrieve token ids
        // get token uris 
        // decode token uris
        // decode image
        // setSnowmen
    }, [balance])

  return (
    <div className="flex flex-wrap justify-center items-center gap-5 my-10">
    {[1,2,3].map(i => <Snowman />)}
   </div>
  )
}

export default SnowmanList