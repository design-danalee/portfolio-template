// In-place editable text. Commits on blur only (never on keystroke), so no
// re-render fires while typing and the caret never jumps. When read-only or
// not focused it simply renders the value.
import { html, escapeHtml } from "@/lib.js";

export function EditableText({
  tag = "span",
  value,
  editable,
  onCommit,
  class: className = "",
  placeholder = "",
}) {
  const props = {
    class:
      className +
      (editable ? " ce-editable" : "") +
      (editable && !value ? " ce-empty" : ""),
    dangerouslySetInnerHTML: { __html: escapeHtml(value || "") },
  };
  if (editable) {
    props.contenteditable = "plaintext-only";
    props.spellcheck = "false";
    props["data-placeholder"] = placeholder;
    props.onBlur = (e) => {
      const text = e.currentTarget.innerText.replace(/\n$/, "");
      if (text !== (value || "")) onCommit(text);
    };
    // Enter should not submit anything; allow newlines for body text.
    props.onKeyDown = (e) => {
      if (e.key === "Enter" && !e.shiftKey && tag !== "textarea") {
        // single-line-ish fields: blur on Enter for headings/taglines
        if (props["data-single"]) {
          e.preventDefault();
          e.currentTarget.blur();
        }
      }
    };
  }
  return html`<${tag} ...${props} />`;
}
