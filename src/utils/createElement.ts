/**
 * Tiny helpers to create DOM and SVG elements with attributes.
 */

const SVG_NS = "http://www.w3.org/2000/svg";

export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs: Record<string, string | number | boolean> = {},
  children: (Node | string)[] = []
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  applyAttrs(node, attrs);
  appendChildren(node, children);
  return node;
}

export function svg<K extends keyof SVGElementTagNameMap>(
  tag: K,
  attrs: Record<string, string | number | boolean> = {},
  children: (Node | string)[] = []
): SVGElementTagNameMap[K] {
  const node = document.createElementNS(SVG_NS, tag) as SVGElementTagNameMap[K];
  applyAttrs(node, attrs);
  appendChildren(node, children);
  return node;
}

function applyAttrs(
  node: Element,
  attrs: Record<string, string | number | boolean>
): void {
  for (const key of Object.keys(attrs)) {
    const value = attrs[key];
    if (value === false || value === null || value === undefined) continue;
    if (key === "class" || key === "className") {
      node.setAttribute("class", String(value));
    } else if (key === "style") {
      (node as HTMLElement).setAttribute("style", String(value));
    } else {
      node.setAttribute(key, String(value));
    }
  }
}

function appendChildren(node: Element, children: (Node | string)[]): void {
  for (const child of children) {
    if (typeof child === "string") {
      node.appendChild(document.createTextNode(child));
    } else {
      node.appendChild(child);
    }
  }
}

export function clearChildren(node: Element): void {
  while (node.firstChild) {
    node.removeChild(node.firstChild);
  }
}
