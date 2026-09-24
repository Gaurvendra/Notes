# Extracted text

Raw text layer of each PDF (PyMuPDF `page.get_text()`), handwriting as recognised by the PDF's own OCR layer.
It is noisy and **omits code screenshots**, so always check the rendered pages for code and diagrams.

| Note | Text layer | Visual content to check |
|---|---|---|
| 01, 02, 04 | yes | hand-drawn diagrams |
| 06 | yes | code screenshots p1, p3 |
| 07-08 | yes | code screenshots p1, p3, p5, p8 |
| 09 | yes | code screenshot p2; memory/GC diagrams on most pages |
| 12-13 | yes (handwritten parts) | code screenshots on every page |
| 14-15 | **none** (2 very tall images: 1920×14400 and 1920×3495 px) | everything; slice the images to read them |
| 16 | **none** (1 tall image: 1920×4990 px) | everything; slice the image to read it |
| 17, 18 | **none** (1 tall image each: 1920×11202 / 1920×14168 px) | everything → see `../transcripts/` |
| 19, 21 | **none** (2 tall images each) | everything → see `../transcripts/` |
| 20 | yes (handwritten) | IDE screenshots on p2–6, p9–11; precedence table p11 |

How to read the tall-image notes (14-15, 16): extract the embedded images with PyMuPDF (`pymupdf.Pixmap(doc, xref)`),
then slice them into ~1250 px strips with Pillow and view each strip; crop small regions at full resolution when the
text is tiny. See `project-plan/CONTEXT.md` §5.
