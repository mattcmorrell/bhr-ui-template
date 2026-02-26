declare module 'd3-hierarchy' {
  export interface HierarchyNode<Datum> {
    data: Datum;
    depth: number;
    height: number;
    parent: HierarchyNode<Datum> | null;
    children?: HierarchyNode<Datum>[];
  }

  export interface HierarchyPointNode<Datum> extends HierarchyNode<Datum> {
    x: number;
    y: number;
    parent: HierarchyPointNode<Datum> | null;
    children?: HierarchyPointNode<Datum>[];
  }

  export interface TreeLayout<Datum> {
    (root: HierarchyNode<Datum>): HierarchyPointNode<Datum>;
    nodeSize(size: [number, number]): TreeLayout<Datum>;
    separation(
      separation: (a: HierarchyPointNode<Datum>, b: HierarchyPointNode<Datum>) => number,
    ): TreeLayout<Datum>;
  }

  export function hierarchy<Datum>(data: Datum): HierarchyNode<Datum>;
  export function tree<Datum>(): TreeLayout<Datum>;
}
