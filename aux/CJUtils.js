module.exports = {
    CJ: function () {
        collection = {};
        collection.version = "1.0";
        collection.href = "";

        collection.links = [];

        collection.items = [];
        collection.queries = [];

        return collection;

    },
    buildLink: function (prompt, rel, href) {
        return {
            prompt,
            rel,
            href
        }
    }
}
