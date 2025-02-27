import * as d3 from "d3";
import { useEffect, useRef } from "react";

const CandlestickChart = ({ stockLiveDetail }) => {
  const chartContainerRef = useRef(null);

  useEffect(() => {
    if (!stockLiveDetail || stockLiveDetail.length === 0) {
      console.log("Stock data is empty or missing.");
      return;
    }

    const margin = { top: 20, right: 30, bottom: 30, left: 50 };
    const width = 600 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    d3.select(chartContainerRef.current).selectAll("*").remove();

    const svg = d3
      .select(chartContainerRef.current)
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const xScale = d3
      .scaleBand()
      .domain(stockLiveDetail.map((d) => d.date))
      .range([0, width])
      .padding(0.2);

    const yScale = d3
      .scaleLinear()
      .domain([
        d3.min(stockLiveDetail, (d) => d.low),
        d3.max(stockLiveDetail, (d) => d.high),
      ])
      .range([height, 0]);

    svg
      .append("g")
      .attr("transform", `translate(0,${height})`)
      .call(
        d3
          .axisBottom(xScale)
          .tickFormat((d) => d3.timeFormat("%b %d")(new Date(d)))
      );

    svg.append("g").call(d3.axisLeft(yScale));

    svg
      .selectAll("line.stem")
      .data(stockLiveDetail)
      .enter()
      .append("line")
      .attr("class", "stem")
      .attr("x1", (d) => xScale(d.date) + xScale.bandwidth() / 2)
      .attr("x2", (d) => xScale(d.date) + xScale.bandwidth() / 2)
      .attr("y1", (d) => yScale(d.high))
      .attr("y2", (d) => yScale(d.low))
      .attr("stroke", "black");

    svg
      .selectAll("rect.candle")
      .data(stockLiveDetail)
      .enter()
      .append("rect")
      .attr("class", "candle")
      .attr("x", (d) => xScale(d.date))
      .attr("y", (d) => yScale(Math.max(d.open, d.close)))
      .attr("width", xScale.bandwidth())
      .attr("height", (d) => Math.abs(yScale(d.open) - yScale(d.close)))
      .attr("fill", (d) => (d.close > d.open ? "green" : "red"));

    const tooltip = d3
      .select(chartContainerRef.current)
      .append("div")
      .style("position", "absolute")
      .style("visibility", "hidden")
      .style("background", "#fff")
      .style("border", "1px solid #ccc")
      .style("padding", "5px")
      .style("border-radius", "5px")
      .style("font-size", "12px");

    svg
      .selectAll("rect.candle")
      .on("mouseover", (event, d) => {
        tooltip
          .html(
            `Date: ${d3.timeFormat("%Y-%m-%d")(new Date(d.date))}<br>Open: ${
              d.open
            }<br>High: ${d.high}<br>Low: ${d.low}<br>Close: ${d.close}`
          )
          .style("visibility", "visible");
      })
      .on("mousemove", (event) => {
        tooltip
          .style("top", `${event.pageY - 20}px`)
          .style("left", `${event.pageX + 10}px`);
      })
      .on("mouseout", () => {
        tooltip.style("visibility", "hidden");
      });
  }, [stockLiveDetail]);

  return (
    <div ref={chartContainerRef} style={{ width: "600px", height: "400px" }} />
  );
};

export default CandlestickChart;
