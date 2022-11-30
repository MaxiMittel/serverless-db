//
// Created by Maximilian Mittelhammer on 30.11.22.
//

#ifndef DATABASE_DATATYPE_H
#define DATABASE_DATATYPE_H

#include <cstddef>
#include <string>

enum class DataType {
    INTEGER,
    VARCHAR
};

class DataEntry {
public:
    /**
     * Returns the stored value
     * @return Stored value
     */
    template<typename T> T getValue() const;

    /**
     * Sets the value of the data type
     * @tparam T The type of the value
     * @param value The value to set
     */
    template<typename T> void setValue(T value);

    /**
     * Returns the size of the data type in bytes
     * @return Size of the data type in bytes
     */
    [[nodiscard]] virtual size_t getSize() const = 0;

    /**
     * Returns the data type
     * @return Data type
     */
    [[nodiscard]] virtual DataType getType() const = 0;
};

template<typename T>
T DataEntry::getValue() const {
    return nullptr;
}

template<typename T>
void DataEntry::setValue(T value) {}

class Integer : public DataEntry {
private:
    int value;
public:
    explicit Integer(int val);

    /**
     * Returns the stored value
     * @return Stored value
     */
    int getValue() const;

    /**
     * Sets the value of the data type
     * @param value The value to set
     */
    void setValue(int val);

    /**
     * Returns the size of the data type in bytes
     * @return Size of an Integer in bytes (4)
     */
    [[nodiscard]] size_t getSize() const override;

    /**
     * Returns the data type
     * @return Data type
     */
    [[nodiscard]] DataType getType() const override;
};

class Varchar : public DataEntry {
private:
    std::string value;
    size_t size;
public:
    explicit Varchar(std::string val, size_t size);

    /**
     * Returns the stored value
     * @return Stored value
     */
    std::string getValue() const;

    /**
     * Sets the value of the data type
     * @param val The value to set
     */
    void setValue(std::string val);

    /**
     * Returns the size of the data type in bytes
     * @return Size of varchar in bytes (size)
     */
    [[nodiscard]] size_t getSize() const override;

    /**
     * Returns the data type
     * @return Data type
     */
    [[nodiscard]] DataType getType() const override;
};


#endif //DATABASE_DATATYPE_H
