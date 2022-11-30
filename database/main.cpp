#include <iostream>
#include "src/net/Server.h"
#include <nlohmann/json.hpp>
using json = nlohmann::json;

int main() {
    Server server(4000, "0.0.0.0");
    server.bind();

    while (true) {
        int client_socket = server.accept();
        std::string message = server.receive(client_socket);
        std::cout << "Received: " << message << std::endl;
        json j = json::parse(message);
        std::cout << j["name"] << ": " << j["age"] << std::endl;
        server.send(client_socket, "Hello from server");
        server.close(client_socket);
    }
    return 0;
}
