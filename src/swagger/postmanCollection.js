const fs = require("fs");
const path = require("path");
const swagger = require("./swagger");

const collection = {
  info: {
    name: swagger.info.title,
    schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  item: Object.entries(swagger.paths).flatMap(([url, methods]) =>
    Object.entries(methods).map(([method, operation]) => ({
      name: operation.summary || `${method.toUpperCase()} ${url}`,
      request: {
        method: method.toUpperCase(),
        header: [{ key: "Content-Type", value: "application/json" }],
        url: {
          raw: `{{baseUrl}}${url}`,
          host: ["{{baseUrl}}"],
          path: url.replace(/^\//, "").split("/")
        }
      }
    }))
  )
};

const outputPath = path.join(process.cwd(), "Rangstone-Tourism.postman_collection.json");
fs.writeFileSync(outputPath, JSON.stringify(collection, null, 2));
console.log(`Postman collection written to ${outputPath}`);
