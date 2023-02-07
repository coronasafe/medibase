"use client";
import { useEffect, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { useInfiniteQuery, useQuery } from "react-query";

export default function Home() {

  const queryTypes = ["contains", "exact", "starts", "ends"]

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
    atc_class: {
      type: "text",
      value: ""
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
    }
  });

  useEffect(() => {
    medicineQuery.refetch();
  }, [filters]);

  return (
    <main>
      <h1 className="text-4xl font-black">
        Care Medicine Database
      </h1>
      <form className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 mt-3">
        {Object.keys(filters).map((key) => {

          const filter: any = filters[key as keyof typeof filters];

          switch (filter.type) {
            case "text":
              return (
                <div className="flex items-stretch border border-gray-400 rounded-lg overflow-hidden relative">
                  <select
                    className="bg-gray-200 border-none outline-none px-3 ring-0"
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
                  <input
                    key={key}
                    className="flex-1 p-2 px-4 outline-none"
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
                className="border border-gray-400 rounded-lg p-2 px-4"
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
      <p>
        {medicineQuery.data?.pages[0].count || 0} medicines found
      </p>
      {medicineQuery.isLoading && (<div>Loading...</div>)}
      <InfiniteScroll
        dataLength={medicineQuery.data?.pages.flatMap((page) => page.results).length || 0}
        hasMore={medicineQuery.data?.pages[medicineQuery.data.pages.length - 1].has_next || false}
        next={medicineQuery.fetchNextPage}
        loader={<div className="">Loading...</div>}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mt-8"
      >
        {medicineQuery.data?.pages.flatMap((page) => page.results).map((medicine: any, index: number) => (
          <div key={index} className="border border-gray-200 p-4 rounded-lg">
            <table>
              <tbody>
                {["name", "type", "generic", "company", "contents", "cims_class", "atc_class"].map((key) => (
                  <tr key={key}>
                    <td className="font-bold">{key}</td>
                    <td>{medicine[key as keyof typeof medicine]}</td>
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
