import React from "react";
import "./styles.css";
import data from "./data.json";
import { useTable, useSortBy } from "./useTable";

const Table1 = () => {
  return (
    <div className="App">
      <h1>Hello CodeSandbox</h1>
      <h2>Start editing to see some magic happen!</h2>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr>
              <td key={index}>{item.name}</td>
              <td>{item.approval_date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const Table2 = () => {
  const { rows, headers } = useTable(
    {
      data,
      columns: [
        {
          header: "Name",
          cell: (row) => <p>{`${row.name}`}</p>,
          accessor: "name"
        },
        {
          header: "Date",
          accessor: "approval_date"
        }
      ]
    },
    useSortBy
  );

  console.log(rows.length);

  return (
    <table>
      <thead>
        <tr>
          {headers.map((header, index) => (
            <th key={index} {...header.getHeaderProps()}>
              {header.render()}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, index) => (
          <tr>
            {row.cells.map((cell, j) => (
              <td key={j}>{cell.render()}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default function App() {
  return (
    <div className="App">
      <h1>Hello CodeSandbox</h1>
      <Table2 />
    </div>
  );
}
