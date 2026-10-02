# Digit Lab

Visible title: MNIST 손글씨 이미지데이터 인식. Header has 제작: 경기이음온학교 임현우 above the title. Responsive header height grows for wrapped titles; creator remains visible on mobile.

Korean classroom handwriting exploration tool, not a marketing page. Data images are the primary visual assets.

## Research
Reference: Notion's restrained workspace hierarchy and flat separators; recombined for an interactive classroom. MNIST data/API: https://github.com/cazala/mnist. Concept imagery is unnecessary for a scientific canvas tool; real MNIST bitmaps establish the visual content. No external design research service configured.

## Tokens
Paper #f7f8fa, surface #ffffff, text #172023, secondary #59656b, line #dce2e5. Teal #087f79 for input and matches, rose #cd4e6b for reference-only pixels, pale teal #e7f5f1. Chart bars #accfc7. Monochrome MNIST images. Font system sans with Malgun Gothic fallback; 12/13/14/16/20/24/32/72px. Letter spacing 0. Spacing 4/8/12/16/20/24/32/40px.

## Geometry
1200px workspace, 40px desktop padding, 20px mobile. Header with experiment label. Flat two-column workspace (drawing 400px and results flexible), divided by line. Mobile stacks input and results. Canvas square, native 336px, responsive max 360px. Radius 8px framed input and repeated reference items only.

## Primitives
Icon tool buttons 40px with hover title and aria labels. Native range input for stroke width. Segmented tabs for pixel views. Ranked result bars with label, similarity and vote counts. Real bitmap reference tiles activate comparison. 28x28 pixel views are magnified with nearest interpolation. Primary numbers in ink, teal for evidence, rose for mismatch.

## Interaction
Pointer events and capture support pen/touch/mouse. Worker comparison throttled to 100ms, revision IDs prevent stale cleared results and allow recent intermediate results while writing. Undo/redo at stroke boundaries, clear, MNIST sample selection, PNG export. Empty canvas has no guess; loading and data failure are explicit. No fabricated initial predictions.

## Accessibility
Keyboard-focus rings, labelled buttons/inputs/canvases, polite live region for prediction, text legend alongside color map. Sample mode provides a keyboard accessible alternative to drawing. Reduced motion removes transitions. Touch canvas prevents page scroll only within drawing area.

## Scientific Contract
All 60,000 original MNIST training examples from CVDF mirror, preserving original class counts. 10,000 original test examples excluded from reference pool; 40 per digit used for evaluation. Area-averaged resampling into centered 20px bounding box in 28px, center-of-mass alignment. Gzip download; Uint8 pixel views avoid expanded number arrays. Exact Euclidean scan selects nearest 7; standard kNN library votes among them. Shape similarity = max(0, 1 - distance / sqrt(input energy + reference energy))*100, not calibrated probability. Each digit's score uses its closest reference by Euclidean distance. Overlap is pixel evidence, not neural saliency or causal attribution.
## Validation
Browser QA captured 375/768/1280px; drawing, touch, undo/redo, download, neighbor selection, mode switching. No horizontal overflow or browser errors. Full-data version evaluated on 40 examples per digit from original MNIST test split: 377/400 correct; not directly comparable with the earlier different test pool. Native CSS/JS modules own input, normalization, matching and rendering separately. Data handling is local. Formal Lighthouse audit not performed; no score claims. Scientific values are deterministic distances, votes and binary pixel overlap.
