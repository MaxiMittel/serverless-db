cmake_minimum_required(VERSION 3.23)
include(FetchContent)
project(database)

set(CMAKE_CXX_STANDARD 20)

FetchContent_Declare(json URL https://github.com/nlohmann/json/releases/download/v3.11.2/json.tar.xz)
FetchContent_MakeAvailable(json)

add_executable(database main.cpp src/net/Client.cpp src/net/Client.h src/net/Server.cpp src/net/Server.h src/db/Table.cpp src/db/Table.h src/db/DataType.cpp src/db/DataType.h)
target_link_libraries(database PRIVATE nlohmann_json::nlohmann_json)
