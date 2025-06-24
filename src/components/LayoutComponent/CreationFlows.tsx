import CreationOption from "@/components/creationComponents/CreationOption";
import CreatePostFlow from "@/components/createPost/CreatePostFlow";
import CreateSnipFlow from "@/components/createSnip/CreateSnipFlow";
import CreateSsupFlow from "@/components/createSsup/CreateSsupFlow";
import CreateFlixFlow from "@/components/createFlix/CreateFlixFlow";
import { FinalJsonProvider } from "@/context/useInteractiveVideo";
import { FinalJsonProvider as FinalJsonProviderImage } from "@/context/useInteractvieImage";

type CreationFlowsProps = {
    openCreatingOptions: boolean;
    createPost: boolean;
    createSnip: boolean;
    createSsup: boolean;
    createFlix: boolean;
    toggleCreatingOptions: () => void;
    togglePostCreate: () => void;
    toggleSnipCreate: () => void;
    toggleSsupCreate: () => void;
    toggleFlixCreate: () => void;
    setCreatePost: (value: boolean) => void;
    setCreateSnip: (value: boolean) => void;
    setCreateSsup: (value: boolean) => void;
    setCreateFlix: (value: boolean) => void;
};

const CreationFlows = ({
    openCreatingOptions,
    createPost,
    createSnip,
    createSsup,
    createFlix,
    toggleCreatingOptions,
    togglePostCreate,
    toggleSnipCreate,
    toggleSsupCreate,
    toggleFlixCreate,
    setCreatePost,
    setCreateSnip,
    setCreateSsup,
    setCreateFlix
}: CreationFlowsProps) => {
    return (
        <>
            {openCreatingOptions && (
                <CreationOption
                   setCreateFlix={setCreateFlix}
                    onClose={toggleCreatingOptions}
                    setCreatePost={setCreatePost}
                    setCreateSsup={setCreateSsup}
                    setCreateSnip={setCreateSnip}
                />
            )}

{createFlix && (
                <FinalJsonProvider>
                    <CreateFlixFlow
                        toggleCreatingOptions={toggleCreatingOptions}
                        toggleFlixCreate={toggleFlixCreate}
                    />
                </FinalJsonProvider>
            )}

            {createPost && (
                <FinalJsonProviderImage>
                    <CreatePostFlow
                        toggleCreatingOptions={toggleCreatingOptions}
                        togglePostCreate={togglePostCreate}
                    />
                </FinalJsonProviderImage>
            )}

            {createSnip && (
                <FinalJsonProvider>
                    <CreateSnipFlow
                        toggleCreatingOptions={toggleCreatingOptions}
                        toggleSnipCreate={toggleSnipCreate}
                    />
                </FinalJsonProvider>
            )}

            {createSsup && (
                <FinalJsonProviderImage>
                    <CreateSsupFlow
                        toggleCreatingOptions={toggleCreatingOptions}
                        toggleSsupCreate={toggleSsupCreate}
                    />
                </FinalJsonProviderImage>
            )}

        </>
    );
};

export default CreationFlows;