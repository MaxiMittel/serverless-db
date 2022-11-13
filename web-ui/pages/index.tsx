import { faPlay } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button, Select, TextField, Tooltip, Option } from "@mui/joy";
import { Container } from "@mui/system";
import { useState } from "react";
import { CodeEditor } from "../components/Editor";
import { Footer } from "../components/Footer";
import { Header } from "../components/Header";
import { Table } from "../components/Table";
import styles from "../styles/Home.module.css";

export default function Home() {
  const [value, setValue] = useState("");
  const [repeat, setRepeat] = useState(1);
  const [technology, setTechnology] = useState("lambda");

  return (
    <div>
      <Header></Header>
      <Container>
        <div className={styles.actionRow}>
          <div className="flex-row">
            <Tooltip title="Repeat">
              <TextField
                type="number"
                value={repeat}
                onChange={(e) => setRepeat(parseInt(e.target.value))}
                style={{ width: "100px" }}
              ></TextField>
            </Tooltip>
            <Select
              value={technology}
              onChange={(e, value) => setTechnology(value || "lambda")}
              style={{ width: "150px" }}
            >
              <Option value="lambda">Lambda</Option>
              <Option value="ec2">EC2</Option>
              <Option value="cluster">EC2-Cluster</Option>
            </Select>
          </div>
          <Button>
            <FontAwesomeIcon icon={faPlay} height={12} />
            &emsp;Run
          </Button>
        </div>
        <CodeEditor value={value} onChange={setValue}></CodeEditor>
        <Table titles={["id", "name", "age"]}>
          <tr>
            <td>1</td>
            <td>John</td>
            <td>20</td>
          </tr>
        </Table>
      </Container>
      <Footer></Footer>
    </div>
  );
}
