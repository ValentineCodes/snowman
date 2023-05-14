import React, {useState} from 'react'

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
  Spinner
} from '@chakra-ui/react'

import SVG from 'react-inlinesvg';
import { EllipsisHorizontalIcon } from '@heroicons/react/24/outline'
import { InputBase, AddressInput } from '../scaffold-eth';
import { useAccount, useSigner } from 'wagmi';
import { useDeployedContractInfo, useScaffoldContractWrite } from '~~/hooks/scaffold-eth';
import { ethers } from 'ethers';
import { notification } from '~~/utils/scaffold-eth';

type Props = {id: number, contractName: string, name: string, description: string, image: string, remove: () => void}

const Accessory = ({id, contractName, name, description, image, remove}: Props) => {
  const { isOpen: isAddToSnowmanModalOpen, onOpen: onOpenAddToSnowman, onClose: onCloseAddToSnowman } = useDisclosure()
  const { isOpen: isTransferModalOpen, onOpen: onOpenTransferModal, onClose: onCloseTransferModal} = useDisclosure()

  const [snowmanId, setSnowmanId] = useState<number>()
  const [recipient, setRecipient] = useState("")
  const [isTransferring, setIsTransferring] = useState(false)
  const [isComposing, setIsComposing] = useState(false)

  const {data: signer, isLoading: isLoadingSigner} = useSigner()

  const {address: connectedAccount, isConnected} = useAccount()
  const {data: snowmanContract, isLoading: isLoadingSnowmanContract} = useDeployedContractInfo("Snowman")
  const {data: accessoryContract, isLoading: isLoadingAccessoryContract} = useDeployedContractInfo(contractName)

  const addToSnowman = async () => {
    if(isComposing || !isConnected || isLoadingAccessoryContract || isLoadingSnowmanContract || isLoadingSigner) return

    try {
      setIsComposing(true)
      const accessory = new ethers.Contract(accessoryContract.address, accessoryContract.abi, signer)

      const tx = await accessory["safeTransferFrom(address,address,uint256,bytes)"](connectedAccount, snowmanContract?.address, id, ethers.utils.defaultAbiCoder.encode(["uint256"], [(snowmanId || 0)]), {
        gasLimit: 500000
      })
      await tx.wait(1)

      onCloseAddToSnowman()
      remove()
    } catch(error) {
      console.log(error)
      notification.error(JSON.stringify(error))
    }

    setIsComposing(false)
  }

  const transfer = async () => {
    if(isTransferring || !isConnected || isLoadingAccessoryContract || isLoadingSigner) return

    try {
      setIsTransferring(true)
      const accessory = new ethers.Contract(accessoryContract.address, accessoryContract.abi, signer)

      const tx = await accessory["safeTransferFrom(address,address,uint256)"](connectedAccount, recipient, id, {
        gasLimit: 500000
      })
      await tx.wait(1)

      onCloseTransferModal()
      remove()
    } catch(error) {
      console.log(error)
      notification.error(JSON.stringify(error))
    }

    setIsTransferring(false)
  }

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
                <MenuItem onClick={onOpenAddToSnowman}>
                  Add to Snowman☃️
                </MenuItem>
                <MenuItem onClick={onOpenTransferModal}>
                  Transfer
                </MenuItem>
              </MenuList>
            </Menu>
        </div>

        <Modal isOpen={isAddToSnowmanModalOpen} onClose={onCloseAddToSnowman}>
          <ModalOverlay />
          <ModalContent>
            <ModalCloseButton className='text-white bg-orange-500 p-2 rounded-full' />
            <ModalBody className='mt-10 space-y-2 flex flex-col items-center'>
            <InputBase
              name="snowmanId"
              value={snowmanId || ""}
              placeholder="Snowman id"
              onChange={value => setSnowmanId(Number(value))}
            />
            <Button className='border-orange-500 bg-orange-500 hover:border-black hover:bg-white hover:text-black transition-all px-4 py-2 text-white rounded-md shadow-lg' onClick={addToSnowman} disabled={isComposing}>{isComposing? <Spinner size="md" thickness='4px' speed='0.65s' />: "Add"}</Button>
            </ModalBody>
          </ModalContent>
        </Modal>

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

export default Accessory