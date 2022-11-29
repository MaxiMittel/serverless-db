//
// Created by Maximilian Mittelhammer on 29.11.22.
//

#ifndef DATABASE_CLIENT_H
#define DATABASE_CLIENT_H

#include <string>

class Client {
private:
    int socket{};
    int port;
    std::string address;
public:
    Client(int port, std::string address);
    ~Client();

    /**
     * Connects to the server
     */
    void connect();

    /**
     * Closes the connection to the server
     */
    void disconnect() const;

    /**
     * Sends a message to the server
     * @param message The message to send
     */
    void send(const std::string& message) const;

    /**
     * Receives a message from the server
     * @return Message from the server
     */
    [[nodiscard]] std::string receive() const;
};

#endif //DATABASE_CLIENT_H
