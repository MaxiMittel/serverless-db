//
// Created by Maximilian Mittelhammer on 30.11.22.
//

#ifndef DATABASE_TABLE_H
#define DATABASE_TABLE_H

#include <string>
#include <vector>
#include "DataType.h"

struct Column {
    std::string name;
    DataType type;
};

enum JoinType {
    INNER,
    LEFT,
    RIGHT,
    FULL,
    CROSS
};

class Table {
private:
    std::string name;
    std::vector<Column> columns;
    // Items are stored in a vector of columns
    std::vector<std::vector<DataEntry>> items;
public:
    Table(std::string name, std::vector<Column> columns);

    /**
     * Returns the name of the table
     * @return Name of the table
     */
    [[nodiscard]] std::string getName() const;

    /**
     * Returns the columns of the table
     * @return Columns of the table
     */
    [[nodiscard]] std::vector<Column> getColumns() const;

    /**
     * Returns the items of the table
     * @return Items of the table
     */
    [[nodiscard]] std::vector<std::vector<DataEntry>> getItems() const;

    /**
     * Joins the table with another table
     * @param other The other table
     * @param type The type of join
     * @param leftColumn The column to join on
     * @param rightColumn The column to join on
     * @return Joined table
     */
    Table join(Table other, JoinType type, std::string leftColumn, std::string rightColumn) const;
};


#endif //DATABASE_TABLE_H
