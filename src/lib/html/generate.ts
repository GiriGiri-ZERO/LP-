import type {
  Block,
  Theme,
  HeroContent,
  HeadlineContent,
  BodyContent,
  CTAContent,
  TestimonialContent,
  FAQContent,
  FeatureContent,
  PriceContent,
  FooterContent,
} from "@/types";

const DEFAULT_THEME: Theme = {
  primaryColor: "#e94560",
  secondaryColor: "#1a1a2e",
  accentColor: "#0f3460",
  backgroundColor: "#ffffff",
  textColor: "#1a1a1a",
  fontHeading: "Noto Sans JP, sans-serif",
  fontBody: "Noto Sans JP, sans-serif",
};

export function generateHTML(blocks: Block[], theme: Partial<Theme> = {}): string {
  const t = { ...DEFAULT_THEME, ...theme };
  const blocksHtml = blocks
    .sort((a, b) => a.order_index - b.order_index)
    .map((b) => renderBlock(b, t))
    .join("\n");

  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>LP</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700&display=swap" rel="stylesheet" />
  <style>
${generateCSS(blocks, theme)}
  </style>
</head>
<body>
${blocksHtml}
</body>
</html>`;
}

export function generateCSS(blocks: Block[], theme: Partial<Theme> = {}): string {
  const t = { ...DEFAULT_THEME, ...theme };
  return `  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: ${t.fontBody}; color: ${t.textColor}; background: ${t.backgroundColor}; }
  h1, h2, h3, h4 { font-family: ${t.fontHeading}; }
  .container { max-width: 1100px; margin: 0 auto; padding: 0 24px; }

  /* Hero */
  .block-hero { padding: 80px 24px; text-align: center; }
  .block-hero h1 { font-size: 2.5rem; font-weight: 700; margin-bottom: 16px; line-height: 1.3; }
  .block-hero p { font-size: 1.2rem; margin-bottom: 32px; opacity: 0.85; }
  .btn-primary { display: inline-block; padding: 16px 40px; border-radius: 4px; font-weight: 700; font-size: 1.1rem; text-decoration: none; background: ${t.primaryColor}; color: #fff; cursor: pointer; border: none; }

  /* Headline */
  .block-headline { padding: 48px 24px; }
  .block-headline h2 { font-size: 2rem; font-weight: 700; }

  /* Body */
  .block-body { padding: 32px 24px; max-width: 800px; margin: 0 auto; line-height: 1.8; }

  /* CTA */
  .block-cta { padding: 64px 24px; text-align: center; }
  .block-cta h2 { font-size: 1.8rem; font-weight: 700; margin-bottom: 24px; }
  .block-cta p { margin-bottom: 32px; font-size: 1.1rem; }

  /* Testimonials */
  .block-testimonial { padding: 64px 24px; }
  .testimonial-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; max-width: 1100px; margin: 0 auto; }
  .testimonial-card { background: #f9f9f9; border-radius: 8px; padding: 24px; }
  .testimonial-card blockquote { font-size: 1rem; line-height: 1.7; margin-bottom: 16px; }
  .testimonial-card cite { font-weight: 700; font-style: normal; }

  /* FAQ */
  .block-faq { padding: 64px 24px; max-width: 800px; margin: 0 auto; }
  .faq-item { border-bottom: 1px solid #e5e5e5; padding: 20px 0; }
  .faq-item h3 { font-size: 1.1rem; font-weight: 700; margin-bottom: 8px; color: ${t.primaryColor}; }
  .faq-item p { line-height: 1.7; color: #555; }

  /* Features */
  .block-feature { padding: 64px 24px; }
  .feature-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 32px; max-width: 1100px; margin: 0 auto; }
  .feature-item { text-align: center; padding: 24px; }
  .feature-item .icon { font-size: 2.5rem; margin-bottom: 16px; display: block; }
  .feature-item h3 { font-size: 1.2rem; font-weight: 700; margin-bottom: 8px; }
  .feature-item p { color: #555; line-height: 1.7; }

  /* Price */
  .block-price { padding: 64px 24px; }
  .price-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 24px; max-width: 1100px; margin: 0 auto; }
  .price-card { border: 2px solid #e5e5e5; border-radius: 12px; padding: 32px 24px; text-align: center; }
  .price-card.featured { border-color: ${t.primaryColor}; transform: scale(1.03); }
  .price-card .price-name { font-size: 1.2rem; font-weight: 700; margin-bottom: 16px; }
  .price-card .price-amount { font-size: 2.5rem; font-weight: 700; color: ${t.primaryColor}; }
  .price-card .price-period { font-size: 0.9rem; color: #888; }
  .price-card ul { list-style: none; margin: 24px 0; text-align: left; }
  .price-card ul li { padding: 6px 0; }
  .price-card ul li::before { content: "✓ "; color: ${t.primaryColor}; font-weight: 700; }

  /* Footer */
  .block-footer { padding: 32px 24px; background: ${t.secondaryColor}; color: #fff; text-align: center; }
  .block-footer p { font-size: 0.9rem; opacity: 0.7; margin-top: 8px; }

  @media (max-width: 768px) {
    .block-hero h1 { font-size: 1.8rem; }
    .block-hero { padding: 60px 16px; }
  }`;
}

function renderBlock(block: Block, theme: Theme): string {
  switch (block.block_type) {
    case "hero":
      return renderHero(block.content as HeroContent, theme);
    case "headline":
      return renderHeadline(block.content as HeadlineContent);
    case "body":
      return renderBody(block.content as BodyContent);
    case "cta":
      return renderCTA(block.content as CTAContent, theme);
    case "testimonial":
      return renderTestimonial(block.content as TestimonialContent);
    case "faq":
      return renderFAQ(block.content as FAQContent);
    case "feature":
      return renderFeature(block.content as FeatureContent);
    case "price":
      return renderPrice(block.content as PriceContent, theme);
    case "footer":
      return renderFooter(block.content as FooterContent);
    default:
      return "";
  }
}

function renderHero(c: HeroContent, _theme: Theme): string {
  return `<section class="block-hero" style="background:${c.background_color ?? "#1a1a2e"};color:${c.text_color ?? "#fff"}">
  <h1>${escapeHtml(c.headline)}</h1>
  <p>${escapeHtml(c.subheadline)}</p>
  <a href="${c.cta_url ?? "#"}" class="btn-primary">${escapeHtml(c.cta_text)}</a>
</section>`;
}

function renderHeadline(c: HeadlineContent): string {
  const tag = `h${c.level}`;
  const style = [
    c.color ? `color:${c.color}` : "",
    c.align ? `text-align:${c.align}` : "",
  ]
    .filter(Boolean)
    .join(";");
  return `<section class="block-headline">
  <div class="container">
    <${tag} style="${style}">${escapeHtml(c.text)}</${tag}>
  </div>
</section>`;
}

function renderBody(c: BodyContent): string {
  return `<section class="block-body" style="text-align:${c.align ?? "left"}">
  ${c.html}
</section>`;
}

function renderCTA(c: CTAContent, theme: Theme): string {
  return `<section class="block-cta" style="background:${c.background_color ?? theme.backgroundColor}">
  <div class="container">
    ${c.headline ? `<h2>${escapeHtml(c.headline)}</h2>` : ""}
    ${c.body ? `<p>${escapeHtml(c.body)}</p>` : ""}
    <a href="${c.button_url ?? "#"}" class="btn-primary" style="background:${c.button_color ?? theme.primaryColor}">${escapeHtml(c.button_text)}</a>
  </div>
</section>`;
}

function renderTestimonial(c: TestimonialContent): string {
  const items = c.items
    .map(
      (t) => `<div class="testimonial-card">
      <blockquote>"${escapeHtml(t.quote)}"</blockquote>
      <cite>${escapeHtml(t.author)}${t.role ? ` / ${escapeHtml(t.role)}` : ""}</cite>
    </div>`
    )
    .join("\n    ");
  return `<section class="block-testimonial">
  <div class="testimonial-grid">
    ${items}
  </div>
</section>`;
}

function renderFAQ(c: FAQContent): string {
  const items = c.items
    .map(
      (f) => `<div class="faq-item">
      <h3>${escapeHtml(f.question)}</h3>
      <p>${escapeHtml(f.answer)}</p>
    </div>`
    )
    .join("\n    ");
  return `<section class="block-faq">
  ${items}
</section>`;
}

function renderFeature(c: FeatureContent): string {
  const items = c.items
    .map(
      (f) => `<div class="feature-item">
      ${f.icon ? `<span class="icon">${f.icon}</span>` : ""}
      <h3>${escapeHtml(f.title)}</h3>
      <p>${escapeHtml(f.description)}</p>
    </div>`
    )
    .join("\n    ");
  return `<section class="block-feature">
  ${c.headline ? `<h2 style="text-align:center;margin-bottom:40px">${escapeHtml(c.headline)}</h2>` : ""}
  <div class="feature-grid">
    ${items}
  </div>
</section>`;
}

function renderPrice(c: PriceContent, theme: Theme): string {
  const items = c.items
    .map(
      (p) => `<div class="price-card${p.is_featured ? " featured" : ""}">
      <div class="price-name">${escapeHtml(p.name)}</div>
      <div>
        <span class="price-amount">${escapeHtml(p.price)}</span>
        ${p.period ? `<span class="price-period">${escapeHtml(p.period)}</span>` : ""}
      </div>
      <ul>
        ${p.features.map((f) => `<li>${escapeHtml(f)}</li>`).join("")}
      </ul>
      <a href="#" class="btn-primary" style="background:${theme.primaryColor}">${escapeHtml(p.cta_text)}</a>
    </div>`
    )
    .join("\n    ");
  return `<section class="block-price">
  ${c.headline ? `<h2 style="text-align:center;margin-bottom:40px">${escapeHtml(c.headline)}</h2>` : ""}
  <div class="price-grid">
    ${items}
  </div>
</section>`;
}

function renderFooter(c: FooterContent): string {
  const links = c.links
    ?.map((l) => `<a href="${l.url}" style="color:#aaa;text-decoration:none;margin:0 8px">${escapeHtml(l.label)}</a>`)
    .join("") ?? "";
  return `<footer class="block-footer">
  ${c.company_name ? `<div style="font-size:1.1rem;font-weight:700">${escapeHtml(c.company_name)}</div>` : ""}
  ${links ? `<div style="margin:8px 0">${links}</div>` : ""}
  ${c.copyright ? `<p>${escapeHtml(c.copyright)}</p>` : ""}
</footer>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
