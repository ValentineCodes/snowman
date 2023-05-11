import React from 'react'
import Image from 'next/image'

import { EllipsisHorizontalIcon } from '@heroicons/react/24/outline'

type Props = {}

const Snowman = (props: Props) => {
  return (
    <div className='max-w-[20rem] rounded-lg bg-white border border-gray-300 p-2'>
        <Image src={require("../../../../snowman.svg")} alt="Snowman" className='w-full object-contain' />
        <div className='flex items-center justify-between gap-5 p-2 text-black'>
            <h1 className='font-bold text-lg'>Snowman #1</h1>
            <EllipsisHorizontalIcon className='w-10 font-bold bg-white rounded-md p-1 border border-gray-300 cursor-pointer transition duration-300 hover:border-orange-500 hover:text-white hover:bg-orange-500' />
        </div>
    </div>
  )
}

export default Snowman