cmake_minimum_required(VERSION 3.23)
project(database)

set(CMAKE_CXX_STANDARD 20)

add_executable(database main.cpp src/net/Client.cpp src/net/Client.h src/net/Server.cpp src/net/Server.h)
