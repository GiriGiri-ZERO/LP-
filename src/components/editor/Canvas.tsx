"use client";

import { useEditorStore } from "@/store/editor";
import { BlockRenderer } from "@/components/blocks/BlockRenderer";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Block } from "@/types";
import { GripVertical, Trash2, Plus } from "lucide-react";

interface SortableBlockProps {
  block: Block;
  selected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onAddAfter: () => void;
}

function SortableBlock({
  block,
  selected,
  onSelect,
  onDelete,
  onAddAfter,
}: SortableBlockProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group">
      <div
        className="absolute left-0 top-0 bottom-0 w-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 cursor-grab"
        {...attributes}
        {...listeners}
      >
        <GripVertical size={16} className="text-gray-400" />
      </div>

      <div className="absolute right-0 top-0 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10 m-2">
        <button
          onClick={onDelete}
          className="w-7 h-7 bg-red-500 text-white rounded flex items-center justify-center hover:bg-red-600"
        >
          <Trash2 size={12} />
        </button>
      </div>

      <BlockRenderer block={block} selected={selected} onClick={onSelect} />

      <div className="absolute bottom-0 left-0 right-0 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 translate-y-3">
        <button
          onClick={onAddAfter}
          className="flex items-center gap-1 bg-blue-600 text-white text-xs px-3 py-1 rounded-full hover:bg-blue-700 shadow-lg"
        >
          <Plus size={12} />
          ブロックを追加
        </button>
      </div>
    </div>
  );
}

export function Canvas() {
  const { blocks, selectedBlockId, selectBlock, removeBlock, addBlock, reorderBlocks, viewport } =
    useEditorStore((s) => ({
      blocks: s.blocks,
      selectedBlockId: s.selectedBlockId,
      selectBlock: s.selectBlock,
      removeBlock: s.removeBlock,
      addBlock: s.addBlock,
      reorderBlocks: s.reorderBlocks,
      viewport: s.viewport,
    }));

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = blocks.findIndex((b) => b.id === active.id);
    const newIndex = blocks.findIndex((b) => b.id === over.id);
    const newOrder = [...blocks.map((b) => b.id)];
    newOrder.splice(oldIndex, 1);
    newOrder.splice(newIndex, 0, active.id as string);
    reorderBlocks(newOrder);
  }

  const viewportWidth = {
    pc: "100%",
    tab: "768px",
    sp: "390px",
  }[viewport];

  const sortedBlocks = [...blocks].sort((a, b) => a.order_index - b.order_index);

  return (
    <div className="flex-1 bg-gray-100 overflow-auto flex flex-col items-center py-6">
      <div
        className="bg-white shadow-lg transition-all duration-300"
        style={{ width: viewportWidth, maxWidth: "100%", minHeight: "600px" }}
      >
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={sortedBlocks.map((b) => b.id)}
            strategy={verticalListSortingStrategy}
          >
            {sortedBlocks.map((block) => (
              <SortableBlock
                key={block.id}
                block={block}
                selected={selectedBlockId === block.id}
                onSelect={() => selectBlock(block.id)}
                onDelete={() => removeBlock(block.id)}
                onAddAfter={() => addBlock("body", block.order_index)}
              />
            ))}
          </SortableContext>
        </DndContext>

        {blocks.length === 0 && (
          <div className="flex flex-col items-center justify-center h-96 text-gray-400 gap-4">
            <p className="text-lg">ブロックがありません</p>
            <p className="text-sm">左のパネルからブロックを追加してください</p>
            <button
              onClick={() => addBlock("hero")}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              <Plus size={16} />
              ヒーローブロックを追加
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
