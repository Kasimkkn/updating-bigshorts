import Button from "./Button";

const ControlButton = ({ label, onClick, htmlFor, type = "button", value, onChange, children }: { label: string, onClick?: () => void, htmlFor?: string, type?: string, value?: string, onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void, children?: React.ReactNode }) => (
    <Button isLinearBtn={true}
        className='w-full relative'
        onClick={onClick}
    >
        {htmlFor ? (
            <label className="w-full h-full cursor-pointer flex flex-col justify-center items-center" htmlFor={htmlFor}>
                <div className="w-full h-full flex flex-col justify-center items-center">
                    {children ? children : null}
                    {label}
                </div>
                <input
                    type={type}
                    id={htmlFor}
                    value={value}
                    onChange={onChange}
                    className="w-0 h-0 outline-none opacity-0 border-none"
                />
            </label>
        ) : (
            <div className="w-full h-full flex flex-col justify-center items-center">
                {children ? children : null}
                {label}
            </div>
        )}
    </Button>
);

export default ControlButton;