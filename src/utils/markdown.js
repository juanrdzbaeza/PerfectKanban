import MarkdownIt from 'markdown-it';
import taskLists from 'markdown-it-task-lists';
import DOMPurify from 'dompurify';

const md = new MarkdownIt({ html: true, linkify: true, typographer: true }).use(taskLists);

export function renderMarkdown(mdText) {
  const raw = md.render(mdText || '');
  return DOMPurify.sanitize(raw);
}

