import React from "react";
import styles from "../styles/Table.module.css";

interface Props {
  titles: string[];
  children: React.ReactNode;
}

export const Table: React.FC<Props> = (props) => {
  return (
    <table className={styles.tableContainer}>
      <thead className={styles.thead}>
        <tr>
          {props.titles.map((title, index) => (
            <th key={`thead-index-${index}`} className={styles.th}>
              {title}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className={styles.tbody}>{props.children}</tbody>
    </table>
  );
};
