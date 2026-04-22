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
} from "@/types";

interface Props {
  block: Block;
  selected: boolean;
  onClick: () => void;
}

export function BlockRenderer({ block, selected, onClick }: Props) {
  return (
    <div className="relative group cursor-pointer" onClick={onClick}>
      {renderBlock(block, selected)}
      <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="bg-black/60 text-white text-xs px-2 py-0.5 rounded">
          {block.block_type}
        </span>
      </div>
    </div>
  );
}

function renderBlock(block: Block, selected: boolean) {
  const props = { blockId: block.id, selected };
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
    default:
      return (
        <div className="p-8 bg-gray-100 text-gray-400 text-center">
          Unknown block type: {block.block_type}
        </div>
      );
  }
}
