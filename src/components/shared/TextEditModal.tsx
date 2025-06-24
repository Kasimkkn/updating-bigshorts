import { useState } from "react";
import Button from "./Button";
import CommonModalLayer from "../modal/CommonModalLayer";
import Input from "./Input";

const TextEditModal: React.FC<{
    text: string;
    onSave: (newText: string) => void;
    onClose: () => void;
}> = ({ text, onSave, onClose }) => {
    const [newText, setNewText] = useState(text);

    return (
        <CommonModalLayer width="w-max" height="h-max">
            <div className=" w-72 mx-auto p-3">
                <h3 className="text-lg font-semibold mb-2 text-text-color">Edit Text</h3>
                <Input
                    type="text"
                    value={newText}
                    onChange={(e) => setNewText(e.target.value)}
                />
                <div className="flex justify-end space-x-4 mt-3">

                    <Button
                        isLinearBorder={true}
                        onClick={onClose}
                    >
                        Cancel
                    </Button>
                    <Button
                        isLinearBtn={true}
                        onCLick={() => onSave(newText)}
                    >
                        Save
                    </Button>
                </div>
            </div>
        </CommonModalLayer>
    );
};

export default TextEditModal;