"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.openApiDocument = void 0;
const contracts_1 = require("./contracts");
const open_api_1 = require("@ts-rest/open-api");
exports.openApiDocument = (0, open_api_1.generateOpenApi)(contracts_1.contract, {
    info: {
        title: 'Posts API',
        version: '1.0.0',
    },
    // components: {
    //   securitySchemes: {
    //     BearerAuth: {
    //       type: "apiKey",
    //       name: "Authorization",
    //       in: "header",
    //     },
    //   },
    // },
    // security: [
    //   {
    //     BearerAuth: [],
    //   },
    // ],
});
