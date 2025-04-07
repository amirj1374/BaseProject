export function addText(
  doc: any,
  text: string,
  options: {
    top: number;
    left: number;
    maxWidth?: number;
    maxHeight?: number;
    align?: 'right' | 'center' | 'left';
    color?: { r: number; g: number; b: number };
  }
) {
  if (options.color) {
    doc.setTextColor(options.color.r, options.color.g, options.color.b);
  }
  doc.text(options.maxWidth ? doc.splitTextToSize(text, options?.maxWidth) : text, options.left, options.top + 6, {
    align: options.align ?? 'right'
  });
  if (options.color) {
    doc.setTextColor(0, 0, 0);
  }
}

export function addImage(
  doc: any,
  imgBase64: string,
  options: { width?: number; height?: number; top?: number; left?: number; format?: string } = { format: 'PNG' }
) {
  doc.addImage(imgBase64, options.format, options.left || 0, options.top || 0, options.width || 0, options.height || 0);
}
