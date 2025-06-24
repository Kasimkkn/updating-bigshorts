import { MutedUser } from '@/services/getmutedusers';
import React from 'react';
import Avatar from '../Avatar/Avatar';
import Modal from '../modal/Modal';

interface HideUserModalProps {
    mutedUsers: MutedUser[] | null;
    setMutedModal: React.Dispatch<React.SetStateAction<boolean>>;
    handleUnhideClicked: (userId: number) => void;
    dummyImage: { src: string };
}
const HideUserModal = ({ mutedUsers, setMutedModal, handleUnhideClicked, dummyImage }: HideUserModalProps) => {
    return (
        <Modal onClose={() => setMutedModal(false)} title="Muted Users">
            <div className="overflow-y-scroll h-[70vh]">
                {mutedUsers && mutedUsers.length > 0 ? (
                    <>
                        {mutedUsers.map((user) => (
                            <div
                                key={user.userId}
                                className="flex items-center justify-between mb-2"
                            >
                                <div className="flex items-center gap-2">
                                    <Avatar
                                        src={user.userProfileImage}
                                        name={user.userFullName}
                                        width="w-10"
                                        height="h-10" isMoreBorder={false} />

                                    <h2>{user.userFullName || user.userName}</h2>
                                </div>
                                <button
                                    className="text-sm linearBorder rounded-md px-3 py-2"
                                    onClick={() => handleUnhideClicked(user.userId)}
                                >
                                    Unhide
                                </button>
                            </div>
                        ))}
                    </>
                ) : (
                    <p className="text-text-color text-center">No Hidden User</p>
                )}
            </div>
        </Modal>
    )
}

export default HideUserModal