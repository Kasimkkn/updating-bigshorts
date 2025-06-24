import { MutedUser } from '@/services/getmutedusers';
import React from 'react';
import Avatar from '../Avatar/Avatar';
import Modal from '../modal/Modal';
import { useInAppRedirection } from '@/context/InAppRedirectionContext';

interface BlockedUserModalProps {
  blockedUsers: MutedUser[] | null;
  setUnhideModal: React.Dispatch<React.SetStateAction<boolean>>;
  handlUnblockUser: (userId: number) => void;
  dummyImage: { src: string };
}

const BlockedUserModal = ({ blockedUsers, setUnhideModal, handlUnblockUser, dummyImage }: BlockedUserModalProps) => {
  const { setShouldRefreshPosts } = useInAppRedirection();

  const handleUnblock = async (userId: number) => {
    handlUnblockUser(userId);
    setShouldRefreshPosts(true);
  };

  return (
    <Modal onClose={() => setUnhideModal(false)} title="Blocked Users">
      <div className="overflow-y-scroll h-[70vh]">
        {blockedUsers && blockedUsers.length > 0 ? (
          <>
            {blockedUsers.map((user) => (
              <div
                key={user.userId}
                className="flex items-center justify-between mb-2"
              >
                <div className="flex items-center gap-2">
                  <Avatar
                    src={user.userProfileImage}
                    name={user.userFullName}
                    width="w-10"
                    height="h-10"
                    isMoreBorder={false}
                  />
                  <h2>{user.userFullName || user.userName}</h2>
                </div>
                <button
                  className="text-sm linearBorder rounded-md px-3 py-2"
                  onClick={() => handleUnblock(user.userId)}  // Changed this line
                >
                  Unblock
                </button>
              </div>
            ))}
          </>
        ) : (
          <p className="text-text-color text-center">No Blocked User</p>
        )}
      </div>
    </Modal>
  );
};

export default BlockedUserModal;