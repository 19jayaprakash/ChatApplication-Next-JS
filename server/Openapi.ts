import { contract } from './contracts';
import { generateOpenApi } from '@ts-rest/open-api';

export const openApiDocument = generateOpenApi(contract, {
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