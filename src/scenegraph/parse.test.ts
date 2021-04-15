import { parse, parseLayer } from "./parse";

import { BaseSpec } from "../vega-lite/spec/base";
import { Colors } from "../helpers";
import { TopLevelSpec } from "../vega-lite/spec";

test("simple case", () => {
  const input: TopLevelSpec = {
    data: { values: [{ date: new Date(2021, 3, 15), price: 100 }] },
    vconcat: [
      {
        mark: "bar",
        encoding: {
          x: { field: "date", type: "temporal" },
          y: { field: "price", type: "quantitative" },
        },
      },
    ],
  };

  const scenegraph = parse(input, 10, 0);

  expect(scenegraph).toHaveProperty("panels");
  expect(scenegraph?.panels).toHaveLength(1);
});

test("candlestick chart with study", () => {
  const input: TopLevelSpec = {
    data: {
      values: [
        {
          date: new Date(2021, 3, 15),
          low: 100,
          high: 100,
          open: 100,
          close: 100,
        },
      ],
    },
    vconcat: [
      {
        encoding: {
          x: {
            field: "date",
            type: "temporal",
          },
          y: {
            type: "quantitative",
          },
          color: {
            condition: {
              test: { field: "open", lt: "close" },
              value: Colors.GREEN,
            },
            value: Colors.RED,
          },
        },
        layer: [
          {
            name: "wick",
            mark: "rule",
            encoding: { y: { field: "low" }, y2: { field: "high" } },
          },
          {
            name: "candle",
            mark: "bar",
            encoding: {
              y: { field: "open" },
              y2: { field: "close" },
              fill: {
                condition: {
                  test: { field: "open", lt: "close" },
                  value: Colors.GREEN_DARK,
                },
                value: Colors.RED,
              },
              stroke: {
                condition: {
                  test: { field: "open", lt: "close" },
                  value: Colors.GREEN,
                },
                value: Colors.RED,
              },
            },
          },
          {
            data: {
              values: [{ max: 3100, min: 3000 }],
            },
            layer: [
              {
                mark: "rule",
                encoding: { y: { field: "max" }, color: { value: "green" } },
              },
              {
                mark: "rule",
                encoding: { y: { field: "min" }, color: { value: "red" } },
              },
            ],
          },
        ],
      },
      {
        name: "study",
        mark: "bar",
        encoding: {
          x: { field: "date", type: "temporal" },
          y: { field: "volume", type: "quantitative" },
        },
      },
    ],
  };

  const scenegraph = parse(input, 10, 0);

  expect(scenegraph).toHaveProperty("panels");
  expect(scenegraph?.panels).toHaveLength(2);
  expect(scenegraph?.panels[0].data).toHaveLength(4);
});

test("recursively parse a layer", () => {
  const input: TopLevelSpec = {
    layer: [
      {
        data: {
          values: [
            {
              date: new Date(2020, 2, 15),
              low: 90,
              open: 100,
              close: 110,
              high: 120,
            },
          ],
        },
        encoding: {
          x: {
            field: "date",
            type: "temporal",
          },
          y: {
            type: "quantitative",
          },
          color: {
            condition: {
              test: { field: "open", lt: "close" },
              value: Colors.GREEN,
            },
            value: Colors.RED,
          },
        },
        layer: [
          {
            name: "wick",
            mark: "rule",
            encoding: { y: { field: "low" }, y2: { field: "high" } },
          },
          {
            name: "candle",
            mark: "bar",
            encoding: {
              y: { field: "open" },
              y2: { field: "close" },
              fill: {
                condition: {
                  test: { field: "open", lt: "close" },
                  value: Colors.GREEN_DARK,
                },
                value: Colors.RED,
              },
              stroke: {
                condition: {
                  test: { field: "open", lt: "close" },
                  value: Colors.GREEN,
                },
                value: Colors.RED,
              },
            },
          },
        ],
      },
      {
        data: {
          values: [{ max: 3100, min: 3000 }],
        },
        layer: [
          {
            mark: "rule",
            encoding: { y: { field: "max" }, color: { value: "green" } },
          },
          {
            mark: "rule",
            encoding: { y: { field: "min" }, color: { value: "red" } },
          },
        ],
      },
    ],
  };

  const layer = parseLayer(input, { values: [] }, {}, 10);

  expect(layer).toHaveLength(4);
});