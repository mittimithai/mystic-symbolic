import React from "react";
import { SVGProps } from "react";
import { BBox } from "../vendor/bezier-js";
import { FILL_REPLACEMENT_COLOR, STROKE_REPLACEMENT_COLOR } from "./colors";
import { Specs } from "./specs";
import { VisibleSpecs } from "./visible-specs";

const DEFAULT_UNIFORM_STROKE_WIDTH = 1;

export type SvgSymbolData = {
  name: string;
  bbox: BBox;
  layers: SvgSymbolElement[];
  specs?: Specs;
};

export type SvgSymbolElement = (
  | {
      tagName: "g";
      props: SVGProps<SVGGElement>;
    }
  | {
      tagName: "path";
      props: SVGProps<SVGPathElement>;
    }
) & {
  children: SvgSymbolElement[];
};

export type SvgSymbolContext = {
  stroke: string;
  fill: string;
  showSpecs: boolean;
  uniformStrokeWidth?: number;
};

const DEFAULT_CONTEXT: SvgSymbolContext = {
  stroke: "#000000",
  fill: "#ffffff",
  showSpecs: false,
  uniformStrokeWidth: DEFAULT_UNIFORM_STROKE_WIDTH,
};

export function createSvgSymbolContext(
  ctx: Partial<SvgSymbolContext> = {}
): SvgSymbolContext {
  return {
    ...DEFAULT_CONTEXT,
    ...ctx,
  };
}

function getColor(
  ctx: SvgSymbolContext,
  color: string | undefined
): string | undefined {
  switch (color) {
    case STROKE_REPLACEMENT_COLOR:
      return ctx.stroke;
    case FILL_REPLACEMENT_COLOR:
      return ctx.fill;
  }
  return color;
}

function reactifySvgSymbolElement(
  ctx: SvgSymbolContext,
  el: SvgSymbolElement,
  key: number
): JSX.Element {
  let { fill, stroke, strokeWidth } = el.props;
  let vectorEffect;
  fill = getColor(ctx, fill);
  stroke = getColor(ctx, stroke);
  if (strokeWidth !== undefined && typeof ctx.uniformStrokeWidth === "number") {
    strokeWidth = ctx.uniformStrokeWidth;
    vectorEffect = "non-scaling-stroke";
  }
  return React.createElement(
    el.tagName,
    {
      ...el.props,
      id: undefined,
      vectorEffect,
      strokeWidth,
      fill,
      stroke,
      key,
    },
    el.children.map(reactifySvgSymbolElement.bind(null, ctx))
  );
}

export const SvgSymbolContent: React.FC<
  { data: SvgSymbolData } & SvgSymbolContext
> = (props) => {
  const d = props.data;

  return (
    <>
      {props.data.layers.map(reactifySvgSymbolElement.bind(null, props))}
      {props.showSpecs && d.specs && <VisibleSpecs specs={d.specs} />}
    </>
  );
};
