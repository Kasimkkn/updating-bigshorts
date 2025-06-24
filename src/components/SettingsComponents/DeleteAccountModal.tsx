import React from 'react'
import Modal from '../modal/Modal';
import Button from '@/components/shared/Button';

interface AboutUsModalProps {
    setOpenDeleteAccountModal: React.Dispatch<React.SetStateAction<boolean>>;
}

const warningTest = "Do you really wish to delete your account? Please be aware that by deleting your account, you will lose your profile and all associated data."

const DeleteAccountModal = ({setOpenDeleteAccountModal}:AboutUsModalProps) => { 
    
    return (
        <Modal onClose={() => setOpenDeleteAccountModal(false)} title="Delete Account">
            <div className="overflow-y-scroll h-[50vh] flex flex-col justify-between items-center">
                <p className="text-text-color">{warningTest}</p>
                    <div className='flex flex-col gap-4'>
                        <Button
                            className='w-full'
                            isLinearBtn={true} 
                            onCLick={()=>{}}
                        >
                            Delete Account Permanently
                        </Button>
                        <Button
                            className='w-full linearText linearBorder'
                            onCLick={()=>setOpenDeleteAccountModal(false)}
                        >
                            Cancel
                        </Button>
                    </div>
            </div>
        </Modal>
  )
}

export default DeleteAccountModal