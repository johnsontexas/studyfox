// Website views that only set root.innerHTML (legal pages, the formula sheet) can be reused as-is:
// run them against a stand-in element and keep the HTML they produce.
export function captureView(view: (root: any) => void): string {
  const root = { innerHTML: '', addEventListener() {}, querySelector: () => null, querySelectorAll: () => [] };
  view(root);
  return root.innerHTML;
}
