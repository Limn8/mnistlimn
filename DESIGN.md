# Digit Lab

Visible title: MNIST 손글씨 이미지데이터 인식. Header has 제작: 경기이음온학교 임현우 above the title. Responsive header height grows for wrapped titles; creator remains visible on mobile.

Korean classroom handwriting exploration tool, not a marketing page. Data images are the primary visual assets.

## Research
Reference: Notion's restrained workspace hierarchy and flat separators; recombined for an interactive classroom. MNIST data/API: https://github.com/cazala/mnist. Concept imagery is unnecessary for a scientific canvas tool; real MNIST bitmaps establish the visual content. No external design research service configured.

## Tokens
Paper #f7f8fa, surface #ffffff, text #172023, secondary #59656b, line #dce2e5. Teal #087f79 for input and matches, rose #cd4e6b for reference-only pixels, pale teal #e7f5f1. Chart bars #accfc7. Monochrome MNIST images. Font system sans with Malgun Gothic fallback; 12/13/14/16/20/24/32/72px. Letter spacing 0. Spacing 4/8/12/16/20/24/32/40px.

## Geometry
1440px outer workspace maximum, 40px desktop page padding, 20px mobile. Header with experiment label. Flat two-column workspace (drawing 416px and results flexible), divided by line. Both sections have actual inner padding (drawing 24px, results 32px), never flush to the white band's edge. At 900px and below stack sections; mobile section inner padding 16px. Titles wrap rather than clipping. Canvas square, native 336px, responsive max 360px on stacked views. Radius 8px framed input and repeated reference items only.

## Primitives
Icon tool buttons 40px with hover title and aria labels. Native range input for stroke width. Segmented tabs for pixel views. Ranked result bars with label, similarity and vote counts. Real bitmap reference tiles activate comparison. 28x28 pixel views are magnified with nearest interpolation. Primary numbers in ink, teal for evidence, rose for mismatch.

## Interaction
Pointer events and capture support pen/touch/mouse. Worker comparison throttled to 100ms, revision IDs prevent stale cleared results and allow recent intermediate results while writing. Undo/redo at stroke boundaries, clear, MNIST sample selection, PNG export. Empty canvas has no guess; loading and data failure are explicit. No fabricated initial predictions.

## Accessibility
Keyboard-focus rings, labelled buttons/inputs/canvases, polite live region for prediction, text legend alongside color map. Sample mode provides a keyboard accessible alternative to drawing. Reduced motion removes transitions. Touch canvas prevents page scroll only within drawing area.

## Scientific Contract
All 60,000 original MNIST training examples from CVDF mirror, preserving original class counts. 10,000 original test examples excluded from reference pool; 40 per digit used for evaluation. Area-averaged resampling into centered 20px bounding box in 28px, center-of-mass alignment. Gzip download; Uint8 grayscale and binary views avoid expanded number arrays. Pixels above 0.2 become 1, others 0. Exact Hamming scan selects nearest 7; standard kNN library votes among them. Squared Euclidean distance on these binary vectors equals the Hamming mismatch count. Pixel agreement = (1 - distance / 784)*100, including background, not calibrated probability. Each digit's score uses its closest reference by Hamming distance. Colored difference pixels exactly match the mismatch count. Overlap is pixel evidence, not neural saliency or causal attribution.
## Validation
Browser QA captured 375/768/1280/3440px; drawing, touch, undo/redo, download, neighbor selection, mode switching and inner gutters. No horizontal overflow or browser errors. Hamming version evaluated on 40 examples per digit from original MNIST test split: 384/400 correct; this is not a guarantee for classroom handwriting. Native CSS/JS modules own input, normalization, matching and rendering separately. Data handling is local. Formal Lighthouse audit not performed; no score claims. Scientific values are deterministic distances, votes and binary pixel overlap.
