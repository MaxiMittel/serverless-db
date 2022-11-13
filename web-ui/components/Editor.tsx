import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDatabase } from "@fortawesome/free-solid-svg-icons";
import styles from "../styles/Editor.module.css";
import Editor from "@monaco-editor/react";

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export const CodeEditor: React.FC<Props> = (props) => {
  return (
    <Editor
      height="200px"
      width="100%"
      defaultLanguage="sql"
      defaultValue="SELECT * FROM table"
      className={styles.editor}
    />
  );
};
