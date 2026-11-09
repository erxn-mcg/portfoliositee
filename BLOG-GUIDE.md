# Add a note to the Pinboard

Keep adding ordinary HTML files to this repository. GitHub Pages builds the note pages and updates the Pinboard automatically. No admin, password, CMS, or separate hosting is needed.

## Add your first note

1. Open [`_templates/note.html`](_templates/note.html) and copy its contents.
2. In GitHub, choose **Add file → Create new file**. Name it `_notes/my-new-thought.html` (use lowercase words separated by hyphens).
3. Paste the template and change the title, date, topic, and short introduction at the top. Keep the two `---` lines: they mark the information used on your card.
4. Replace the paragraphs below the second `---` with your writing. Each paragraph goes between `<p>` and `</p>`.
5. Commit the file to the branch used by GitHub Pages. Once publishing finishes, your note will appear at `/blog/my-new-thought/` and on the Pinboard, newest first.

You do not need to edit `blog/index.html` or `blog/notes.json`. New topics become filter buttons automatically. Keep a note's filename unchanged after sharing its link.

## Add pictures

Upload your images using **Add file → Upload files** in `images/notes/`.

For a cover image on the card and at the top of the note, change the template's two image lines:

```yaml
image: "/images/notes/my-photo.jpg"
image_alt: "A short description of the photo"
```

To put more images within your writing, use the optional `<figure>` example in the template. JPG, PNG, WebP, and GIF covers work. Leave `image: ""` for a text-only note.

## Write and edit

Use `<strong>bold text</strong>`, `<em>italic text</em>`, `<h2>A heading</h2>`, and `<a href="https://example.com">link text</a>` as needed. Write `&amp;` for an ampersand in HTML text. Keep quoted titles and introductions on one line; escape double quotes inside them as `\"`.

To edit a note, open its file in `_notes`, use the pencil button, and commit the changes. To remove it from the blog, delete that file and commit. Files and their history in this public repository are public; keep private drafts elsewhere.

## One-time publishing check

This uses GitHub Pages' built-in Jekyll support. In **Repository Settings → Pages**, use **Deploy from a branch**, with the production branch and **/(root)** selected. If it is already configured this way, leave it as it is. Keep the existing custom domain and HTTPS settings. No extra account or package installation is needed to write notes.

The existing PR is a draft. Merging it into the publishing branch will update the live site. The template in `_templates` is excluded from publication, so no sample writing appears on the blog.
