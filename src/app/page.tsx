"use client";
import AutoCompleteInput from "@/components/AutoComplete";
import Link from "next/link";
import { useEffect, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { useInfiniteQuery, useQuery } from "react-query";

export default function Home() {

  const queryTypes = ["contains", "exact", "starts", "ends"]
  const [displayType, setDisplayType] = useState<"grid" | "table">("grid");
  const [displayFilters, setDisplayFilters] = useState(true);
  const [modalContent, setModalContent] = useState<React.ReactNode>(null);

  useEffect(() => {
    const type = localStorage.getItem("displayType");
    if (type) {
      setDisplayType(type as any);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("displayType", displayType);
  }, [displayType]);

  const [filters, setFilters] = useState({
    name: {
      type: "text",
      value: "",
      query_type: "contains"
    },
    type: {
      type: "choice",
      value: "",
      options: [
        "brand",
        "generic",
      ]
    },
    generic: {
      type: "text",
      value: ""
    },
    company: {
      type: "text",
      value: ""
    },
    cims_class: {
      type: "text",
      value: ""
    },
    contents: {
      type: "text",
      value: ""
    },
    atc_classification: {
      type: "text",
      value: ""
    },
    dosage_direction_for_use: {
      type: "text",
      value: ""
    },
    administration: {
      type: "text",
      value: ""
    },
    contraindications: {
      type: "text",
      value: ""
    },
    special_precautions: {
      type: "text",
      value: ""
    },
    adverse_reactions: {
      type: "text",
      value: ""
    },
    drug_interactions: {
      type: "text",
      value: ""
    },
    action: {
      type: "text",
      value: ""
    },
    pregnancy_category_us_fda: {
      type: "text",
      value: "",
    },
    lab_interference: {
      type: "text",
      value: "",
    }
  });

  const medicineQuery = useInfiniteQuery(["medicines", filters], async ({ pageParam = 0 }) => {
    try {
      const qString = Object.keys(filters)
        .map((key) => `${key}=${filters[key as keyof typeof filters].value}${Object.keys(filters[key as keyof typeof filters]).includes("query_type") ? ("&" + (filters[key as keyof typeof filters] as any).query_type + "__" + key + "=true") : ""}`)
        .join("&");
      const f = await fetch("/api/medicines?offset=" + pageParam + "&" + qString);
      const medicines = await f.json();
      return medicines;
    } catch (e) {
      console.log(e);
    }
  }, {
    getNextPageParam: (lastPage, pages) => {
      return lastPage?.has_next ? parseInt(lastPage.offset) + 50 : undefined;
    },
  });

  useEffect(() => {
    medicineQuery.refetch();
  }, [filters]);

  const allDataKeys = medicineQuery.data?.pages.reduce((acc, page) => {
    return [...acc, ...page?.results.map((medicine: any) => Object.keys(medicine)).flat()];
  }, [] as string[]);

  const uniqueAllDataKeys = allDataKeys ? [...new Set(allDataKeys)] : [];
  const uniqueDataKeys = uniqueAllDataKeys.filter((key: any) => !["_id", "company_link", "href", "cims_class_link"].includes(key));

  return (
    <main>
      {modalContent &&
        <Modal onClose={() => setModalContent(null)}>
          {modalContent}
        </Modal>
      }
      <h1 className="text-4xl font-black">
        Medibase
      </h1>
      <form className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 mt-3" style={{ display: displayFilters ? "grid" : "none" }}>
        {Object.keys(filters).map((key) => {

          const filter: any = filters[key as keyof typeof filters];

          switch (filter.type) {
            case "text":
              return (
                <div className="flex items-stretch border border-gray-400 rounded-lg relative" key={key}>
                  <select
                    className="bg-gray-200 border-none outline-none px-2 p-1 ring-0"
                    name=""
                    id=""
                    onChange={(e) => {
                      setFilters({
                        ...filters,
                        [key]: {
                          ...filter,
                          query_type: e.target.value,
                        },
                      });
                    }}
                  >
                    {
                      queryTypes.map((type) => (
                        <option
                          key={type}
                          value={type}
                        >
                          {type}
                        </option>
                      ))
                    }
                  </select>
                  <AutoCompleteInput
                    disableAutoComplete={["contents"].includes(key)}
                    key={key}
                    className=" w-full p-1 px-3 outline-none"
                    type="text"
                    name={key}
                    id={key}
                    placeholder={key}
                    value={filters[key as keyof typeof filters].value as any}
                    query={medicineQuery}
                    onChange={(e) => {
                      setFilters({
                        ...filters,
                        [key]: {
                          ...filter,
                          value: e.target.value,
                        },
                      });
                    }}
                  />
                </div>

              )
            case "choice":
              return <select
                key={key}
                className="border border-gray-400 rounded-lg p-1 px-3"
                onChange={(e) => {
                  setFilters({
                    ...filters,
                    [key]: {
                      ...filter,
                      value: e.target.value,
                    },
                  });
                }}
              >
                <option value="" selected>{key}</option>
                {filter.options.map((option: any) => (
                  <option value={option} key={option}>{option}</option>
                ))}
              </select>
            case "boolean":
              return <input
                key={key}
                type="checkbox"
                name={key}
                id={key}
                value={""}
                onChange={(e) => {
                  setFilters({
                    ...filters,
                    [key]: {
                      ...filter,
                      value: e.target.value,
                    },
                  });
                }}
              />
          }
        })}
      </form>
      <button
        className="p-2 block w-full text-center bg-gray-100 hover:bg-gray-200 rounded-lg mt-2"
        onClick={() => setDisplayFilters(!displayFilters)}
      >
        <i className={"fal fa-chevron-right mr-2 " + (displayFilters ? "-rotate-90" : "rotate-90")} /> {displayFilters ? "Hide" : "Show"} Filters
      </button>
      <br />
      <div className="flex items-center justify-between">
        <p>
          {medicineQuery.data?.pages[0].count || 0} medicines found
        </p>
        <div className="border border-gray-100 rounded-lg p-1 inline-flex items-center gap-1">
          <button
            className={`${displayType === "grid" ? "bg-blue-100 text-blue-500" : "bg-gray-100 text-black"} w-10 h-10 flex items-center justify-center rounded-md`}
            onClick={() => {
              setDisplayType("grid");
            }}
          >
            <i className="fad fa-grid-2" />
          </button>
          <button
            className={`${displayType === "table" ? "bg-blue-100 text-blue-500" : "bg-gray-100 text-black"} w-10 h-10 flex items-center justify-center rounded-lg`}
            onClick={() => {
              setDisplayType("table");
            }}
          >
            <i className="fad fa-table" />
          </button>
        </div>
      </div>

      {medicineQuery.isLoading && (<div>Loading...</div>)}
      <InfiniteScroll
        dataLength={medicineQuery.data?.pages.flatMap((page) => page.results).length || 0}
        hasMore={medicineQuery.data?.pages[medicineQuery.data.pages.length - 1].has_next || false}
        next={medicineQuery.fetchNextPage}
        loader={<div className="">Loading...</div>}
        className={`grid grid-cols-1 ${displayType === "grid" ? "md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3" : ""} gap-5 mt-8`}
      >
        {displayType === "table" ? (
          <table className="w-full text-sm text-left overflow-hidden rounded-xl">
            <thead className="text-xs uppercase bg-gray-50">
              <tr>
                {["id", ...uniqueDataKeys].map((key: any) => (
                  <th scope="col" className="px-6 py-3" key={key}>{key.replaceAll("_", " ")}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {medicineQuery.data?.pages.flatMap((page) => page.results).map((medicine: any, index: number) => (
                <tr key={index} className={`${index % 2 === 0 ? "bg-white" : "bg-gray-100"} border-b`}>
                  <td className="p-2 px-4">{index + 1}</td>
                  {uniqueDataKeys.map((key: any) => (
                    <td key={key} className="p-2 px-4">
                      {<DataDisplay data={medicine} dataKey={key} setModalContent={setModalContent} />}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        ) :
          medicineQuery.data?.pages.flatMap((page) => page.results).map((medicine: any, index: number) => (
            <div key={index} className="border border-gray-300 p-4 rounded-lg">
              <div className="text-sm text-gray-600 italic">
                {medicine.cims_class}
              </div>
              <div className="text-lg font-bold">
                {medicine.name}
                <span className="text-sm font-normal ml-2">
                  {medicine.generic}
                </span>
              </div>
              {medicine.company && <div className="">
                <i className="fal fa-industry-windows" /> {medicine.company}
              </div>}
              <br />
              {uniqueDataKeys.filter(k => !["name", "type", "company", "generic", "cims_class"].includes(k as any)).map((key: any) => (
                <div key={key} className={"mb-2 " + (medicine[key] ? "" : "hidden")}>
                  <div className="text-xs text-gray-600 italic">
                    {key.replaceAll("_", " ")}
                  </div>
                  <div className="">
                    <DataDisplay data={medicine} dataKey={key} setModalContent={setModalContent} />
                  </div>
                </div>
              ))}
            </div>
          ))}
      </InfiniteScroll>
    </main>
  )
}

function Contents(props: { contents: string }) {

  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <span>
      {props.contents?.slice(0, 50)}

      <span className={isExpanded ? "" : "hidden"}>
        {props.contents?.slice(50)}
      </span>
      {props.contents?.length > 50 && (
        <>
          {!isExpanded ? "..." : ""}
          <button onClick={() => setIsExpanded(!isExpanded)} className={"text-blue-400 "}>
            &nbsp; {isExpanded ? "Less" : "More"}
          </button>
        </>
      )}
    </span>
  )
}

const DataDisplay = (props: { data: any, dataKey: any, setModalContent: any }) => {
  const { data, dataKey: key, setModalContent } = props;
  switch (key) {
    case "contents": {
      return <Contents contents={data[key]} />
    }
    case "dosage_direction_for_use": {
      return (
        <button className="text-blue-400" onClick={() => setModalContent(<div dangerouslySetInnerHTML={{ __html: data[key] }} />)}>
          View Directions
        </button>
      )
    }
    //case "company": {
    //  return <Link href={data.company_link || ""} target="_blank" className="text-blue-400">{data[key]}</Link>
    //}
    //case "cims_class": {
    //  return <Link href={"https://www.mims.com" + data.cims_class_link || ""} target="_blank" className="text-blue-400">{data[key]}</Link>
    //}
    //case "name": {
    //  return <Link href={"https://www.mims.com" + data.href || ""} target="_blank" className="text-blue-400">{data[key]}</Link>
    //}
    default: {
      return <Contents contents={data[key]} />
    }
  }
}

const Modal = (props: { children: any, onClose: () => void }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-10">
      <div className="absolute inset-0 bg-black opacity-50 -z-10" onClick={props.onClose}></div>
      <div className="bg-white relative w-full md:w-[800px] h-full md:h-auto md:max-h-[80vh] overflow-auto rounded-xl p-4 md:p-8">
        <button className="fixed top-4 right-4 text-2xl" onClick={props.onClose}>
          X
        </button>
        {props.children}
      </div>
    </div>
  )
}
