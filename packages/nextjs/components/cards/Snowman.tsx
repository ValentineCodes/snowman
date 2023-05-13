import React, { useState } from 'react'

import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  useDisclosure,
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalOverlay,
  Spinner,
} from '@chakra-ui/react'

import SVG from 'react-inlinesvg';
import { EllipsisHorizontalIcon } from '@heroicons/react/24/outline'
import { ethers } from 'ethers';
import { useAccount } from 'wagmi';
import { useScaffoldContractWrite } from '~~/hooks/scaffold-eth';
import { AddressInput } from '../scaffold-eth';

type Props = {id: number, name: string, description: string, image: string, removeSnowman: (id: number) => void}

const Snowman = ({id, name, description, image, removeSnowman}: Props) => {
  const { isOpen: isTransferModalOpen, onOpen: onOpenTransferModal, onClose: onCloseTransferModal} = useDisclosure()

  const [recipient, setRecipient] = useState("")

  const {address: connectedAccount, isConnected} = useAccount()

  const {writeAsync: transfer, isLoading: isTransferring, isSuccess: isTransferSuccessful} = useScaffoldContractWrite({
    contractName: "Snowman",
    functionName: "safeTransferFrom",
    args: [connectedAccount, recipient, id],
    overrides: {
      gasLimit: ethers.BigNumber.from("500000"),
    },
    onSuccess: () => {
      onCloseTransferModal()
      removeSnowman(id)
    }
  })
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
                  Remove Accessories
                </MenuItem>
                <MenuItem onClick={onOpenTransferModal}>
                  Transfer
                </MenuItem>
              </MenuList>
            </Menu>
        </div>

        <Modal isOpen={isTransferModalOpen} onClose={onCloseTransferModal}>
          <ModalOverlay />
          <ModalContent>
            <ModalCloseButton className='text-white bg-orange-500 p-2 rounded-full' />
            <ModalBody className='mt-10 space-y-2 flex flex-col items-center'>
            <AddressInput
              name="recipient"
              value={recipient}
              placeholder="Recipient address"
              onChange={setRecipient}
            />
            <Button className='border-orange-500 bg-orange-500 hover:border-black hover:bg-white hover:text-black transition-all px-4 py-2 text-white rounded-md shadow-lg' onClick={transfer} disabled={isTransferring}>{isTransferring? <Spinner size="md" thickness='4px' speed='0.65s' />: "Transfer"}</Button>
            </ModalBody>
          </ModalContent>
        </Modal>
    </div>
  )
}

export default Snowman