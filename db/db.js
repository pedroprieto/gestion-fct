let users = [
    {
        name: "test",
        password: "$2a$10$n6aq.wD2JoHgO5BrvMmJnORuWxzZA5l4xAXUelcTj3FjW9He.YF56" // 1234
    }
];


module.exports = {
    async getUser(username) {
        return users.find(user => user.name == username);
    },
    async saveUser(user) {
        let foundUser = users.find(user => user.name == username);
        if (foundUser) {
            foundUser.name = user.name;
            foundUser.password = user.password;
        } else {
            users.push({
                name: user.name,
                password: user.password
            });
        }
    },
}
