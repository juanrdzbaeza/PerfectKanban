import React from 'react';
import { render } from '@testing-library/react';
import { renderMarkdown } from '../utils/markdown';

describe('renderMarkdown sanitization', () => {
  test('removes script tags and dangerous attributes', () => {
    const malicious = 'Hello<script>window.hacked = true</script><img src=x onerror="alert(1)"/> <a href="javascript:alert(2)">click</a>';
    const html = renderMarkdown(malicious);
    const { container } = render(<div dangerouslySetInnerHTML={{ __html: html }} />);

    // Ensure the script tag and inline handlers are not present
    expect(container.querySelector('script')).toBeNull();
    const imgs = container.querySelectorAll('img');
    imgs.forEach((img) => {
      expect(img.getAttribute('onerror')).toBeNull();
    });
    const anchors = container.querySelectorAll('a');
    anchors.forEach((a) => {
      const href = a.getAttribute('href') || '';
      expect(href.startsWith('javascript:')).toBe(false);
    });
  });
});
