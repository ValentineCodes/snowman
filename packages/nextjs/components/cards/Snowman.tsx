import React from 'react'

import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
} from '@chakra-ui/react'

import SVG from 'react-inlinesvg';
import { EllipsisHorizontalIcon } from '@heroicons/react/24/outline'

type Props = {name: string, description: string, image: string}

const Snowman = ({name, description, image}: Props) => {
  return (
    <div className='max-w-[20rem] rounded-lg bg-white border border-gray-300 p-2'>
        <SVG src={image} />
        <div className='flex items-center justify-between gap-5 p-2 text-black'>
            <h1 className='font-bold text-lg'>{name}</h1>
            <Menu>
              <MenuButton
                as={IconButton}
                aria-label='Options'
                icon={<EllipsisHorizontalIcon className='w-8 font-bold bg-white rounded-md p-1 border border-gray-300 cursor-pointer transition duration-300 hover:border-orange-500 hover:text-white hover:bg-orange-500' /> }
                variant='outline'
              />
              <MenuList>
                <MenuItem>
                  Add Accessories
                </MenuItem>
                <MenuItem>
                  Remove Accessories
                </MenuItem>
                <MenuItem>
                  Transfer
                </MenuItem>
              </MenuList>
            </Menu>
        </div>
    </div>
  )
}

export default Snowman