export type Plan = "free" | "pro" | "team";
export type DocType = "lp" | "sales_letter" | "website" | "email" | "other";
export type BlockType =
  | "hero"
  | "headline"
  | "body"
  | "cta"
  | "testimonial"
  | "faq"
  | "feature"
  | "price"
  | "footer"
  | "image";
export type MemberRole = "viewer" | "editor" | "admin";
export type Tone = "professional" | "friendly" | "luxury" | "urgent";
export type Viewport = "pc" | "sp" | "tab";
export type EditorTab = "preview" | "html" | "css";

export interface ElementStyle {
  color?: string;
  backgroundColor?: string;
  borderColor?: string;
  borderRadius?: number;
  fontSize?: number;
  fontWeight?: "normal" | "bold";
  fontStyle?: "normal" | "italic";
  textAlign?: "left" | "center" | "right";
}

export interface SelectedElement {
  blockId: string;
  elementId: string;
  elementType: "text" | "shape";
}

export interface EditingElement {
  blockId: string;
  elementId: string;
}

export interface Theme {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  fontHeading: string;
  fontBody: string;
}

export interface ProductContext {
  product_name: string;
  product_description: string;
  target_audience: string;
  unique_selling_points: string[];
  price: string;
  tone: Tone;
}

export interface Block {
  id: string;
  document_id: string;
  block_type: BlockType;
  order_index: number;
  content: BlockContent;
  is_ai_generated: boolean;
  created_at: string;
  updated_at: string;
}

export type BlockContent =
  | HeroContent
  | HeadlineContent
  | BodyContent
  | CTAContent
  | TestimonialContent
  | FAQContent
  | FeatureContent
  | PriceContent
  | FooterContent
  | ImageContent;

export interface HeroContent {
  headline: string;
  subheadline: string;
  cta_text: string;
  cta_url?: string;
  background_color?: string;
  text_color?: string;
  button_color?: string;
  image_url?: string;
  elementStyles?: Record<string, ElementStyle>;
}

export interface HeadlineContent {
  text: string;
  level: 1 | 2 | 3 | 4;
  align?: "left" | "center" | "right";
  color?: string;
  elementStyles?: Record<string, ElementStyle>;
}

export interface BodyContent {
  html: string;
  align?: "left" | "center" | "right";
  elementStyles?: Record<string, ElementStyle>;
}

export interface CTAContent {
  headline?: string;
  body?: string;
  button_text: string;
  button_url?: string;
  button_color?: string;
  background_color?: string;
  elementStyles?: Record<string, ElementStyle>;
}

export interface TestimonialContent {
  items: Array<{
    quote: string;
    author: string;
    role?: string;
    avatar_url?: string;
    rating?: number;
  }>;
  elementStyles?: Record<string, ElementStyle>;
}

export interface FAQContent {
  items: Array<{
    question: string;
    answer: string;
  }>;
  elementStyles?: Record<string, ElementStyle>;
}

export interface FeatureContent {
  headline?: string;
  items: Array<{
    title: string;
    description: string;
    icon?: string;
  }>;
  elementStyles?: Record<string, ElementStyle>;
}

export interface PriceContent {
  headline?: string;
  items: Array<{
    name: string;
    price: string;
    period?: string;
    features: string[];
    cta_text: string;
    is_featured?: boolean;
  }>;
  elementStyles?: Record<string, ElementStyle>;
}

export interface FooterContent {
  company_name?: string;
  copyright?: string;
  links?: Array<{ label: string; url: string }>;
  elementStyles?: Record<string, ElementStyle>;
}

export interface ImageContent {
  src: string;
  alt: string;
  object_fit?: "cover" | "contain" | "fill";
  height?: number;
  border_radius?: number;
  opacity?: number;
  elementStyles?: Record<string, ElementStyle>;
}

export interface Document {
  id: string;
  project_id: string;
  title: string;
  doc_type: DocType;
  product_context: ProductContext;
  theme: Theme;
  blocks?: Block[];
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  owner_id: string;
  name: string;
  description?: string;
  thumbnail_url?: string;
  created_at: string;
  updated_at: string;
}

export interface GenerateRequest {
  doc_type: DocType;
  product_context: ProductContext;
  sections: BlockType[];
}

export interface SSEEvent {
  type: "block_start" | "delta" | "block_end" | "done" | "error";
  block_type?: BlockType;
  content?: string;
  block_id?: string;
  message?: string;
}
