import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDatabase } from "@fortawesome/free-solid-svg-icons";
import styles from "../styles/Header.module.css";

interface Props {}

export const Header: React.FC<Props> = (props) => {
  return (
    <nav className={styles.container}>
      <FontAwesomeIcon icon={faDatabase} height={12}/>
    </nav>
  );
};
