import { useRouter } from "next/router";
import { type ParsedUrlQuery, type ParsedUrlQueryInput } from "querystring";
import { useState } from "react";

export const useSearchParamsState = <
  TQueryParams extends ParsedUrlQueryInput,
  TKey extends keyof TQueryParams
>(
  defaultValue: TQueryParams,
  key: TKey
) => {
  const router = useRouter();
  const [value, setValue] = useState<TQueryParams[TKey]>(defaultValue[key]);

  const onUpdate = (value: TQueryParams[TKey]) => {
    setValue(value);
    void router.replace(
      {
        query: {
          ...router.query,
          [key]: value,
        },
      },
      undefined,
      {
        shallow: true,
      }
    );
  };

  return [value, onUpdate] as const;
};

export const getSearchParamWithFallback = (
  query: ParsedUrlQuery,
  key: string,
  fallback: string
) => {
  const search = query[key];

  if (typeof search === "string" && search.length > 0) {
    return search;
  }

  if (Array.isArray(search) && search.length > 0) {
    return search.at(0)!;
  }

  return fallback;
};
