import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import env from "./env.js";

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Organic Ecommerce API",
            version: "1.0.0",
            description: "API documentation for the organic ecommerce backend"
        },
        servers: [
            {
                url: `http://localhost:${env.PORT}/api`,
                description: "Development Server"
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT"
                }
            }
        },
        security: [
            {
                bearerAuth: []
            }
        ]
    },
    apis: ["./src/routes.js", "./src/modules/**/*.routes.js"] // Path to the API docs
};

const specs = swaggerJsdoc(options);

export const swaggerDocs = (app, port) => {
    // Swagger page
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

    // Docs in JSON format
    app.get("/api-docs.json", (req, res) => {
        res.setHeader("Content-Type", "application/json");
        res.send(specs);
    });

    console.log(
        `Docs available at http://localhost:${port}/api-docs`
    );
};
