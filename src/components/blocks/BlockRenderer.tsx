"use client";

import type { Block } from "@/types";
import { HeroBlock } from "./HeroBlock";
import { HeadlineBlock } from "./HeadlineBlock";
import { BodyBlock } from "./BodyBlock";
import { CTABlock } from "./CTABlock";
import { FeatureBlock } from "./FeatureBlock";
import { TestimonialBlock } from "./TestimonialBlock";
import { FAQBlock } from "./FAQBlock";
import { PriceBlock } from "./PriceBlock";
import { FooterBlock } from "./FooterBlock";
import { ImageBlock } from "./ImageBlock";
import { VideoBlock } from "./VideoBlock";
import type {
  HeroContent,
  HeadlineContent,
  BodyContent,
  CTAContent,
  FeatureContent,
  TestimonialContent,
  FAQContent,
  PriceContent,
  FooterContent,
  ImageContent,
  VideoContent,
} from "@/types";

interface Props {
  block: Block;
  selected: boolean;
  isEditing: boolean;
  onClick: () => void;
  onDoubleClick: () => void;
}

export function BlockRenderer({ block, selected, isEditing, onClick, onDoubleClick }: Props) {
  return (
    <div
      className="relative group cursor-pointer"
      onClick={onClick}
      onDoubleClick={onDoubleClick}
    >
      {renderBlock(block, selected, isEditing)}
      <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <span className="bg-black/60 text-white text-xs px-2 py-0.5 rounded">
          {block.block_type}
        </span>
      </div>
      {/* Hint shown when selected but not editing */}
      {selected && !isEditing && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 pointer-events-none">
          <span className="bg-black/60 text-white text-xs px-2 py-0.5 rounded whitespace-nowrap">
            ダブルクリックで編集
          </span>
        </div>
      )}
    </div>
  );
}

function renderBlock(block: Block, selected: boolean, isEditing: boolean) {
  const props = { blockId: block.id, selected, isEditing };
  switch (block.block_type) {
    case "hero":
      return <HeroBlock {...props} content={block.content as HeroContent} />;
    case "headline":
      return <HeadlineBlock {...props} content={block.content as HeadlineContent} />;
    case "body":
      return <BodyBlock {...props} content={block.content as BodyContent} />;
    case "cta":
      return <CTABlock {...props} content={block.content as CTAContent} />;
    case "feature":
      return <FeatureBlock {...props} content={block.content as FeatureContent} />;
    case "testimonial":
      return <TestimonialBlock {...props} content={block.content as TestimonialContent} />;
    case "faq":
      return <FAQBlock {...props} content={block.content as FAQContent} />;
    case "price":
      return <PriceBlock {...props} content={block.content as PriceContent} />;
    case "footer":
      return <FooterBlock {...props} content={block.content as FooterContent} />;
    case "image":
      return <ImageBlock {...props} content={block.content as ImageContent} />;
    case "video":
      return <VideoBlock {...props} content={block.content as VideoContent} />;
    default:
      return (
        <div className="p-8 bg-gray-100 text-gray-400 text-center">
          Unknown block type: {block.block_type}
        </div>
      );
  }
}
