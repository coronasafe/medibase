import { useState } from "react";

export default function AutoCompleteInput(props: {

} & React.InputHTMLAttributes<HTMLInputElement>) {
    const { ...rest } = props;
    const [show, setShow] = useState(false);
    return (
        <div className="relative flex-1">
            <input {...rest} onFocus={() => setShow(true)} onBlur={() => setShow(false)} />
            <div className={`absolute inset-x-0 top-full p-4 bg-white border border-gray-100 z-10 ${show ? "max-h-[500px]" : "max-h-0"}`}>
                SA
            </div>
        </div>
    )
}