import React, { useState, useEffect, useRef } from 'react'

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
import { useAccount, useProvider, erc721ABI, useSigner } from 'wagmi';
import { useScaffoldContractWrite, useDeployedContractInfo } from '~~/hooks/scaffold-eth';
import { AddressInput } from '../scaffold-eth';
import { notification } from '~~/utils/scaffold-eth';

type Props = {id: number, remove: () => void}
interface Metadata {
  name: string,
  image: string
}

interface Accessory {
  name: string,
  address: string,
  isWorn: boolean
}

const Snowman = ({id, remove}: Props) => {
  const [metadata, setMetadata] = useState<Metadata>()
  const [accessories, setAccessories] = useState<Accessory>()
  const [recipient, setRecipient] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isRemovingAccessory, setIsRemovingAccessory] = useState<string>()
  const [isRemovingAllAccessories, setIsRemovingAllAccessories] = useState(false)
  const [isTransferring, setIsTransferring] = useState(false)

  const ISnowman = useRef(null)

  const { isOpen: isTransferModalOpen, onOpen: onOpenTransferModal, onClose: onCloseTransferModal} = useDisclosure()
  const {address: connectedAccount, isConnected} = useAccount()
  const provider = useProvider()
  const {data: signer} = useSigner()

  const {data: snowmanContract, isLoading: isLoadingSnowmanContract} = useDeployedContractInfo("Snowman")

  const getDetails = async () => {
    if(isLoadingSnowmanContract || !isConnected) return

    try {
      setIsLoading(true)
      ISnowman.current = new ethers.Contract(snowmanContract.address, snowmanContract.abi, provider)

      const tokenURI = await ISnowman.current.tokenURI(id);
      const metadata = await (await fetch(tokenURI)).json()
      metadata.image = await (await fetch(metadata.image)).text()

      const accessories: any[] = await ISnowman.current.getAccessories()
      const _accessories = []

      for (let i = 0; i < accessories.length; i++) {
        const address = accessories[i][0]
        try {
          const isWorn = await ISnowman.current.hasAccessory(address, id)
          const accessory = new ethers.Contract(address, erc721ABI, provider)
          const name = await accessory.name()
          _accessories.push({name, address, isWorn})
        } catch(error) {
          console.error(error)
        }
      }

      setMetadata(metadata)
      setAccessories(_accessories)

    } catch(error) {
      console.log("Error getting details for Snowman ", id)
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    getDetails()
  }, [isLoadingSnowmanContract])

  // const {writeAsync: transfer, isLoading: isTransferring, isSuccess: isTransferSuccessful} = useScaffoldContractWrite({
  //   contractName: "Snowman",
  //   functionName: "safeTransferFrom",
  //   args: [connectedAccount, recipient, id],
  //   overrides: {
  //     gasLimit: ethers.BigNumber.from("500000"),
  //   },
  //   onSuccess: () => {
  //     onCloseTransferModal()
  //     remove()
  //   }
  // })

  const removeAccessory = async (accessory: Accessory) => {
    if(isRemovingAccessory) return
    try {
      setIsRemovingAccessory(accessory.name)
      const snowman = ISnowman.current.connect(signer)

      const tx = await snowman.removeAccessory(accessory.address, id, {
        gasLimit: 500000
      })
      await tx.wait(1)

      setIsRemovingAccessory("")
      getDetails()
    } catch(error){
      notification.error(JSON.stringify(error))
      setIsRemovingAccessory("")
    }
  }

  const removeAllAccessories = async () => {
    if(isRemovingAllAccessories) return
    try {
      setIsRemovingAllAccessories(true)
      const snowman = ISnowman.current.connect(signer)

      const tx = await snowman.removeAllAccessories(id, {
        gasLimit: 500000
      })
      await tx.wait(1)

      setIsRemovingAllAccessories(false)
      getDetails()
    } catch(error) {
      notification.error(JSON.stringify(error))
      setIsRemovingAllAccessories(false)
    }
  }

  const transfer = async () => {
    if(isTransferring || !isConnected) return

    setIsTransferring(true)

    try {
      const snowman = ISnowman.current.connect(signer)

      const tx = await snowman["safeTransferFrom(address,address,uint256)"](connectedAccount, recipient, id, {
        gasLimit: 500000
      })
      await tx.wait(1)

      onCloseTransferModal()
      remove()
    } catch(error) {
      notification.error(JSON.stringify(error))
    }

    setIsTransferring(false)
  }

  if(isLoading) return <Spinner size="md" thickness='4px' speed='0.65s' />
  if(!metadata) return

  return (
    <div className='max-w-[20rem] rounded-lg bg-white border border-gray-300 p-2'>
        <SVG src={metadata.image} />
        <div className='flex items-center justify-between gap-5 p-2 text-black'>
            <h1 className='font-bold text-lg'>{metadata.name}</h1>
            <Menu>
              <MenuButton
                as={IconButton}
                aria-label='Options'
                icon={<EllipsisHorizontalIcon className='w-8 font-bold bg-white rounded-md p-1 border border-gray-300 cursor-pointer transition duration-300 hover:border-orange-500 hover:text-white hover:bg-orange-500' /> }
                variant='outline'
              />
              <MenuList>
                {accessories?.filter(accessory => accessory.isWorn)?.length > 0 && (
                  <>
                    <Menu>
                      <MenuButton as={Button}>
                      <MenuItem> Remove Accessory</MenuItem>
                      </MenuButton>
                      <MenuList>
                        {accessories?.filter(accessory => accessory.isWorn).map(accessory => <MenuItem onClick={() => removeAccessory(accessory)}>{accessory.name}{isRemovingAccessory === accessory.name && <Spinner size="sm" thickness='4px' speed='0.65s' className="ml-2" />}</MenuItem>)}
                      </MenuList>
                    </Menu>
                    
                    <MenuItem onClick={removeAllAccessories}>
                      Remove All Accessories {isRemovingAllAccessories && <Spinner size="sm" thickness='4px' speed='0.65s' className="ml-2" />}
                    </MenuItem>
                  </>
                )}
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