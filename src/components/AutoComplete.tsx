import { useEffect, useRef, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { UseInfiniteQueryResult } from "react-query";

export default function AutoCompleteInput(props: {
    query: UseInfiniteQueryResult<any, unknown>;
    disableAutoComplete?: boolean;
} & React.InputHTMLAttributes<HTMLInputElement>) {
    const { query: medicineQuery, disableAutoComplete, ...rest } = props;
    const [show, setShow] = useState(false);
    const ref = useRef<HTMLInputElement>(null);

    const data = [...new Set(medicineQuery.data?.pages.flatMap((page) => page.results.flatMap((result: any) => result[rest.name || ""])))];

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        rest.onChange && rest.onChange(e);
        setShow(!!e.target.value);
    };

    useEffect(() => {
        //console.log(medicineQuery.data?.pages[medicineQuery.data.pages.length - 1].has_next)
    }, [medicineQuery.data?.pages[medicineQuery.data.pages.length - 1].has_next])

    return (
        <div className="relative flex-1">
            <input
                ref={ref}
                {...rest}
                onFocus={() => setShow(!!rest.value)}
                onBlur={() => setTimeout(() => setShow(false), 100)}
                autoComplete={"off"}
                onChange={handleChange}
            />
            {rest.value && (
                <button className="absolute right-2 bottom-0 top-0" onClick={() => rest.onChange && rest.onChange({ target: { value: "" } } as any)}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            )}
            <div
                className={`absolute inset-x-0 top-full bg-white shadow border border-gray-200 z-40 transition-all overflow-auto ${!disableAutoComplete && show ? "max-h-[500px] visible" : "max-h-0 invisible"}`}>
                <InfiniteScroll
                    dataLength={data?.length || 0}
                    hasMore={medicineQuery.data?.pages[medicineQuery.data.pages.length - 1].has_next || false}
                    next={medicineQuery.fetchNextPage}
                    loader={<div className="p-4">Loading...</div>}

                >
                    {data?.map((value, index) => (
                        <button key={index} type="button" className="p-2 hover:bg-gray-100 block w-full text-left" onClick={() => rest.onChange && rest.onChange({ target: { value } } as any)}>
                            {value}
                        </button>
                    ))}
                </InfiniteScroll>
            </div>
        </div>
    )
}