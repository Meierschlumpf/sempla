import { useSortable } from "@dnd-kit/sortable";
import { type RouterOutputs } from "~/utils/api";
import { TopicCard } from "./main";
import { CSS } from "@dnd-kit/utilities";

type SortableTopicCardProps = {
  item: RouterOutputs["topic"]["overview"][number];
};

export const SortableTopicCard = ({ item }: SortableTopicCardProps) => {
  const { transform, transition, attributes, listeners, setNodeRef } =
    useSortable({
      id: item.id,
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <TopicCard
      mode="edit"
      item={item}
      attributes={attributes}
      listeners={listeners}
      setNodeRef={setNodeRef}
      style={style}
    />
  );
};
