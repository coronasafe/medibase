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
      return lastPage.has_next ? parseInt(lastPage.offset) + 50 : undefined;
    },
  });

  useEffect(() => {
    medicineQuery.refetch();
  }, [filters]);

  const allDataKeys = medicineQuery.data?.pages.reduce((acc, page) => {
    return [...acc, ...page.results.map((medicine: any) => Object.keys(medicine)).flat()];
  }, [] as string[]);

  const uniqueAllDataKeys = allDataKeys ? [...new Set(allDataKeys)] : [];
  const uniqueDataKeys = uniqueAllDataKeys.filter((key: any) => !["_id", "company_link", "href", "cims_class_link"].includes(key));

  return (
    <main>
      <h1 className="text-4xl font-black">
        Care Medicine Database
      </h1>
      <form className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 mt-3" style={{ display: displayFilters ? "grid" : "none" }}>
        {Object.keys(filters).map((key) => {

          const filter: any = filters[key as keyof typeof filters];

          switch (filter.type) {
            case "text":
              return (
                <div className="flex items-stretch border border-gray-400 rounded-lg overflow-hidden relative" key={key}>
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
                    key={key}
                    className=" w-full p-1 px-3 outline-none"
                    type="text"
                    name={key}
                    id={key}
                    placeholder={key}
                    value={filters[key as keyof typeof filters].value as any}
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
        <button className={displayFilters ? "-rotate-90" : "rotate-90"}>&gt;</button> {displayFilters ? "Hide" : "Show"} Filters
      </button>
      <br />
      <p>
        {medicineQuery.data?.pages[0].count || 0} medicines found
      </p>
      <br />
      {medicineQuery.isLoading && (<div>Loading...</div>)}

      <div className="border border-gray-300 rounded-lg p-2 inline-flex items-center gap-2">
        <button
          className={`${displayType === "grid" ? "bg-blue-100" : "bg-gray-200"} p-2 px-4 rounded-lg`}
          onClick={() => {
            setDisplayType("grid");
          }}
        >
          Grid
        </button>
        <button
          className={`${displayType === "table" ? "bg-blue-100" : "bg-gray-200"} p-2 px-4 rounded-lg`}
          onClick={() => {
            setDisplayType("table");
          }}
        >
          Table
        </button>
      </div>
      <InfiniteScroll
        dataLength={medicineQuery.data?.pages.flatMap((page) => page.results).length || 0}
        hasMore={medicineQuery.data?.pages[medicineQuery.data.pages.length - 1].has_next || false}
        next={medicineQuery.fetchNextPage}
        loader={<div className="">Loading...</div>}
        className={`grid grid-cols-1 ${displayType === "grid" ? "md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : ""} gap-5 mt-8`}
      >
        {displayType === "table" ? (
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-gray-50">
              <tr>
                {["id", ...uniqueDataKeys].map((key: any) => (
                  <th scope="col" className="px-6 py-3" key={key}>{key}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {medicineQuery.data?.pages.flatMap((page) => page.results).map((medicine: any, index: number) => (
                <tr key={index} className={`${index % 2 === 0 ? "bg-white" : "bg-gray-100"} border-b`}>
                  <td className="p-2 px-4">{index + 1}</td>
                  {uniqueDataKeys.map((key: any) => (
                    <td key={key} className="p-2 px-4">
                      {<DataDisplay data={medicine} dataKey={key} />}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        ) :
          medicineQuery.data?.pages.flatMap((page) => page.results).map((medicine: any, index: number) => (
            <div key={index} className="border border-gray-200 p-4 rounded-lg">
              <table>
                <tbody>
                  {uniqueDataKeys.map((key: any) => (
                    <tr key={key}>
                      <td className="font-bold">{key}</td>
                      <td><DataDisplay data={medicine} dataKey={key} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
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

const DataDisplay = (props: { data: any, dataKey: any }) => {
  const { data, dataKey: key } = props;
  switch (key) {
    case "contents": {
      return <Contents contents={data[key]} />
    }
    case "dosage_direction_for_use": {
      return (
        <button className="text-blue-400">
          View Directions
        </button>
      )
    }
    case "company": {
      return <Link href={data.company_link || ""} className="text-blue-400">{data[key]}</Link>
    }
    case "cims_class": {
      return <Link href={data.cims_class_link || ""} className="text-blue-400">{data[key]}</Link>
    }
    case "name": {
      return <Link href={data.href || ""} className="text-blue-400">{data[key]}</Link>
    }
    default: {
      return <Contents contents={data[key]} />
    }
  }
}