//
// Created by Maximilian Mittelhammer on 30.11.22.
//

#include "Table.h"

Table::Table(std::string name, std::vector<Column> columns): name(std::move(name)), columns(std::move(columns)) {}

std::string Table::getName() const {
    return this->name;
}

std::vector<Column> Table::getColumns() const {
    return this->columns;
}

std::vector<std::vector<DataEntry>> Table::getItems() const {
    // TODO: Get items from file
    return std::vector<std::vector<DataEntry>>();
}

Table Table::join(Table other, JoinType type, std::string leftColumn, std::string rightColumn) const {
    return Table(__1::basic_string(), __1::vector());
}
