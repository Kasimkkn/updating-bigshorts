"use client"

import { PostlistItem } from '@/models/postlistResponse'
import React, { createContext, useContext, useState } from 'react'

interface CreationOptionContextType {
  createPost: boolean
  createSnip: boolean
  createSsup: boolean
  createFlix: boolean
  setCreatePost: React.Dispatch<React.SetStateAction<boolean>>
  setCreateSnip: React.Dispatch<React.SetStateAction<boolean>>
  setCreateSsup: React.Dispatch<React.SetStateAction<boolean>>
  setCreateFlix: React.Dispatch<React.SetStateAction<boolean>>
  openCreatingOptions: boolean
  setOpenCreatingOptions: React.Dispatch<React.SetStateAction<boolean>>
  toggleSnipCreate: () => void
  toggleSsupCreate: () => void
  togglePostCreate: () => void
  toggleFlixCreate: () => void
  toggleCreatingOptions: () => void
  sharedPostData?: any;
  sharedSsupData?: any;
  setSharedPostData: React.Dispatch<React.SetStateAction<any>>;
  setSharedSsupData: React.Dispatch<React.SetStateAction<any>>
  storyViewOpen: boolean
  setStoryViewOpen: React.Dispatch<React.SetStateAction<boolean>>
}

const CreationOptionContext = createContext<CreationOptionContextType | undefined>(undefined)

export const CreationOptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [createPost, setCreatePost] = useState(false)
  const [createSsup, setCreateSsup] = useState(false)
  const [createSnip, setCreateSnip] = useState(false)
  const [createFlix, setCreateFlix] = useState(false)
  const [openCreatingOptions, setOpenCreatingOptions] = useState(false)
  const [sharedPostData, setSharedPostData] = useState<PostlistItem | null>(null);
  const [sharedSsupData, setSharedSsupData] = useState<PostlistItem | null>(null);
  const [storyViewOpen, setStoryViewOpen] = useState(false);
  const toggleSnipCreate = () => {
    setCreateSnip(!createSnip)
  }

  const toggleSsupCreate = () => {
    setCreateSsup(!createSsup)
  }

  const togglePostCreate = () => {
    setCreatePost(!createPost)
  }

  const toggleFlixCreate = () => {
    setCreateFlix(!createFlix)
  }
  const toggleCreatingOptions = () => {
    setOpenCreatingOptions(!openCreatingOptions)
  }

  const setSharedPostDataHandler = (data: PostlistItem | null) => {
    setSharedPostData(data);
  };

  const setSharedSsupDataHandler = (data: PostlistItem | null) => {
    setSharedSsupData(data);
  };

  return (
    <CreationOptionContext.Provider
      value={{
        createPost,
        createSnip,
        createFlix,
        createSsup,
        setCreatePost,
        setCreateFlix,
        setCreateSnip,
        setCreateSsup,
        openCreatingOptions,
        setOpenCreatingOptions,
        toggleSnipCreate,
        toggleSsupCreate,
        togglePostCreate,
        toggleFlixCreate,
        toggleCreatingOptions,
        sharedPostData,
        sharedSsupData,
        setSharedPostData: setSharedPostDataHandler,
        setSharedSsupData: setSharedSsupDataHandler,
        storyViewOpen,
        setStoryViewOpen
      }}
    >
      {children}
    </CreationOptionContext.Provider>
  )
}

export const useCreationOption = () => {
  const context = useContext(CreationOptionContext)
  if (!context) {
    throw new Error('useCreationOption must be used within a CreationOptionProvider')
  }
  return context
}