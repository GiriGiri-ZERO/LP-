"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useEditorStore } from "@/store/editor";
import { BlockRenderer } from "@/components/blocks/BlockRenderer";
import { FloatingElementToolbar } from "@/components/editor/FloatingElementToolbar";
import { ResizeHandleOverlay } from "@/components/editor/ResizeHandleOverlay";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Block, BlockType, ElementStyle, OverlayElement } from "@/types";

function getInitialTextColor(block: Block): string {
  const c = block.content as Record<string, unknown>;
  const bg = ((c.background_color ?? c.fill_color ?? "#ffffff") as string);
  if (typeof bg !== "string" || !bg.startsWith("#") || bg.length < 7) return "#1a1a1a";
  const r = parseInt(bg.slice(1, 3), 16);
  const g = parseInt(bg.slice(3, 5), 16);
  const b = parseInt(bg.slice(5, 7), 16);
  return 0.299 * r + 0.587 * g + 0.114 * b < 128 ? "#ffffff" : "#1a1a1a";
}
import { generateId } from "@/lib/utils";
import { GripVertical, Plus, ChevronUp, ChevronDown, Copy, Trash2 } from "lucide-react";

// All available block types for the add-block popup
const BLOCK_TYPES: { type: BlockType; label: string; emoji: string }[] = [
  { type: "hero", label: "ヒーロー", emoji: "🦸" },
  { type: "headline", label: "見出し", emoji: "📰" },
  { type: "body", label: "本文", emoji: "📝" },
  { type: "feature", label: "特徴", emoji: "⭐" },
  { type: "testimonial", label: "口コミ", emoji: "💬" },
  { type: "faq", label: "FAQ", emoji: "❓" },
  { type: "price", label: "料金", emoji: "💰" },
  { type: "cta", label: "CTA", emoji: "🎯" },
  { type: "footer", label: "フッター", emoji: "📎" },
];

// ---- Block-type selection popup ----
interface AddBlockPopupProps {
  onSelect: (type: BlockType) => void;
  onClose: () => void;
}

function AddBlockPopup({ onSelect, onClose }: AddBlockPopupProps) {
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="absolute z-50 bottom-full mb-2 left-1/2 -translate-x-1/2 bg-white border border-gray-200 rounded-xl shadow-xl p-3 w-56"
    >
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-1">
        追加するブロックを選択
      </p>
      <div className="grid grid-cols-3 gap-1">
        {BLOCK_TYPES.map((b) => (
          <button
            key={b.type}
            onClick={() => {
              onSelect(b.type);
              onClose();
            }}
            className="flex flex-col items-center gap-0.5 p-2 rounded-lg text-xs text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
          >
            <span className="text-xl">{b.emoji}</span>
            <span className="leading-tight">{b.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ---- Drop zone line shown between blocks during drag ----
function DropZoneLine({ id }: { id: string }) {
  const { isOver, setNodeRef } = useDroppable({ id });
  return (
    <div
      ref={setNodeRef}
      className={`h-1 mx-4 rounded-full transition-all duration-150 ${
        isOver ? "bg-blue-500 scale-y-150" : "bg-transparent"
      }`}
    />
  );
}

// ---- Floating toolbar shown when a block is selected but not being edited ----
interface FloatingToolbarProps {
  blockId: string;
  isFirst: boolean;
  isLast: boolean;
}

function FloatingToolbar({ blockId, isFirst, isLast }: FloatingToolbarProps) {
  const moveBlockUp = useEditorStore((s) => s.moveBlockUp);
  const moveBlockDown = useEditorStore((s) => s.moveBlockDown);
  const duplicateBlock = useEditorStore((s) => s.duplicateBlock);
  const removeBlock = useEditorStore((s) => s.removeBlock);

  return (
    <div className="absolute top-2 right-2 z-50 flex gap-1 bg-white border border-gray-200 rounded-lg shadow-lg p-1">
      <button
        onClick={(e) => { e.stopPropagation(); moveBlockUp(blockId); }}
        disabled={isFirst}
        title="上へ"
        className="w-7 h-7 flex items-center justify-center rounded text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <ChevronUp size={14} />
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); moveBlockDown(blockId); }}
        disabled={isLast}
        title="下へ"
        className="w-7 h-7 flex items-center justify-center rounded text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <ChevronDown size={14} />
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); duplicateBlock(blockId); }}
        title="複製"
        className="w-7 h-7 flex items-center justify-center rounded text-gray-600 hover:bg-gray-100"
      >
        <Copy size={14} />
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); removeBlock(blockId); }}
        title="削除"
        className="w-7 h-7 flex items-center justify-center rounded text-red-500 hover:bg-red-50"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}

// ---- Sortable block wrapper ----
interface SortableBlockProps {
  block: Block;
  selected: boolean;
  isFirst: boolean;
  isLast: boolean;
  isDragActive: boolean;
  onSelect: () => void;
  onDoubleClick: () => void;
  onAddAfter: (type: BlockType) => void;
}

function SortableBlock({
  block,
  selected,
  isFirst,
  isLast,
  isDragActive,
  onSelect,
  onDoubleClick,
  onAddAfter,
}: SortableBlockProps) {
  const editingBlockId = useEditorStore((s) => s.editingBlockId);
  const isEditing = editingBlockId === block.id;

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: block.id });

  const [showPopup, setShowPopup] = useState(false);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    // Ghost appearance while dragging this block
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group">
      {/* Drag handle — hidden when editing to avoid accidental drags */}
      {!isEditing && (
        <div
          className="absolute left-0 top-0 bottom-0 w-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 cursor-grab active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripVertical size={16} className="text-gray-400" />
        </div>
      )}

      {/* Floating toolbar: show when selected but not editing */}
      {selected && !isEditing && !isDragActive && (
        <FloatingToolbar blockId={block.id} isFirst={isFirst} isLast={isLast} />
      )}

      <BlockRenderer
        block={block}
        selected={selected}
        isEditing={isEditing}
        onClick={onSelect}
        onDoubleClick={onDoubleClick}
      />

      {/* Add-block button below each block */}
      {!isDragActive && (
        <div className="absolute bottom-0 left-0 right-0 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 translate-y-3.5">
          <div className="relative">
            <button
              onClick={(e) => { e.stopPropagation(); setShowPopup((v) => !v); }}
              className="flex items-center gap-1 bg-blue-600 text-white text-xs px-3 py-1 rounded-full hover:bg-blue-700 shadow-lg"
            >
              <Plus size={12} />
              ブロックを追加
            </button>
            {showPopup && (
              <AddBlockPopup
                onSelect={(type) => onAddAfter(type)}
                onClose={() => setShowPopup(false)}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ---- Main Canvas ----
export function Canvas() {
  const blocks = useEditorStore((s) => s.blocks);
  const selectedBlockId = useEditorStore((s) => s.selectedBlockId);
  const editingBlockId = useEditorStore((s) => s.editingBlockId);
  const selectBlock = useEditorStore((s) => s.selectBlock);
  const setEditingBlock = useEditorStore((s) => s.setEditingBlock);
  const setSelectedElement = useEditorStore((s) => s.setSelectedElement);
  const setEditingElement = useEditorStore((s) => s.setEditingElement);
  const addBlock = useEditorStore((s) => s.addBlock);
  const reorderBlocks = useEditorStore((s) => s.reorderBlocks);
  const updateElementStyle = useEditorStore((s) => s.updateElementStyle);
  const addOverlayElement = useEditorStore((s) => s.addOverlayElement);
  const setIsDraggingElement = useEditorStore((s) => s.setIsDraggingElement);
  const viewport = useEditorStore((s) => s.viewport);

  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [showEmptyPopup, setShowEmptyPopup] = useState(false);
  const [isPaletteDragOver, setIsPaletteDragOver] = useState(false);
  const canvasContentRef = useRef<HTMLDivElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragStart(event: DragStartEvent) {
    setActiveDragId(event.active.id as string);
    if (editingBlockId) setEditingBlock(null);
    setSelectedElement(null);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveDragId(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = blocks.findIndex((b) => b.id === active.id);
    const newIndex = blocks.findIndex((b) => b.id === over.id);
    const newOrder = [...blocks.map((b) => b.id)];
    newOrder.splice(oldIndex, 1);
    newOrder.splice(newIndex, 0, active.id as string);
    reorderBlocks(newOrder);
  }

  function getDropIndex(clientY: number): number {
    if (!canvasContentRef.current) return sortedBlocks.length;
    const blockEls = Array.from(canvasContentRef.current.querySelectorAll("[data-block-id]"));
    for (let i = 0; i < blockEls.length; i++) {
      const rect = blockEls[i].getBoundingClientRect();
      if (clientY < rect.top + rect.height / 2) return i;
    }
    return blockEls.length;
  }

  function handlePaletteDragOver(e: React.DragEvent) {
    const types = e.dataTransfer.types;
    const isAccepted =
      types.includes("text/block-type") ||
      types.includes("text/element-type") ||
      types.includes("text/image-src") ||
      types.includes("text/video-src");
    if (!isAccepted) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    setIsPaletteDragOver(true);
  }

  function handlePaletteDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsPaletteDragOver(false);

    // Text/shape element drop → add as overlay element at cursor position
    const elementType = e.dataTransfer.getData("text/element-type");
    if (elementType) {
      const blockEls = canvasContentRef.current
        ? Array.from(canvasContentRef.current.querySelectorAll("[data-block-id]"))
        : [];

      let targetEl: Element | null = null;
      for (const el of blockEls) {
        const r = el.getBoundingClientRect();
        if (e.clientY >= r.top && e.clientY <= r.bottom) { targetEl = el; break; }
      }
      if (!targetEl && blockEls.length > 0) {
        // Nearest block by vertical distance
        let minDist = Infinity;
        for (const el of blockEls) {
          const r = el.getBoundingClientRect();
          const dist = Math.min(Math.abs(e.clientY - r.top), Math.abs(e.clientY - r.bottom));
          if (dist < minDist) { minDist = dist; targetEl = el; }
        }
      }

      if (targetEl) {
        const blockId = targetEl.getAttribute("data-block-id")!;
        const blockRect = targetEl.getBoundingClientRect();
        const x = Math.max(0, Math.round(e.clientX - blockRect.left));
        const y = Math.max(0, Math.round(e.clientY - blockRect.top));

        const newEl: OverlayElement = {
          id: generateId(),
          type: elementType === "headline" ? "text" : "text",
          text: elementType === "headline" ? "見出しテキスト" : "本文テキストをここに入力",
        };
        const allBlocks = useEditorStore.getState().blocks;
        const targetBlock = allBlocks.find((b) => b.id === blockId);
        const initialColor = targetBlock ? getInitialTextColor(targetBlock) : "#1a1a1a";
        addOverlayElement(blockId, newEl);
        updateElementStyle(blockId, newEl.id, {
          offsetX: x,
          offsetY: y,
          color: initialColor,
          fontSize: elementType === "headline" ? 24 : 16,
          fontWeight: elementType === "headline" ? "bold" : "normal",
        });
        return;
      }
      // No blocks exist: fall through to create a new block
    }

    const afterIndex = getDropIndex(e.clientY);
    const insertArg = afterIndex - 1; // -1 means insert at beginning

    // Image drag-drop from panel thumbnail
    const imageSrc = e.dataTransfer.getData("text/image-src");
    if (imageSrc) {
      addBlock("image", insertArg, {
        src: imageSrc,
        alt: "画像",
        object_fit: "cover",
        height: 400,
        opacity: 1,
      });
      return;
    }

    // Video drag-drop from panel thumbnail
    const videoSrc = e.dataTransfer.getData("text/video-src");
    if (videoSrc) {
      addBlock("video", insertArg, {
        src: videoSrc,
        alt: "動画",
      });
      return;
    }

    // Generic block-type drop (text, blocks panel)
    const blockType = e.dataTransfer.getData("text/block-type") as BlockType;
    if (!blockType) return;
    if (blockType === "shape") {
      const shapeType = e.dataTransfer.getData("text/shape-type") as "rect" | "circle" | "triangle" | "arrow" | "divider";
      addBlock("shape", insertArg, shapeType ? { shape_type: shapeType } : undefined);
      return;
    }
    addBlock(blockType, insertArg);
  }

  // Click on canvas background deselects / exits editing
  const handleCanvasClick = useCallback(() => {
    if (editingBlockId) {
      setEditingBlock(null);
      setEditingElement(null);
    } else if (selectedBlockId) {
      selectBlock(null);
    }
  }, [editingBlockId, selectedBlockId, setEditingBlock, setEditingElement, selectBlock]);

  // Double-click on an element (data-el-id) starts per-element editing
  const handleCanvasDoubleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const elTarget = (e.target as HTMLElement).closest("[data-el-id]");
    if (elTarget) {
      const elementId = elTarget.getAttribute("data-el-id")!;
      const blockId = elTarget.getAttribute("data-el-block")!;
      const isOverlay = useEditorStore.getState().blocks
        .find((b) => b.id === blockId)
        ?.overlayElements?.some((el) => el.id === elementId);
      if (!isOverlay) {
        setEditingElement({ blockId, elementId });
      }
      selectBlock(blockId);
    }
  }, [setEditingElement, selectBlock]);

  // Mousedown on an element body starts a move-drag (threshold 5px)
  const handleElementMoveStart = useCallback((e: React.MouseEvent) => {
    if (editingBlockId) return;
    const elTarget = (e.target as HTMLElement).closest("[data-el-id]");
    if (!elTarget) return;

    const blockId = elTarget.getAttribute("data-el-block")!;
    const elementId = elTarget.getAttribute("data-el-id")!;
    const elementType = elTarget.getAttribute("data-el-type") as "text" | "image" | "shape";

    const startX = e.clientX;
    const startY = e.clientY;
    let hasMoved = false;

    const state = useEditorStore.getState();
    const block = state.blocks.find(b => b.id === blockId);
    const elStyles = (block?.content as { elementStyles?: Record<string, ElementStyle> } | undefined)?.elementStyles;
    const initOffsetX = elStyles?.[elementId]?.offsetX ?? 0;
    const initOffsetY = elStyles?.[elementId]?.offsetY ?? 0;

    function onMouseMove(me: MouseEvent) {
      const dx = me.clientX - startX;
      const dy = me.clientY - startY;
      if (!hasMoved && Math.hypot(dx, dy) < 5) return;
      if (!hasMoved) {
        hasMoved = true;
        setSelectedElement({ blockId, elementId, elementType });
        selectBlock(blockId);
        setIsDraggingElement(true);
        document.body.style.userSelect = "none";
        document.body.style.cursor = "move";
      }
      updateElementStyle(blockId, elementId, {
        offsetX: Math.round(initOffsetX + dx),
        offsetY: Math.round(initOffsetY + dy),
      });
    }

    function onMouseUp() {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
      setIsDraggingElement(false);
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
    }

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  }, [editingBlockId, updateElementStyle, setSelectedElement, selectBlock, setIsDraggingElement]);

  const viewportWidth = {
    pc: "100%",
    tab: "768px",
    sp: "390px",
  }[viewport];

  const sortedBlocks = [...blocks].sort((a, b) => a.order_index - b.order_index);
  const activeBlock = activeDragId ? blocks.find((b) => b.id === activeDragId) : null;

  return (
    <>
    <div
      className="flex-1 bg-gray-100 overflow-auto flex flex-col items-center py-6"
      onClick={handleCanvasClick}
      onDragOver={handlePaletteDragOver}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          setIsPaletteDragOver(false);
        }
      }}
      onDrop={handlePaletteDrop}
    >
      <div
        ref={canvasContentRef}
        className={`bg-white shadow-lg transition-all duration-300 ${isPaletteDragOver ? "ring-2 ring-blue-400 ring-offset-2" : ""}`}
        style={{ width: viewportWidth, maxWidth: "100%", minHeight: "600px" }}
        onDoubleClick={handleCanvasDoubleClick}
        onMouseDown={handleElementMoveStart}
        onClick={(e) => {
          e.stopPropagation();
          // Exit editing when clicking outside a contenteditable (covers the double-click → edit mode case)
          if (editingBlockId) {
            if ((e.target as HTMLElement).closest('[contenteditable="true"]')) return;
            setEditingBlock(null);
            setEditingElement(null);
            setSelectedElement(null);
            return;
          }
          const elTarget = (e.target as HTMLElement).closest("[data-el-id]");
          if (elTarget) {
            const elementId = elTarget.getAttribute("data-el-id")!;
            const blockId = elTarget.getAttribute("data-el-block")!;
            const elementType = elTarget.getAttribute("data-el-type") as "text" | "image" | "shape";
            setSelectedElement({ blockId, elementId, elementType });
            selectBlock(blockId);
            return;
          }
          setSelectedElement(null);
        }}
      >
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={sortedBlocks.map((b) => b.id)}
            strategy={verticalListSortingStrategy}
          >
            {sortedBlocks.map((block, idx) => (
              <div key={block.id} data-block-id={block.id}>
                {/* Drop zone line between blocks */}
                {activeDragId && activeDragId !== block.id && (
                  <DropZoneLine id={`drop-before-${block.id}`} />
                )}
                <SortableBlock
                  block={block}
                  selected={selectedBlockId === block.id}
                  isFirst={idx === 0}
                  isLast={idx === sortedBlocks.length - 1}
                  isDragActive={!!activeDragId}
                  onSelect={() => {
                    selectBlock(block.id);
                    // Exit editing on another block if clicking away
                    if (editingBlockId && editingBlockId !== block.id) {
                      setEditingBlock(null);
                    }
                  }}
                  onDoubleClick={() => {
                    selectBlock(block.id);
                  }}
                  onAddAfter={(type) => addBlock(type, blocks.findIndex((b) => b.id === block.id))}
                />
              </div>
            ))}
            {/* Drop zone after last block */}
            {activeDragId && sortedBlocks.length > 0 && (
              <DropZoneLine id="drop-after-last" />
            )}
          </SortableContext>

          {/* DragOverlay renders a floating copy of the dragged block */}
          <DragOverlay>
            {activeBlock ? (
              <div className="opacity-90 shadow-2xl ring-2 ring-blue-500 rounded">
                <BlockRenderer
                  block={activeBlock}
                  selected={false}
                  isEditing={false}
                  onClick={() => {}}
                  onDoubleClick={() => {}}
                />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>

        {blocks.length === 0 && (
          <div className="flex flex-col items-center justify-center h-96 text-gray-400 gap-4">
            <p className="text-lg">ブロックがありません</p>
            <p className="text-sm">左のパネルか下のボタンからブロックを追加してください</p>
            <div className="relative">
              <button
                onClick={() => setShowEmptyPopup((v) => !v)}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                <Plus size={16} />
                ブロックを追加
              </button>
              {showEmptyPopup && (
                <AddBlockPopup
                  onSelect={(type) => { addBlock(type); setShowEmptyPopup(false); }}
                  onClose={() => setShowEmptyPopup(false)}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
    <FloatingElementToolbar />
    <ResizeHandleOverlay />
    </>
  );
}
