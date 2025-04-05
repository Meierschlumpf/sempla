import { ListError } from "./error";
import { ListLoading } from "./loading";
import { ListNotFound } from "./not-found";

type ListWrapperProps<
  TItem extends Record<string, unknown> = Record<string, unknown>
> = {
  children: JSX.Element;
  label: string;
  items?: TItem[];
  isLoading: boolean;
  isError: boolean;
};

export const ListWrapper = ({
  children,
  label,
  items,
  isLoading,
  isError,
}: ListWrapperProps) => {
  if (isLoading) {
    return <ListLoading />;
  }

  if (isError) {
    return <ListError />;
  }

  if (items?.length === 0) {
    return <ListNotFound label={label} />;
  }

  return children;
};
