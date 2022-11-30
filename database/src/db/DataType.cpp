//
// Created by Maximilian Mittelhammer on 30.11.22.
//

#include "DataType.h"

Integer::Integer(int value): value(value) {}

int Integer::getValue() const {
    return this->value;
}

void Integer::setValue(int val) {
    this->value = val;
}

size_t Integer::getSize() const {
    return 4;
}

DataType Integer::getType() const {
    return DataType::INTEGER;
}

Varchar::Varchar(std::string val, size_t size): value(std::move(val)), size(size) {}

std::string Varchar::getValue() const {
    return this->value;
}

void Varchar::setValue(std::string val) {
    this->value = std::move(val);
}

size_t Varchar::getSize() const {
    return this->size;
}

DataType Varchar::getType() const {
    return DataType::VARCHAR;
}